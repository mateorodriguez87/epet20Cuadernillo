
// Hooks de React: useState para los datos de la pantalla y useEffect para el temporizador de la fecha
import { useEffect, useState } from "react";

// NavLink arma los links del menú y permite navegar entre las pantallas
import { NavLink, useNavigate } from "react-router-dom";

// Permite detectar y cerrar la sesión de Firebase
import { onAuthStateChanged, signOut } from "firebase/auth";

// Funciones de Firestore para consultar las comunicaciones
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

// Conexión con Firebase
import { db, auth } from "../firebase";
// Icono proveniente de la Biblioteca Lucide-React
import { House, Presentation, UserRoundGroup, Bell, RotateCcwClock} from 'lucide-react';

// Estilos de esta pantalla
import "../estilos/historialpreceptor.css";

// Pantalla de historial de comunicaciones del preceptor. Ahora lee los datos desde Firebase
function HistorialPreceptor() {

  // fecha: la de hoy, para el encabezado
  // curso, alumno, fechaDesde y fechaHasta: lo que se elige en los filtros
  const [fecha, setFecha] = useState(new Date());
  const [curso, setCurso] = useState("");
  const [alumno, setAlumno] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Permite navegar entre las páginas sin recargar todo el sitio
  const navigate = useNavigate();

  // Guarda las comunicaciones obtenidas desde Firebase
  const [comunicaciones, setComunicaciones] = useState([]);

  // Guarda los cursos y alumnos para poder mostrar sus datos y filtrar
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);

  // Guarda los datos del preceptor que inició sesión
  const [preceptor, setPreceptor] = useState(null);

  // Indica si hay una sesión iniciada
  const [sesionIniciada, setSesionIniciada] = useState(false);

  // Indica si Firebase está comprobando la sesión
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  // Indica si se están cargando los datos
  const [cargando, setCargando] = useState(true);

  // Guarda los mensajes de error
  const [error, setError] = useState("");

  // Guarda los filtros aplicados
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    curso: "",
    alumno: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  // Controla la página actual de la tabla
  const [paginaActual, setPaginaActual] = useState(1);

  // Cantidad de comunicaciones que se muestran por página
  const comunicacionesPorPagina = 8;

  // Cada minuto se vuelve a leer la fecha, para que el encabezado no quede desactualizado
  useEffect(() => {
    // Se ejecuta cada 60000 milisegundos (un minuto)
    const intervalo = setInterval(() => {
      setFecha(new Date());
    }, 60000);

    // Al salir de la pantalla se frena el temporizador
    return () => clearInterval(intervalo);
  }, []);

  // Fecha lista para mostrar, en español de Argentina (día de la semana, día, mes y año)
  const fechaFormateada = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Convierte una fecha de Firestore en un objeto Date
  function convertirFecha(valor) {
    if (!valor) return null;

    // Los campos Timestamp de Firestore tienen el método toDate()
    if (typeof valor.toDate === "function") {
      return valor.toDate();
    }

    // También permite trabajar con fechas guardadas como texto
    const fechaConvertida = new Date(valor);

    return Number.isNaN(fechaConvertida.getTime())
      ? null
      : fechaConvertida;
  }

  // Convierte una fecha a un formato legible en español
  function formatearFecha(valor) {
    const fechaConvertida = convertirFecha(valor);

    if (!fechaConvertida) return "Sin fecha";

    return fechaConvertida.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Busca el nombre del alumno relacionado con una comunicación
  function obtenerAlumno(comunicacion) {
    const alumnoEncontrado = alumnos.find(
      (item) => item.id === comunicacion.alumnoId
    );

    return (
      comunicacion.alumnoNombre ||
      alumnoEncontrado?.nombre ||
      "Alumno sin nombre"
    );
  }

  // Busca el curso al que pertenece el alumno de una comunicación
  function obtenerCurso(comunicacion) {
    const alumnoEncontrado = alumnos.find(
      (item) => item.id === comunicacion.alumnoId
    );

    const cursoEncontrado = cursos.find(
      (item) => item.id === alumnoEncontrado?.cursoId
    );

    if (cursoEncontrado) {
      return `${cursoEncontrado.curso}.º ${cursoEncontrado.division}`;
    }

    return alumnoEncontrado?.curso || "Sin curso";
  }

  // Carga los datos del preceptor, cursos, alumnos y comunicaciones
  useEffect(() => {
    let activo = true;

    const cancelarSuscripcion = onAuthStateChanged(auth, async (usuario) => {
      setSesionIniciada(!!usuario);

      if (!usuario) {
        setPreceptor(null);
        setComunicaciones([]);
        setCursos([]);
        setAlumnos([]);
        setCargando(false);
        setVerificandoSesion(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        // Busca los datos del preceptor en la colección usuarios
        const referenciaPreceptor = doc(db, "usuarios", usuario.uid);
        const documentoPreceptor = await getDoc(referenciaPreceptor);

        if (!documentoPreceptor.exists()) {
          throw new Error("No se encontraron los datos del preceptor.");
        }

        const datosPreceptor = {
          id: documentoPreceptor.id,
          ...documentoPreceptor.data(),
        };

        // Obtiene todos los cursos
        const resultadoCursos = await getDocs(
          collection(db, "Cursos")
        );

        const cursosObtenidos = resultadoCursos.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        // Obtiene todos los alumnos
        const resultadoAlumnos = await getDocs(
          collection(db, "Alumnos")
        );

        const alumnosObtenidos = resultadoAlumnos.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        // Obtiene las comunicaciones guardadas en Firestore
        const resultadoNotificaciones = await getDocs(
          collection(db, "Notificaciones")
        );

        // Convierte los documentos en objetos y muestra solo los enviados por este preceptor
        const comunicacionesObtenidas = resultadoNotificaciones.docs
          .map((documento) => ({
            id: documento.id,
            ...documento.data(),
          }))
          .filter(
            (comunicacion) =>
              comunicacion.preceptorId === usuario.uid
          );

        if (activo) {
          setPreceptor(datosPreceptor);
          setCursos(cursosObtenidos);
          setAlumnos(alumnosObtenidos);
          setComunicaciones(comunicacionesObtenidas);
        }

      } catch (error) {
        console.error("Error al cargar el historial:", error);

        if (activo) {
          setError(
            "No se pudo cargar el historial. Revisá la conexión con Firebase."
          );
        }

      } finally {
        if (activo) {
          setCargando(false);
          setVerificandoSesion(false);
        }
      }
    });

    // Al salir de la pantalla se deja de escuchar el estado de la sesión
    return () => {
      activo = false;
      cancelarSuscripcion();
    };
  }, []);

  // Obtiene los cursos asignados al preceptor
  const cursosDelPreceptor = cursos.filter((item) =>
    (preceptor?.cursosIds || []).includes(item.id)
  );

  // Obtiene los alumnos que pertenecen a los cursos del preceptor
  const alumnosDelPreceptor = alumnos.filter((item) =>
    (preceptor?.cursosIds || []).includes(item.cursoId)
  );

  // Aplica los filtros seleccionados sobre las comunicaciones
  const comunicacionesFiltradas = comunicaciones.filter((comunicacion) => {
    const alumnoRelacionado = alumnos.find(
      (item) => item.id === comunicacion.alumnoId
    );

    // Filtro por curso
    if (
      filtrosAplicados.curso &&
      alumnoRelacionado?.cursoId !== filtrosAplicados.curso
    ) {
      return false;
    }

    // Filtro por alumno
    if (
      filtrosAplicados.alumno &&
      comunicacion.alumnoId !== filtrosAplicados.alumno
    ) {
      return false;
    }

    // Obtiene la fecha de la comunicación
    const fechaComunicacion = convertirFecha(
      comunicacion.fechaEnvio || comunicacion.creadoEn
    );

    // Filtro de fecha desde
    if (filtrosAplicados.fechaDesde) {
      if (!fechaComunicacion) return false;

      const desde = new Date(`${filtrosAplicados.fechaDesde}T00:00:00`);

      if (fechaComunicacion < desde) return false;
    }

    // Filtro de fecha hasta
    if (filtrosAplicados.fechaHasta) {
      if (!fechaComunicacion) return false;

      const hasta = new Date(`${filtrosAplicados.fechaHasta}T23:59:59.999`);

      if (fechaComunicacion > hasta) return false;
    }

    return true;
  });

  // Ordena las comunicaciones desde la más reciente hasta la más antigua
  const comunicacionesOrdenadas = [...comunicacionesFiltradas].sort(
    (a, b) => {
      const fechaA = convertirFecha(a.creadoEn || a.fechaEnvio);
      const fechaB = convertirFecha(b.creadoEn || b.fechaEnvio);

      return (fechaB?.getTime() || 0) - (fechaA?.getTime() || 0);
    }
  );

  // Calcula la cantidad de páginas necesarias
  const totalPaginas = Math.max(
    1,
    Math.ceil(comunicacionesOrdenadas.length / comunicacionesPorPagina)
  );

  // Obtiene las comunicaciones correspondientes a la página actual
  const indiceInicial = (paginaActual - 1) * comunicacionesPorPagina;

  const comunicacionesPaginadas = comunicacionesOrdenadas.slice(
    indiceInicial,
    indiceInicial + comunicacionesPorPagina
  );

  // Ejecuta los filtros seleccionados
  function filtrarHistorial() {
    setFiltrosAplicados({
      curso,
      alumno,
      fechaDesde,
      fechaHasta,
    });

    setPaginaActual(1);
  }

  // Limpia todos los filtros
  function limpiarFiltros() {
    setCurso("");
    setAlumno("");
    setFechaDesde("");
    setFechaHasta("");

    setFiltrosAplicados({
      curso: "",
      alumno: "",
      fechaDesde: "",
      fechaHasta: "",
    });

    setPaginaActual(1);
  }

  // Muestra los detalles de una comunicación
  function verComunicacion(comunicacion) {
    const alumnoNombre = obtenerAlumno(comunicacion);

    const detalles = `
Alumno: ${alumnoNombre}

Curso: ${obtenerCurso(comunicacion)}

Asunto: ${comunicacion.asunto || "Sin asunto"}

Mensaje: ${comunicacion.mensaje || "Sin mensaje"}

Prioridad: ${comunicacion.prioridad || "normal"}

Fecha: ${formatearFecha(
      comunicacion.fechaEnvio || comunicacion.creadoEn
    )}

Estado: ${comunicacion.leida ? "Leída" : "Pendiente de lectura"}
    `;

    alert(detalles);
  }

  // Lleva a /login si no hay una sesión iniciada
  function iniciarSesion() {
    navigate("/login");
  }

  // Cierra la sesión real de Firebase y lleva a /login
  async function cerrarSesion() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar la sesión. Intentá nuevamente.");
    }
  }

  // Desde acá empieza lo que se dibuja en pantalla
  return (
    <div className="historial-pagina">
      {/* PANEL LATERAL */}
      <aside className="historial-sidebar">
        <div className="historial-logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        {/* Menú: NavLink pone la clase "activo" solo en la opción que coincide con la ruta actual (isActive); "end" pide que la ruta coincida exacta */}
        <nav className="historial-menu">
          <NavLink
            to="/preceptor"
            end
            className={({ isActive }) =>
              `historial-menu-item ${isActive ? "activo" : ""}`
            }
          >
           <House className="menu-icon" size={20} />
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/cursospreceptor"
            className={({ isActive }) =>
              `historial-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <Presentation className="menu-icon" size={20}/>
            <span>Cursos</span>
          </NavLink>

          <NavLink
            to="/alumnospreceptor"
            className={({ isActive }) =>
              `historial-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <UserRoundGroup className="menu-icon" size={20}/>
            <span>Alumnos</span>
          </NavLink>

          <NavLink
            to="/notificacionpreceptor"
            className={({ isActive }) =>
              `historial-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <Bell className="menu-icon" size={20}/>
           <span>Notificaciones</span>
          </NavLink>

          <NavLink
            to="/historialpreceptor"
            end
            className={({ isActive }) =>
              `historial-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <RotateCcwClock className="menu-icon" size={20}/>
            <span>Historial</span>
          </NavLink>
        </nav>

        {/* Cerrar sesión: ahora cierra la sesión real de Firebase */}
        <button
          type="button"
          className="historial-cerrar-sesion"
          onClick={sesionIniciada ? cerrarSesion : iniciarSesion}
          disabled={verificandoSesion}
        >
          <span className="historial-icono">⇥</span>
          <span>
            {verificandoSesion
              ? "Comprobando..."
              : sesionIniciada
              ? "Cerrar sesión"
              : "Iniciar sesión"}
          </span>
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="historial-contenido">
        {/* Encabezado: título a la izquierda, fecha y botón de login a la derecha */}
        <header className="historial-header">
          <div className="historial-titulo">
            <h1>
              <span className="historial-titulo-icono">▤</span>
              Historial
            </h1>

            <p>Inicio &nbsp;›&nbsp; Historial</p>
          </div>

          <div className="historial-header-derecha">
            {/* Fecha de hoy (viene del estado fecha) */}
            <div className="historial-fecha">
              <span>▦</span>
              <p>{fechaFormateada}</p>
            </div>

            {/* Botón que cambia según el estado de la sesión */}
            <button
              type="button"
              className="historial-login"
              onClick={sesionIniciada ? cerrarSesion : iniciarSesion}
              disabled={verificandoSesion}
            >
              {verificandoSesion
                ? "Comprobando..."
                : sesionIniciada
                ? "Cerrar sesión"
                : "Iniciar sesión"}

              <span>↗</span>
            </button>
          </div>
        </header>

        {/* TÍTULO DE SECCIÓN */}
        <section className="historial-introduccion">
          <h2>Historial de comunicaciones</h2>
          <p>
            Consultá las comunicaciones realizadas y sus estados.
          </p>
        </section>

        {/* FILTROS */}
        <section className="historial-filtros">
          {/* Curso: las opciones salen de los cursos asignados al preceptor */}
          <div className="historial-campo">
            <label htmlFor="filtro-curso">Curso</label>

            <select
              id="filtro-curso"
              value={curso}
              onChange={(e) => {
                setCurso(e.target.value);
                setAlumno("");
              }}
            >
              <option value="">Todos los cursos</option>

              {cursosDelPreceptor.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.curso}.º {item.division}
                </option>
              ))}
            </select>
          </div>

          {/* Alumno: las opciones salen de los alumnos asignados al preceptor */}
          <div className="historial-campo">
            <label htmlFor="filtro-alumno">Alumno</label>

            <select
              id="filtro-alumno"
              value={alumno}
              onChange={(e) => setAlumno(e.target.value)}
            >
              <option value="">Todos los alumnos</option>

              {alumnosDelPreceptor
                .filter((item) =>
                  !curso || item.cursoId === curso
                )
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
            </select>
          </div>

          {/* Fecha desde */}
          <div className="historial-campo">
            <label htmlFor="fecha-desde">Fecha desde</label>

            <input
              id="fecha-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          {/* Fecha hasta (junto con la anterior forma el rango de fechas) */}
          <div className="historial-campo">
            <label htmlFor="fecha-hasta">Fecha hasta</label>

            <input
              id="fecha-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>

          {/* "Filtrar" aplica los filtros seleccionados */}
          <button
            type="button"
            className="historial-filtrar"
            onClick={filtrarHistorial}
          >
            <span>⌕</span>
            Filtrar
          </button>

          {/* Permite volver a mostrar todas las comunicaciones */}
          <button
            type="button"
            className="historial-filtrar"
            onClick={limpiarFiltros}
          >
            Limpiar
          </button>
        </section>

        {/* TABLA DE HISTORIAL */}
        <section className="historial-tabla-panel">
          {/* Si la tabla no entra en pantalla, el scroll horizontal aparece solo acá adentro */}
          <div className="historial-tabla-scroll">
            <table className="historial-tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Alumno</th>
                  <th>Asunto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              {/* Muestra los datos obtenidos desde Firebase */}
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="historial-vacio">
                        <h3>Cargando comunicaciones...</h3>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="historial-vacio">
                        <h3>{error}</h3>
                      </div>
                    </td>
                  </tr>
                ) : comunicacionesPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      {/* Mensaje de "No hay comunicaciones registradas" */}
                      <div className="historial-vacio">
                        <div className="historial-vacio-icono">
                          ▤
                        </div>

                        <h3>
                          No hay comunicaciones registradas
                        </h3>

                        <p>
                          Cuando se realicen comunicaciones,
                          aparecerán acá para que puedas consultar
                          su historial.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  comunicacionesPaginadas.map((comunicacion) => (
                    <tr key={comunicacion.id}>
                      <td>
                        {formatearFecha(
                          comunicacion.fechaEnvio ||
                          comunicacion.creadoEn
                        )}
                      </td>

                      <td>{obtenerAlumno(comunicacion)}</td>

                      <td>
                        {comunicacion.asunto || "Sin asunto"}
                      </td>

                      <td>
                        <span
                          className={`estado-etiqueta ${
                            comunicacion.leida ? "listo" : "incompleto"
                          }`}
                        >
                          {comunicacion.leida
                            ? "Leída"
                            : "Pendiente"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="historial-filtrar"
                          onClick={() =>
                            verComunicacion(comunicacion)
                          }
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación de abajo de la tabla */}
          <div className="historial-paginacion">
            <span>
              Mostrando {comunicacionesFiltradas.length === 0
                ? 0
                : indiceInicial + 1}
              {" "}a{" "}
              {Math.min(
                indiceInicial + comunicacionesPorPagina,
                comunicacionesOrdenadas.length
              )}
              {" "}de {comunicacionesOrdenadas.length} comunicaciones
            </span>

            <div className="historial-paginas">
              <button
                type="button"
                disabled={paginaActual === 1}
                onClick={() =>
                  setPaginaActual((pagina) => Math.max(1, pagina - 1))
                }
              >
                ← Anterior
              </button>

              <button
                type="button"
                className="pagina-actual"
                disabled
              >
                {paginaActual}
              </button>

              <button
                type="button"
                disabled={paginaActual >= totalPaginas}
                onClick={() =>
                  setPaginaActual((pagina) =>
                    Math.min(totalPaginas, pagina + 1)
                  )
                }
              >
                Siguiente →
              </button>
            </div>
          </div>
        </section>

        {/* Pie de la pantalla */}
        <footer className="historial-footer">
          Cuaderno de Comunicaciones Digital · EPET 20
        </footer>
      </main>
    </div>
  );
}

export default HistorialPreceptor;
