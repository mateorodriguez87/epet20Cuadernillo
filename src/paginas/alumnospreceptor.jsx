// Hooks de React: useState para los datos de la pantalla y useEffect para escuchar Firebase
import { useEffect, useState } from "react";
// Navegación: NavLink marca la opción activa del menú, Link es un enlace común y useNavigate cambia de pantalla desde el código
import { NavLink, Link, useNavigate } from "react-router-dom";

// Funciones de Firestore: onSnapshot escucha cambios en tiempo real, addDoc crea documentos y serverTimestamp pone la fecha del servidor
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Conexión a la base de datos
import { db } from "../firebase";

// Estilos de la pantalla y de su modal (son dos archivos CSS)
import "../estilos/alumnospreceptor.css";
import "../estilos/modalalumnospreceptor.css";

// Pantalla de alumnos del preceptor: lista con filtros, paginación y un modal para agregar alumnos
function AlumnosPreceptor() {
  // Sirve para ir a otra pantalla desde un botón (por ejemplo, a la de alta y baja)
  const navigate = useNavigate();

  // Datos obtenidos de Firebase
  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  // cargando: true hasta que llegan los primeros datos / error: mensaje si falla la carga
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Filtros y paginación
  // busqueda: texto del buscador / curso y estado: filtros de los selects ("todos" significa sin filtro) / pagina y porPagina: paginación
  const [busqueda, setBusqueda] = useState("");
  const [curso, setCurso] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(6);

  // Modal para agregar alumnos
  // mostrarModal: abre o cierra el modal / guardando: bloquea los botones mientras se guarda / mensaje y tipoMensaje: avisos dentro del modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  // Lo que se escribe en el modal de agregar alumno
  const [formulario, setFormulario] = useState({
    nombre: "",
    dni: "",
    curso: "",
  });

  // Estados visuales de las comunicaciones
  // Cada estado tiene título, ícono y un detalle que se ve al pasar el mouse (title)
  // Las claves (ok, pendiente, obs) coinciden con el campo "estado" de cada alumno en Firebase
  const estados = {
    ok: {
      titulo: "Al día",
      icono: "✔",
      detalle: "Todas las comunicaciones confirmadas",
    },
    pendiente: {
      titulo: "Pendiente",
      icono: "◷",
      detalle: "Tiene comunicaciones sin leer",
    },
    obs: {
      titulo: "Con observaciones",
      icono: "!",
      detalle: "Requiere revisión",
    },
  };

  // Escuchar alumnos de Firebase en tiempo real
  useEffect(() => {
    // onSnapshot escucha la colección: cada vez que cambia en Firebase, la lista se actualiza sola, sin recargar la página
    const cancelarAlumnos = onSnapshot(
      collection(db, "Alumnos"),
      (snapshot) => {
        // Cada alumno se guarda junto con el id de su documento
        const lista = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setAlumnos(lista);
        setCargando(false);
        setError("");
      },
      // Si falla la lectura, se muestra un mensaje en la tabla
      (error) => {
        console.error("Error al obtener alumnos:", error);
        setError("No se pudieron cargar los alumnos.");
        setCargando(false);
      }
    );

    // Al salir de la pantalla se deja de escuchar, para no gastar recursos
    return () => cancelarAlumnos();
  }, []);

  // Escuchar cursos de Firebase en tiempo real
  useEffect(() => {
    // Lo mismo con los cursos: alimentan los selects de filtro y de alta
    const cancelarCursos = onSnapshot(
      collection(db, "Cursos"),
      (snapshot) => {
        const lista = snapshot.docs.map((documento) => {
          const datos = documento.data();

          return {
            id: documento.id,
            ...datos,
            // El nombre del curso se arma juntando curso y división (por ejemplo "3° A")
            nombre: `${datos.curso || ""} ${datos.division || ""}`.trim(),
          };
        });

        setCursos(lista);
      },
      // Si falla, solo se registra en la consola (no se muestra nada en pantalla)
      (error) => {
        console.error("Error al obtener cursos:", error);
      }
    );

    return () => cancelarCursos();
  }, []);

  // Obtener las iniciales del alumno
  function iniciales(nombre = "") {
    return nombre
      .split(" ")
      .filter(Boolean)
      .map((palabra) => palabra[0])
      .join("")
      // Se queda con las dos primeras letras (ejemplo: "Juan Pérez" queda "JP")
      .slice(0, 2)
      .toUpperCase();
  }

  // Abrir modal
  function abrirModal() {
    // Primero se deja el formulario en blanco y sin mensajes, y después se muestra el modal
    setFormulario({
      nombre: "",
      dni: "",
      curso: "",
    });

    setMensaje("");
    setTipoMensaje("");
    setMostrarModal(true);
  }

  // Cerrar modal
  function cerrarModal() {
    // No deja cerrar el modal mientras se está guardando
    if (guardando) return;

    setMostrarModal(false);
    setMensaje("");
    setTipoMensaje("");
  }

  // Actualizar campos
  function manejarCambio(e) {
    // Un solo manejador para todos los campos: el atributo name del input dice cuál cambió
    const { name, value } = e.target;

    // Copia lo que había y pisa solo el campo que cambió
    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // Registrar alumno en Firebase
  async function agregarAlumno(e) {
    e.preventDefault();

    setMensaje("");
    setTipoMensaje("");

    const nombre = formulario.nombre.trim();
    const dni = formulario.dni.trim();

    // El select guarda el id del curso; acá se busca el curso completo para sacar su nombre
    const cursoSeleccionado = cursos.find(
      (c) => c.id === formulario.curso
    );

    // Validación 1: tienen que estar los tres datos
    if (!nombre || !dni || !cursoSeleccionado) {
      setMensaje("Completá todos los campos.");
      setTipoMensaje("error");
      return;
    }

    // Validación 2: el DNI debe ser solo números, de 7 u 8 dígitos
    if (!/^\d{7,8}$/.test(dni)) {
      setMensaje("Ingresá un DNI válido de 7 u 8 números.");
      setTipoMensaje("error");
      return;
    }

    // Evitar registrar dos veces el mismo DNI
    const dniExistente = alumnos.some(
      (alumno) => String(alumno.dni || "").trim() === dni
    );

    // Validación 3: no se permite repetir el DNI
    if (dniExistente) {
      setMensaje("Ya existe un alumno registrado con ese DNI.");
      setTipoMensaje("error");
      return;
    }

    // Desde acá se bloquean los botones hasta terminar
    setGuardando(true);

    try {
      // Crea el alumno en la colección "Alumnos"
      await addDoc(collection(db, "Alumnos"), {
        nombre,
        dni,
        curso: cursoSeleccionado.nombre,
        cursoId: cursoSeleccionado.id,
        // Arranca como "Al día" y sin comunicaciones pendientes
        estado: "ok",
        detalle: "Sin comunicaciones pendientes",
        // La fecha de creación la pone el servidor de Firebase
        creadoEn: serverTimestamp(),
      });

      setMensaje("");
      setMostrarModal(false);

      setFormulario({
        nombre: "",
        dni: "",
        curso: "",
      });

      // Vuelve a la primera página; la lista se actualiza sola por el onSnapshot, no hace falta recargar
      setPagina(1);
    } catch (error) {
      // Si Firebase falla, se avisa dentro del modal
      console.error("Error al registrar alumno:", error);

      setMensaje(
        "No se pudo registrar el alumno. Revisá la conexión con Firebase."
      );

      setTipoMensaje("error");
    } finally {
      // Pase lo que pase, se desbloquean los botones
      setGuardando(false);
    }
  }

  // Filtrar alumnos
  const alumnosFiltrados = alumnos.filter((alumno) => {
    const coincideNombre = (alumno.nombre || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    // La búsqueda funciona por nombre o por DNI
    const coincideDni = String(alumno.dni || "").includes(busqueda);

    // El filtro de curso compara con el id del curso o con su nombre
    const coincideCurso =
      curso === "todos" ||
      alumno.cursoId === curso ||
      alumno.curso === curso;

    const coincideEstado =
      estado === "todos" || alumno.estado === estado;

    // Tiene que coincidir el nombre o el DNI y, además, el curso y el estado
    return (
      (coincideNombre || coincideDni) &&
      coincideCurso &&
      coincideEstado
    );
  });

  // Paginación
  // Cantidad de páginas (mínimo 1, aunque no haya alumnos)
  const totalPaginas = Math.max(
    1,
    Math.ceil(alumnosFiltrados.length / porPagina)
  );

  // Evita quedar en una página que ya no existe (por ejemplo, después de filtrar)
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * porPagina;

  // Solo los alumnos de la página actual
  const alumnosPagina = alumnosFiltrados.slice(
    inicio,
    inicio + porPagina
  );

  // Para el texto "Mostrando X–Y de Z alumnos"
  const desde = alumnosFiltrados.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + alumnosPagina.length;

  // Números de página a mostrar: del 1 al 5 y la última, con "…" en el medio
  const numeros = [];

  for (let i = 1; i <= totalPaginas; i++) {
    if (i <= 5 || i === totalPaginas) {
      numeros.push(i);
    } else if (numeros[numeros.length - 1] !== "…") {
      numeros.push("…");
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

        {/* Menú: NavLink pone la clase "activo" solo en la opción que coincide con la ruta actual (isActive) */}
        <nav className="menu">
          <NavLink
            to="/preceptor"
            end
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">⌂</span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/cursospreceptor"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">▤</span>
            <span>Cursos</span>
          </NavLink>

          <NavLink
            to="/alumnospreceptor"
            end
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">♙</span>
            <span>Alumnos</span>
          </NavLink>

          <NavLink
            to="/notificacionpreceptor"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">♧</span>
            <span>Notificaciones</span>
          </NavLink>

          <NavLink
            to="/historialpreceptor"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">▤</span>
            <span>Historial</span>
          </NavLink>
        </nav>

        {/* Cerrar sesión: por ahora solo lleva a /login */}
        <Link to="/login" className="cerrar-sesion">
          <span className="logout-icon">⇥</span>
          <span>Cerrar sesión</span>
        </Link>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="contenido">
        {/* ENCABEZADO */}
        {/* Solo título y migas de pan: esta pantalla no muestra fecha ni usuario */}
        <header className="encabezado encabezado-alumnos">
          <div>
            <h1>Alumnos</h1>
            <p>Inicio &gt; Alumnos</p>
          </div>
        </header>

        {/* FILTROS Y BOTONES */}
        <section className="filtros">
          {/* Buscador por nombre o DNI; al escribir vuelve a la página 1 */}
          <input
            type="search"
            className="buscador"
            placeholder="Buscar alumno..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />

          {/* Filtro por curso: las opciones salen de la colección Cursos */}
          <select
            className="selector"
            value={curso}
            onChange={(e) => {
              setCurso(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todos">Todos los cursos</option>

            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          {/* Filtro por estado de las comunicaciones */}
          <select
            className="selector"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todos">Estado de comunicaciones</option>
            <option value="ok">Al día</option>
            <option value="pendiente">Pendiente</option>
            <option value="obs">Con observaciones</option>
          </select>

          {/* Abre el modal para agregar un alumno */}
          <button
            type="button"
            className="boton-primario"
            onClick={abrirModal}
          >
            + Agregar alumno
          </button>

          {/* Lleva a la pantalla de alta y baja de alumnos */}
          <button
            type="button"
            className="boton-dar-baja"
            onClick={() => navigate("/altabajaalumnos")}
          >
            − Dar de baja alumno
          </button>
        </section>

        {/* TARJETAS SUPERIORES */}
        {/* Solo "Total alumnos" tiene dato real; las otras tres muestran "—" hasta que se conecten */}
        <section className="estadisticas">
          <div className="tarjeta estadistica">
            <div className="icono-card azul">👥</div>
            <div className="info-card">
              <span>Total alumnos</span>
              <strong>{alumnos.length}</strong>
            </div>
          </div>

          <div className="tarjeta estadistica">
            <div className="icono-card verde">▤</div>
            <div className="info-card">
              <span>Comunicaciones enviadas (mes)</span>
              <strong>—</strong>
            </div>
          </div>

          <div className="tarjeta estadistica">
            <div className="icono-card naranja">✉</div>
            <div className="info-card">
              <span>Pendientes de leer</span>
              <strong>—</strong>
            </div>
          </div>

          <div className="tarjeta estadistica">
            <div className="icono-card violeta">✔</div>
            <div className="info-card">
              <span>Confirmadas por tutores</span>
              <strong>—</strong>
            </div>
          </div>
        </section>

        {/* TABLA DE ALUMNOS */}
        <section className="tarjeta tabla-alumnos">
          <div className="tabla-scroll">
            <table>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>DNI</th>
                  <th>Curso</th>
                  <th>Estado de comunicaciones</th>
                  <th className="centrado">Acciones</th>
                </tr>
              </thead>

              {/* Cuatro casos: cargando, error de carga, lista vacía o una fila por cada alumno */}
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={5} className="sin-datos">
                      Cargando alumnos...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="sin-datos">
                      {error}
                    </td>
                  </tr>
                ) : alumnosPagina.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="sin-datos">
                      No hay alumnos para mostrar.
                      {busqueda && " Probá con otra búsqueda."}
                    </td>
                  </tr>
                ) : (
                  // Una fila por cada alumno de la página actual
                  alumnosPagina.map((alumno) => {
                    // Si el alumno trae un estado desconocido, se muestra como "Al día"
                    const estadoActual =
                      estados[alumno.estado] || estados.ok;

                    return (
                      <tr key={alumno.id}>
                        <td>
                          <div className="alumno">
                            <span className="avatar">
                              {/* Si el alumno tiene foto se muestra; si no, sus iniciales */}
                              {alumno.foto ? (
                                <img
                                  src={alumno.foto}
                                  alt={alumno.nombre}
                                />
                              ) : (
                                iniciales(alumno.nombre)
                              )}
                            </span>

                            <strong>{alumno.nombre}</strong>
                          </div>
                        </td>

                        <td>{alumno.dni}</td>

                        <td>
                          <span className="etiqueta-curso">
                            {alumno.curso}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`estado estado-${alumno.estado || "ok"}`}
                            title={estadoActual.detalle}
                          >
                            {estadoActual.icono} {estadoActual.titulo}
                          </span>
                        </td>

                        <td>
                          {/* Este botón también lleva a la pantalla de alta y baja */}
                          <div className="acciones-fila">
                            <button
                              type="button"
                              className="boton-secundario"
                              onClick={() =>
                                navigate("/altabajaalumnos")
                              }
                            >
                              Dar de baja
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="paginacion">
            <span>
              Mostrando {desde}–{hasta} de {alumnosFiltrados.length} alumnos
            </span>

            {/* Selector de cuántos alumnos mostrar, Anterior, números de página y Siguiente */}
            <div className="controles-paginacion">
              <label htmlFor="porPagina">Mostrar:</label>

              <select
                id="porPagina"
                value={porPagina}
                onChange={(e) => {
                  setPorPagina(Number(e.target.value));
                  setPagina(1);
                }}
              >
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>

              <button
                type="button"
                disabled={paginaActual === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>

              {/* Un botón por número (el "…" no se puede tocar); la página actual lleva la clase pagina-activa */}
              {numeros.map((numero, index) =>
                numero === "…" ? (
                  <span key={`puntos-${index}`}>…</span>
                ) : (
                  <button
                    type="button"
                    key={numero}
                    className={paginaActual === numero ? "pagina-activa" : ""}
                    onClick={() => setPagina(numero)}
                  >
                    {numero}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={paginaActual === totalPaginas}
                onClick={() =>
                  setPagina((p) => Math.min(totalPaginas, p + 1))
                }
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL PARA AGREGAR ALUMNOS */}
      {/* El modal solo se muestra cuando mostrarModal es true */}
      {mostrarModal && (
        <div className="fondo-modal" onClick={cerrarModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Agregar alumno</h2>
            <p>Completá los datos para registrar un nuevo alumno.</p>

            {/* Al enviarlo se ejecuta agregarAlumno, que valida antes de guardar */}
            <form onSubmit={agregarAlumno}>
              {/* Nombre y apellido juntos en un solo campo */}
              <div className="campo">
                <label htmlFor="nombre">Nombre y apellido</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  className="entrada"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  placeholder="Ingresá el nombre completo"
                  required
                />
              </div>

              {/* DNI (7 u 8 números) */}
              <div className="campo">
                <label htmlFor="dni">DNI</label>
                <input
                  id="dni"
                  name="dni"
                  type="text"
                  className="entrada"
                  value={formulario.dni}
                  onChange={manejarCambio}
                  placeholder="Ej.: 12345678"
                  required
                />
              </div>

              {/* Curso: se guarda el id y se muestra el nombre */}
              <div className="campo">
                <label htmlFor="curso">Curso</label>
                <select
                  id="curso"
                  name="curso"
                  className="entrada"
                  value={formulario.curso}
                  onChange={manejarCambio}
                  required
                >
                  <option value="">Seleccionar curso</option>

                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mensaje de error (de las validaciones o de Firebase) */}
              {mensaje && (
                <p className={`mensaje ${tipoMensaje}`}>
                  {mensaje}
                </p>
              )}

              {/* Cancelar cierra el modal; Guardar se bloquea mientras se está guardando */}
              <div className="botones">
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="boton-primario"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar alumno"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlumnosPreceptor;