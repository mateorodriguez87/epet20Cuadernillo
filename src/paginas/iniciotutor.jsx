
// Hooks de React: useState para los datos de la pantalla y useEffect para cargar la información
import { useEffect, useState } from "react";

// NavLink arma los links del menú y marca el activo; Link es un enlace común
import { NavLink, Link, useNavigate } from "react-router-dom";

// Permite detectar y cerrar la sesión de Firebase
import { onAuthStateChanged, signOut } from "firebase/auth";

// Funciones de Firestore para consultar los datos
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

// Conexión con Firebase
import { auth, db } from "../firebase";

// Estilos de esta pantalla
import "../estilos/iniciotutor.css";

// Pantalla de inicio del tutor: saludo, tarjeta del alumno, últimas notificaciones, datos del alumno y un mensaje final
function InicioTutor() {

  // Datos de la pantalla: se completan con la información obtenida desde Firebase
  const [nombreTutor, setNombreTutor] = useState("");
  const [fecha, setFecha] = useState(new Date());

  // Lista de alumnos relacionados con el tutor
  const [alumnos, setAlumnos] = useState([]);

  // Alumno seleccionado por el tutor
  const [alumnoId, setAlumnoId] = useState("");

  // Datos del alumno seleccionado
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  // Lista de notificaciones recibidas por el tutor
  const [notificaciones, setNotificaciones] = useState([]);

  // Datos del preceptor relacionado con el alumno
  const [nombrePreceptor, setNombrePreceptor] = useState("");

  // Controla el estado de la sesión
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  // Indica si se están cargando los datos
  const [cargando, setCargando] = useState(true);

  // Mensajes de error
  const [error, setError] = useState("");

  // Permite navegar entre las páginas sin recargar todo el sitio
  const navigate = useNavigate();

  // Estilo visual de cada tipo de notificación
  const tipos = {
    // En cada tipo, el "color" es el nombre de la clase CSS (rojo, naranja, azul o verde)
    inasistencia: { icono: "!", color: "rojo" },
    conducta: { icono: "▤", color: "naranja" },
    nota: { icono: "✎", color: "azul" },
    aviso: { icono: "♧", color: "verde" },
    normal: { icono: "♧", color: "verde" },
    importante: { icono: "!", color: "rojo" },
  };

  // Cantidad de notificaciones sin leer: las que no tienen leida en true
  const sinLeer = notificaciones.filter(
    (n) => !n.leida
  ).length;

  // Solo las 4 primeras notificaciones, para la tarjeta de "Últimas notificaciones"
  const ultimas = [...notificaciones]
    .sort((a, b) => {
      const fechaA = convertirFecha(a.creadoEn || a.fechaEnvio);
      const fechaB = convertirFecha(b.creadoEn || b.fechaEnvio);

      return (fechaB?.getTime() || 0) - (fechaA?.getTime() || 0);
    })
    .slice(0, 4);

  // Saca las iniciales del alumno, para mostrarlas cuando no tiene foto
  const iniciales = (nombre = "") =>
    nombre
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      // Se queda con las dos primeras letras (ejemplo: "Tomás Rojas" queda "TR")
      .join("")
      .slice(0, 2);

  // Convierte fechas de Firestore en objetos Date
  function convertirFecha(valor) {
    if (!valor) return null;

    if (typeof valor.toDate === "function") {
      return valor.toDate();
    }

    const fechaConvertida = new Date(valor);

    return Number.isNaN(fechaConvertida.getTime())
      ? null
      : fechaConvertida;
  }

  // Convierte la fecha a un formato legible
  function formatearFecha(valor) {
    const fechaConvertida = convertirFecha(valor);

    if (!fechaConvertida) return "Sin fecha";

    return fechaConvertida.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Cada minuto se actualiza la fecha del encabezado
  useEffect(() => {
    const intervalo = setInterval(() => {
      setFecha(new Date());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  // Fecha lista para mostrar, en español de Argentina
  const fechaFormateada = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Carga los datos del tutor, sus alumnos y sus notificaciones
  useEffect(() => {
    let activo = true;

    const cancelarSuscripcion = onAuthStateChanged(auth, async (usuario) => {
      setSesionIniciada(!!usuario);

      if (!usuario) {
        setNombreTutor("");
        setAlumnos([]);
        setAlumnoId("");
        setAlumnoSeleccionado(null);
        setNotificaciones([]);
        setCargando(false);
        setVerificandoSesion(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        // Busca los datos del tutor en la colección usuarios
        const referenciaTutor = doc(db, "usuarios", usuario.uid);
        const documentoTutor = await getDoc(referenciaTutor);

        if (!documentoTutor.exists()) {
          throw new Error("No se encontraron los datos del tutor.");
        }

        const datosTutor = documentoTutor.data();

        if (datosTutor.rol !== "tutor") {
          throw new Error("La cuenta no tiene asignado el rol de tutor.");
        }

        if (activo) {
          setNombreTutor(datosTutor.nombre || datosTutor.usuario || "");
        }

        // Obtiene los IDs de los alumnos asociados al tutor
        const hijosIds = Array.isArray(datosTutor.hijos)
          ? datosTutor.hijos
          : [];

        // Busca los alumnos en la colección Alumnos
        const resultadoAlumnos = await getDocs(
          collection(db, "Alumnos")
        );

        const alumnosObtenidos = resultadoAlumnos.docs
          .map((documento) => ({
            id: documento.id,
            ...documento.data(),
          }))
          .filter((alumno) => hijosIds.includes(alumno.id));

        // Obtiene las notificaciones dirigidas a este tutor
        const consultaNotificaciones = query(
          collection(db, "Notificaciones"),
          where("tutorId", "==", usuario.uid)
        );

        const resultadoNotificaciones = await getDocs(
          consultaNotificaciones
        );

        const notificacionesObtenidas = resultadoNotificaciones.docs.map(
          (documento) => ({
            id: documento.id,
            ...documento.data(),
          })
        );

        if (activo) {
          setAlumnos(alumnosObtenidos);
          setNotificaciones(notificacionesObtenidas);

          // Si el tutor tiene un solo hijo, se selecciona automáticamente
          if (alumnosObtenidos.length === 1) {
            setAlumnoId(alumnosObtenidos[0].id);
          } else if (alumnosObtenidos.length > 1) {
            setAlumnoId((idActual) =>
              alumnosObtenidos.some((alumno) => alumno.id === idActual)
                ? idActual
                : alumnosObtenidos[0].id
            );
          } else {
            setAlumnoId("");
          }
        }

      } catch (error) {
        console.error("Error al cargar el inicio del tutor:", error);

        if (activo) {
          setError(
            "No se pudieron cargar los datos. Revisá la conexión con Firebase."
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

  // Actualiza los datos del alumno cuando cambia la selección
  useEffect(() => {
    let activo = true;

    async function cargarAlumno() {
      const alumno = alumnos.find((item) => item.id === alumnoId);

      if (!alumno) {
        setAlumnoSeleccionado(null);
        setNombrePreceptor("");
        return;
      }

      setAlumnoSeleccionado(alumno);

      try {
        // Busca el curso al que pertenece el alumno
        let cursoNombre = alumno.curso || "";

        if (alumno.cursoId) {
          const referenciaCurso = doc(db, "Cursos", alumno.cursoId);
          const documentoCurso = await getDoc(referenciaCurso);

          if (documentoCurso.exists()) {
            const datosCurso = documentoCurso.data();

            cursoNombre = `${datosCurso.curso || ""} ${datosCurso.division || ""}`.trim();
          }
        }

        // Busca el preceptor asignado al curso del alumno
        let preceptorNombre = alumno.preceptor || "";

        if (!preceptorNombre && alumno.cursoId) {
          const consultaPreceptores = query(
            collection(db, "usuarios"),
            where("rol", "==", "preceptor"),
            where("cursosIds", "array-contains", alumno.cursoId)
          );

          const resultadoPreceptores = await getDocs(consultaPreceptores);

          if (!resultadoPreceptores.empty) {
            const datosPreceptor = resultadoPreceptores.docs[0].data();

            preceptorNombre = datosPreceptor.nombre || "";
          }
        }

        if (activo) {
          setAlumnoSeleccionado({
            ...alumno,
            curso: cursoNombre,
          });

          setNombrePreceptor(preceptorNombre);
        }

      } catch (error) {
        console.error("Error al cargar los datos del alumno:", error);

        if (activo) {
          setNombrePreceptor(alumno.preceptor || "");
        }
      }
    }

    cargarAlumno();

    return () => {
      activo = false;
    };
  }, [alumnoId, alumnos]);

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
    <div className="panel">

      {/* BARRA LATERAL */}
      <aside className="sidebar">

        <div className="logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        {/* Menú del tutor: NavLink pone la clase "activo" solo en la opción que coincide con la ruta actual (isActive); "end" pide que la ruta coincida exacta */}
        <nav className="menu">
          <NavLink
            to="/iniciotutor"
            end
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">⌂</span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/notificacionesrecibidas"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">♧</span>
            <span>Notificaciones recibidas</span>
          </NavLink>

          <NavLink
            to="/datosalumno"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">▤</span>
            <span>Datos del alumno</span>
          </NavLink>
        </nav>

        {/* Cerrar sesión: ahora cierra la sesión real de Firebase */}
        <button
          type="button"
          className="cerrar-sesion"
          onClick={sesionIniciada ? cerrarSesion : iniciarSesion}
          disabled={verificandoSesion}
        >
          <span className="logout-icon">⇥</span>
          <span>
            {verificandoSesion
              ? "Comprobando..."
              : sesionIniciada
              ? "Cerrar sesión"
              : "Iniciar sesión"}
          </span>
        </button>

      </aside>

      {/* CONTENIDO */}
      <main className="contenido">

        {/* ENCABEZADO */}
        {/* Saludo y fecha */}
        <header className="encabezado">
          <h1>
            Bienvenida{nombreTutor ? `, ${nombreTutor}` : ""}
          </h1>

          <p>{fechaFormateada}</p>
        </header>

        {/* Mensajes de carga o error */}
        {cargando && (
          <p>Cargando información...</p>
        )}

        {error && (
          <p className="campo-ayuda">{error}</p>
        )}

        {/* TARJETA DEL ALUMNO */}
        <section className="tarjeta-alumno">

          {/* Selector para tutores que tienen más de un hijo */}
          {alumnos.length > 1 && (
            <div className="campo">
              <label htmlFor="seleccionar-hijo">
                Seleccionar alumno
              </label>

              <select
                id="seleccionar-hijo"
                className="entrada"
                value={alumnoId}
                onChange={(e) => setAlumnoId(e.target.value)}
              >
                {alumnos.map((alumno) => (
                  <option key={alumno.id} value={alumno.id}>
                    {alumno.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Foto (o iniciales) y datos básicos del alumno */}
          <div className="alumno-info">

            <div className="foto-alumno">
              {/* Si el alumno tiene foto la muestra; si no, sus iniciales */}
              {alumnoSeleccionado?.foto ? (
                <img
                  src={alumnoSeleccionado.foto}
                  alt={alumnoSeleccionado.nombre}
                />
              ) : (
                iniciales(alumnoSeleccionado?.nombre || "")
              )}
            </div>

            {/* Los "—" aparecen mientras todavía no hay datos cargados */}
            <div className="alumno-datos">
              <span>Alumno</span>

              <strong>
                {alumnoSeleccionado?.nombre || "—"}
              </strong>

              <p>
                {alumnoSeleccionado?.curso || "—"}
              </p>

              <p>
                Legajo: {
                  alumnoSeleccionado?.legajo ||
                  alumnoSeleccionado?.dni ||
                  "—"
                }
              </p>
            </div>

          </div>

          {/* Tarjeta con la cantidad de notificaciones sin leer */}
          <div className="tarjeta sin-leer">

            <div className="icono-card rojo">
              ♧
            </div>

            <div className="info-card">
              <span>Notificaciones sin leer</span>

              <strong className="numero-rojo">
                {/* Si no hay notificaciones, muestra "—" en vez de 0 */}
                {notificaciones.length > 0 ? sinLeer : "—"}
              </strong>

              <Link to="/notificacionesrecibidas">
                ver todas
                <span> ›</span>
              </Link>
            </div>

          </div>

        </section>

        {/* ZONA CENTRAL */}
        <section className="zona-central">

          {/* ÚLTIMAS NOTIFICACIONES */}
          <div className="tarjeta notificaciones">

            <div className="titulo-seccion">
              <h2>Últimas notificaciones</h2>

              <Link to="/notificacionesrecibidas">
                Ver todas
              </Link>
            </div>

            {/* Si no hay notificaciones, muestra un mensaje de vacío; si hay, una fila por cada una */}
            {ultimas.length === 0 ? (
              <div className="sin-datos">
                No hay notificaciones
              </div>
            ) : (
              // Una fila por cada una de las últimas notificaciones
              ultimas.map((notificacion, index) => {
                // El tipo de la notificación define el ícono y el color
                const tipo =
                  tipos[notificacion.tipo || notificacion.prioridad] ||
                  tipos.aviso;

                return (
                  <div
                    className="notificacion"
                    key={notificacion.id || index}
                  >
                    <div className={`notificacion-icon ${tipo.color}`}>
                      {tipo.icono}
                    </div>

                    <div className="notificacion-texto">
                      <strong>
                        {notificacion.asunto || notificacion.titulo || "Notificación"}
                      </strong>

                      <span>
                        {notificacion.mensaje || notificacion.descripcion || ""}
                      </span>
                    </div>

                    <div className="notificacion-fecha">
                      {formatearFecha(
                        notificacion.fechaEnvio || notificacion.creadoEn
                      )}
                    </div>

                    {/* El puntito y la flecha de abajo solo aparecen si la notificación no está leída */}
                    <span className="punto">
                      {!notificacion.leida && <i></i>}
                    </span>

                    <span className="flecha">
                      {!notificacion.leida ? "›" : ""}
                    </span>
                  </div>
                );
              })
            )}

            {/* Link del final de la tarjeta, a la pantalla de notificaciones recibidas */}
            <Link
              to="/notificacionesrecibidas"
              className="ver-notificaciones"
            >
              Ver todas las notificaciones
            </Link>

          </div>

          {/* DATOS DEL ALUMNO */}
          <div className="tarjeta datos-alumno">

            <div className="titulo-seccion">
              <h2>Datos del alumno</h2>
            </div>

            {/* Cada dato del alumno: ícono y texto. Los "—" aparecen mientras no haya datos. Primero: nombre completo */}
            <div className="dato">

              <div className="icono-card azul">
                ♙
              </div>

              <div>
                <span>Nombre completo</span>
                <strong>
                  {alumnoSeleccionado?.nombre || "—"}
                </strong>
              </div>

            </div>

            {/* Curso */}
            <div className="dato">

              <div className="icono-card azul">
                🎓
              </div>

              <div>
                <span>Curso</span>
                <strong>
                  {alumnoSeleccionado?.curso || "—"}
                </strong>
              </div>

            </div>

            {/* Legajo */}
            <div className="dato">

              <div className="icono-card azul">
                ▤
              </div>

              <div>
                <span>Legajo</span>
                <strong>
                  {
                    alumnoSeleccionado?.legajo ||
                    alumnoSeleccionado?.dni ||
                    "—"
                  }
                </strong>
              </div>

            </div>

            {/* Preceptor */}
            <div className="dato">

              <div className="icono-card azul">
                ♙
              </div>

              <div>
                <span>Preceptor</span>
                <strong>
                  {nombrePreceptor || "—"}
                </strong>
              </div>

            </div>

            {/* Lleva a la pantalla de Datos del alumno */}
            <Link to="/datosalumno" className="ver-mas">
              Ver más información
              <span>›</span>
            </Link>

          </div>

        </section>

        {/* MENSAJE FINAL */}
        <section className="mensaje-final">

          <div className="check-verde">
            ✔
          </div>

          <div className="mensaje-texto">
            <strong>
              Gracias por estar siempre al tanto.
            </strong>

            <span>
              La comunicación entre la escuela y la familia es muy importante
              para el desarrollo de nuestros alumnos.
            </span>
          </div>

          {/* Emoji de la escuela */}
          <div className="mensaje-escuela">
            🏫
          </div>

        </section>

      </main>
    </div>
  );
}

export default InicioTutor;
