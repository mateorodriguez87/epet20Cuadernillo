
// Hooks de React: useState para la fecha y los datos; useEffect para los temporizadores y la carga de Firebase
import { useEffect, useState } from "react";

// NavLink arma los links del menú y marca el activo; Link es un enlace común
import { NavLink, useNavigate } from "react-router-dom";

// Permite detectar y cerrar la sesión de Firebase
import { onAuthStateChanged, signOut } from "firebase/auth";

// Funciones de Firestore para consultar y actualizar las notificaciones
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

// Conexión con Firebase
import { auth, db } from "../firebase";

// Estilos de esta pantalla
import "../estilos/notificacionestutor.css";

// Pantalla "Notificaciones recibidas" del tutor. Ahora obtiene las comunicaciones desde Firebase
function NotificacionesRecibidasTutor() {

  // fechaActual: la de hoy, para el encabezado
  const [fechaActual, setFechaActual] = useState(new Date());

  // Lista de notificaciones obtenidas desde Firebase
  const [notificaciones, setNotificaciones] = useState([]);

  // Lista de alumnos relacionados con el tutor
  const [alumnos, setAlumnos] = useState([]);

  // Permite seleccionar un hijo cuando el tutor tiene más de uno
  const [alumnoFiltro, setAlumnoFiltro] = useState("");

  // Guarda el ID de la notificación que se está consultando
  const [notificacionAbierta, setNotificacionAbierta] = useState(null);

  // Indica si se están cargando las notificaciones
  const [cargando, setCargando] = useState(true);

  // Indica si se está actualizando el estado de lectura
  const [actualizandoLectura, setActualizandoLectura] = useState(false);

  // Controla el estado de la sesión
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  // Guarda los mensajes de error
  const [error, setError] = useState("");

  // Permite navegar entre las páginas sin recargar todo el sitio
  const navigate = useNavigate();

  // Cada minuto se vuelve a leer la fecha, para que el encabezado no quede desactualizado
  useEffect(() => {
    // Vuelve a leer la fecha actual
    const actualizarFecha = () => {
      setFechaActual(new Date());
    };

    // La ejecuta cada 60000 milisegundos (un minuto)
    const intervalo = setInterval(actualizarFecha, 60000);

    // Al salir de la pantalla se frena el temporizador
    return () => clearInterval(intervalo);
  }, []);

  // Fecha lista para mostrar, en español de Argentina (día de la semana, día, mes y año)
  const fechaFormateada = fechaActual.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Convierte una fecha de Firestore en un objeto Date
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

  // Fecha lista para mostrar en cada notificación
  function formatearFecha(valor) {
    const fechaConvertida = convertirFecha(valor);

    if (!fechaConvertida) return "Sin fecha";

    return fechaConvertida.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Cantidad de notificaciones sin leer
  const sinLeer = notificaciones.filter(
    (notificacion) => !notificacion.leida
  ).length;

  // Muestra las notificaciones correspondientes al alumno seleccionado
  const notificacionesFiltradas = notificaciones.filter(
    (notificacion) =>
      !alumnoFiltro || notificacion.alumnoId === alumnoFiltro
  );

  // Ordena las notificaciones desde la más reciente hasta la más antigua
  const notificacionesOrdenadas = [...notificacionesFiltradas].sort(
    (a, b) => {
      const fechaA = convertirFecha(a.creadoEn || a.fechaEnvio);
      const fechaB = convertirFecha(b.creadoEn || b.fechaEnvio);

      return (fechaB?.getTime() || 0) - (fechaA?.getTime() || 0);
    }
  );

  // Carga los datos del tutor, sus hijos y las notificaciones recibidas
  useEffect(() => {
    let activo = true;

    const cancelarSuscripcion = onAuthStateChanged(auth, async (usuario) => {
      setSesionIniciada(!!usuario);

      if (!usuario) {
        setNotificaciones([]);
        setAlumnos([]);
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

        // Busca las notificaciones dirigidas al tutor que inició sesión
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
        }

      } catch (error) {
        console.error("Error al cargar las notificaciones:", error);

        if (activo) {
          setError(
            "No se pudieron cargar las notificaciones. Revisá la conexión con Firebase."
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

  // Abre una notificación y la marca como leída en Firebase
  async function abrirNotificacion(notificacion) {
    setNotificacionAbierta(notificacion.id);

    // Si ya está leída, no hace falta actualizarla
    if (notificacion.leida) return;

    try {
      setActualizandoLectura(true);
      setError("");

      // Actualiza el campo leida del documento correspondiente
      await updateDoc(
        doc(db, "Notificaciones", notificacion.id),
        {
          leida: true,
        }
      );

      // Actualiza también el estado local para que cambie la pantalla
      setNotificaciones((anteriores) =>
        anteriores.map((item) =>
          item.id === notificacion.id
            ? { ...item, leida: true }
            : item
        )
      );

    } catch (error) {
      console.error("Error al marcar la notificación como leída:", error);

      setError(
        "No se pudo actualizar el estado de lectura. Intentá nuevamente."
      );

    } finally {
      setActualizandoLectura(false);
    }
  }

  // Cierra el detalle de la notificación
  function cerrarNotificacion() {
    setNotificacionAbierta(null);
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
    <div className="recibidas-pagina">
      {/* PANEL LATERAL */}
      <aside className="recibidas-sidebar">
        <div className="recibidas-logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        {/* Menú del tutor: NavLink pone la clase "activo" solo en la opción que coincide con la ruta actual (isActive); "end" pide que la ruta coincida exacta */}
        <nav className="recibidas-menu">
          <NavLink
            to="/iniciotutor"
            end
            className={({ isActive }) =>
              `recibidas-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="recibidas-icono">⌂</span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/notificacionesrecibidas"
            className={({ isActive }) =>
              `recibidas-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="recibidas-icono">♧</span>
            <span>Notificaciones recibidas</span>
          </NavLink>

          <NavLink
            to="/datosalumno"
            className={({ isActive }) =>
              `recibidas-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="recibidas-icono">▤</span>
            <span>Datos del alumno</span>
          </NavLink>
        </nav>

        {/* Cerrar sesión: ahora cierra la sesión real de Firebase */}
        <button
          type="button"
          className="recibidas-cerrar"
          onClick={sesionIniciada ? cerrarSesion : iniciarSesion}
          disabled={verificandoSesion}
        >
          <span className="recibidas-icono">⇥</span>
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
      <main className="recibidas-contenido">
        {/* Encabezado: título y migas de pan a la izquierda, fecha a la derecha */}
        <header className="recibidas-header">
          <div className="recibidas-titulo">
            <h1>Notificaciones recibidas</h1>
            <p>Inicio &gt; Notificaciones recibidas</p>
          </div>

          {/* Fecha de hoy (viene del estado fechaActual) */}
          <div className="recibidas-fecha">
            <span>▦</span>
            <p>{fechaFormateada}</p>
          </div>
        </header>

        {/* INTRODUCCIÓN */}
        <section className="recibidas-introduccion">
          <div>
            <h2>Tus comunicaciones</h2>
            <p>
              Consultá las comunicaciones enviadas por la escuela.
            </p>
          </div>

          {/* Contador de notificaciones sin leer: se calcula con los datos de Firebase */}
          <div className="recibidas-contador">
            <span>{sinLeer}</span>
            <p>Notificaciones sin leer</p>
          </div>
        </section>

        {/* Selector de alumno: aparece cuando el tutor tiene más de un hijo */}
        {alumnos.length > 1 && (
          <section className="recibidas-filtro">
            <label htmlFor="filtro-alumno">
              Consultar comunicaciones de:
            </label>

            <select
              id="filtro-alumno"
              value={alumnoFiltro}
              onChange={(e) => setAlumnoFiltro(e.target.value)}
            >
              <option value="">Todos mis hijos</option>

              {alumnos.map((alumno) => (
                <option key={alumno.id} value={alumno.id}>
                  {alumno.nombre}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* LISTA DE NOTIFICACIONES */}
        <section className="recibidas-lista">
          {cargando ? (
            <div className="recibidas-vacio">
              <h2>Cargando notificaciones...</h2>
            </div>
          ) : error && notificaciones.length === 0 ? (
            <div className="recibidas-vacio">
              <h2>{error}</h2>
            </div>
          ) : notificacionesOrdenadas.length === 0 ? (
            <>
              {/* Mensaje de "No recibiste notificaciones" cuando la lista está vacía */}
              <div className="recibidas-vacio">
                <div className="recibidas-vacio-icono">♧</div>

                <h2>No recibiste notificaciones</h2>

                <p>
                  Por el momento no tenés comunicaciones pendientes.
                  Cuando la escuela te envíe una notificación,
                  aparecerá en esta sección.
                </p>
              </div>
            </>
          ) : (
            <>
              {notificacionesOrdenadas.map((notificacion) => {
                const abierta =
                  notificacionAbierta === notificacion.id;

                const alumnoRelacionado = alumnos.find(
                  (alumno) => alumno.id === notificacion.alumnoId
                );

                return (
                  <article
                    className={`recibidas-notificacion ${
                      notificacion.leida
                        ? "recibidas-notificacion-leida"
                        : "recibidas-notificacion-pendiente"
                    }`}
                    key={notificacion.id}
                  >
                    {/* Encabezado de cada comunicación */}
                    <div className="recibidas-notificacion-cabecera">
                      <div className="recibidas-notificacion-icono">
                        ♧
                      </div>

                      <div className="recibidas-notificacion-info">
                        <strong>
                          {notificacion.asunto || "Notificación de la escuela"}
                        </strong>

                        <span>
                          {notificacion.alumnoNombre ||
                            alumnoRelacionado?.nombre ||
                            "Alumno"}
                        </span>

                        <span>
                          {formatearFecha(
                            notificacion.fechaEnvio ||
                            notificacion.creadoEn
                          )}
                        </span>
                      </div>

                      <div className="recibidas-notificacion-estado">
                        <span>
                          {notificacion.leida
                            ? "Leída"
                            : "Sin leer"}
                        </span>

                        <span>
                          {notificacion.prioridad === "importante"
                            ? "Importante"
                            : "Normal"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="recibidas-notificacion-boton"
                        onClick={() =>
                          abierta
                            ? cerrarNotificacion()
                            : abrirNotificacion(notificacion)
                        }
                        disabled={actualizandoLectura}
                      >
                        {abierta ? "Cerrar" : "Leer"}
                      </button>
                    </div>

                    {/* Contenido de la comunicación: aparece al tocar Leer */}
                    {abierta && (
                      <div className="recibidas-notificacion-detalle">
                        <p>
                          {notificacion.mensaje || "Sin contenido."}
                        </p>

                        <small>
                          Enviado por:{" "}
                          {notificacion.preceptorNombre || "Preceptor"}
                        </small>

                        {actualizandoLectura && (
                          <small>
                            Actualizando estado de lectura...
                          </small>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </>
          )}

          {/* Aviso informativo con un ícono "i" */}
          <div className="recibidas-aviso">
            <span>i</span>
            <p>
              <strong>Importante:</strong> revisá esta sección
              para consultar las comunicaciones de la escuela.
            </p>
          </div>

          {error && notificaciones.length > 0 && (
            <p className="recibidas-error">
              {error}
            </p>
          )}
        </section>

        {/* Pie de la pantalla */}
        <footer className="recibidas-footer">
          Cuaderno de Comunicaciones Digital · EPET 20
        </footer>
      </main>
    </div>
  );
}

export default NotificacionesRecibidasTutor;
