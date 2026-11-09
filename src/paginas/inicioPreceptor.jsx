// Hooks de React: useState para los datos de la pantalla y useEffect para escuchar Firebase y la fecha
import { useEffect, useState } from "react";
// Link arma enlaces comunes y NavLink los del menú (marca cuál es el activo)
import { Link, NavLink } from "react-router-dom";
// Avisa cada vez que cambia el usuario que tiene la sesión iniciada
import { onAuthStateChanged } from "firebase/auth";
// onSnapshot escucha una colección de Firestore en tiempo real
import { collection, onSnapshot } from "firebase/firestore";
// auth: la autenticación de Firebase / db: la base de datos
import { auth, db } from "../firebase";
// Icono proveniente de la Biblioteca Lucide-React
import { House, Presentation, UserRoundGroup, Bell, RotateCcwClock} from 'lucide-react';
// Estilos de esta pantalla
import "../estilos/inicioPreceptor.css";

// Pantalla de inicio del preceptor: saludo, tarjetas con totales, notificaciones, acciones rápidas y lista de cursos
function InicioPreceptor() {
  // fechaActual: la de hoy, para el encabezado
  // nombre: el del usuario que inició sesión, para el saludo
  const [fechaActual, setFechaActual] = useState(new Date());
  const [nombre, setNombre] = useState("");

  // son los datos obtenidos de Firebase
  const [cursos, setCursos] = useState([]);
  // Ojo: hoy solo los cursos se cargan desde Firebase. Alumnos, notificaciones y comunicaciones quedan siempre vacíos (nadie llama a sus setters), por eso sus tarjetas muestran "—" y no hay lista de notificaciones
  const [alumnos, setAlumnos] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [comunicaciones, setComunicaciones] = useState([]);

  // obtener el usuario que inició sesión
  useEffect(() => {
    // Firebase avisa cada vez que alguien inicia o cierra sesión
    const cancelarEscucha = onAuthStateChanged(auth, (usuario) => {
      if (usuario) {
        // Para el saludo usa el nombre del usuario y, si no tiene, su correo
        setNombre(usuario.displayName || usuario.email || "");
      } else {
        // Si no hay nadie con la sesión iniciada, el saludo queda sin nombre
        setNombre("");
      }
    });

    // Al salir de la pantalla se deja de escuchar, para no gastar recursos
    return () => cancelarEscucha();
  }, []);

  // se obtienen los cursos de Firebase en tiempo real
  useEffect(() => {
    // onSnapshot escucha la colección: si algo cambia en Firebase, la lista se actualiza sola, sin recargar la página
    const cancelar = onSnapshot(
      collection(db, "Cursos"),
      (snapshot) => {
        // Cada curso se guarda junto con el id de su documento
        setCursos(
          snapshot.docs.map((documento) => ({
            id: documento.id,
            ...documento.data(),
          }))
        );
      },
      // Si falla la lectura, solo se registra en la consola (no se muestra nada en pantalla)
      (error) => {
        console.error("Error al cargar cursos:", error);
      }
    );

    // Al salir de la pantalla se deja de escuchar
    return () => cancelar();
  }, []);

  // esto actualiza la fecha
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

  // Desde acá empieza lo que se dibuja en pantalla
  return (
    <div className="panel">
      {/* Barra lateral con el menú (esta pantalla no tiene botón de cerrar sesión) */}
      <aside className="sidebar">
        <div className="logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        {/* Menú: NavLink pone la clase "activo" solo en la opción que coincide con la ruta actual (isActive); "end" pide que la ruta coincida exacta */}
        <nav className="menu">
          <NavLink
            to="/preceptor"
            end
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <House className="menu-icon" size={20} />
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/cursospreceptor"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <Presentation className="menu-icon" size={20}/>
            <span>Cursos</span>
          </NavLink>

          <NavLink
            to="/alumnospreceptor"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <UserRoundGroup className="menu-icon" size={20}/>
            <span>Alumnos</span>
          </NavLink>

          <NavLink
            to="/notificacionpreceptor"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
           <Bell className="menu-icon" size={20}/>
           <span>Notificaciones</span>
          </NavLink>

          <NavLink
            to="/historialpreceptor"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
           <RotateCcwClock className="menu-icon" size={20}/>
            <span>Historial</span>
          </NavLink>
        </nav>
      </aside>

      <main className="contenido">
        {/* Encabezado: saludo con el nombre y la fecha de hoy */}
        <header className="encabezado">
          <div>
            {/* Saludo: el ", nombre" solo se agrega si hay un usuario con la sesión iniciada */}
            <h1>
              ¡Bienvenido/a {nombre ? `, ${nombre}` : ""}!
            </h1>

            <p className="fecha-actual">{fechaFormateada}</p>
          </div>
        </header>

        {/* ESTADÍSTICAS */}
        <section className="estadisticas">
          {/* Cursos a cargo: cuenta los cursos que vienen de Firebase (si no hay ninguno, muestra 0) */}
          <article className="tarjeta estadistica">
            <div className="icono-card azul">🎓</div>

            <div className="info-card">
              <span>Cursos a cargo</span>
              <strong>{cursos.length}</strong>
            </div>

            <Link
              to="/cursospreceptor"
              className="enlace-estadistica"
            >
              Ver cursos <span>›</span>
            </Link>
          </article>

          {/* Alumnos a cargo: si la cantidad es 0, el || "—" muestra un guion. Hoy siempre se ve así porque los alumnos no se cargan */}
          <article className="tarjeta estadistica">
            <div className="icono-card verde">👥</div>

            <div className="info-card">
              <span>Alumnos a cargo</span>
              <strong>{alumnos.length || "—"}</strong>
            </div>

            <Link
              to="/alumnospreceptor"
              className="enlace-estadistica"
            >
              Ver alumnos <span>›</span>
            </Link>
          </article>

          {/* Notificaciones pendientes (número en rojo): hoy muestra "—" porque no se cargan */}
          <article className="tarjeta estadistica">
            <div className="icono-card naranja">✉</div>

            <div className="info-card">
              <span>Notificaciones pendientes</span>
              <strong className="numero-rojo">
                {notificaciones.length || "—"}
              </strong>
            </div>

            <Link
              to="/notificacionpreceptor"
              className="enlace-estadistica"
            >
              Ver pendientes <span>›</span>
            </Link>
          </article>

          {/* Comunicaciones enviadas: hoy muestra "—" porque no se cargan. El texto dice "este mes", pero no hay ningún filtro por mes */}
          <article className="tarjeta estadistica">
            <div className="icono-card violeta">▤</div>

            <div className="info-card">
              <span>Comunicaciones enviadas (este mes)</span>
              <strong>{comunicaciones.length || "—"}</strong>
            </div>

            <Link
              to="/historialpreceptor"
              className="enlace-estadistica"
            >
              Ver historial <span>›</span>
            </Link>
          </article>
        </section>

        {/* ZONA CENTRAL */}
        <section className="zona-central">
          {/* Lista de notificaciones pendientes */}
          <article className="tarjeta notificaciones">
            <div className="titulo-seccion">
              <h2>Notificaciones pendientes</h2>
              <Link to="/notificacionpreceptor">Ver todas</Link>
            </div>

            {/* Si no hay, muestra el mensaje de vacío; si hay, una fila por cada notificación */}
            {notificaciones.length === 0 ? (
              <div className="sin-datos">
                No hay notificaciones pendientes
              </div>
            ) : (
              notificaciones.map((notificacion) => (
                <div
                  className="notificacion"
                  key={notificacion.id}
                >
                  <div className="notificacion-icon azul">!</div>

                  <div className="notificacion-texto">
                    <strong>{notificacion.titulo}</strong>
                    <span>{notificacion.descripcion}</span>
                  </div>

                  <span className="notificacion-fecha">
                    {notificacion.fecha}
                  </span>
                </div>
              ))
            )}

            <Link
              to="/notificacionpreceptor"
              className="ver-notificaciones"
            >
              Ir a notificaciones
            </Link>
          </article>

          {/* Acciones rápidas: tres atajos a otras pantallas */}
          <article className="tarjeta acciones">
            <div className="titulo-seccion">
              <h2>Acciones rápidas</h2>
            </div>

            <Link
              to="/notificacionpreceptor"
              className="accion"
            >
              <div className="accion-icon azul">➤</div>

              <div className="accion-texto">
                <strong>Nueva comunicación</strong>
                <span>Crear una nueva notificación</span>
              </div>

              <b>›</b>
            </Link>

            <Link
              to="/alumnospreceptor"
              className="accion"
            >
              <div className="accion-icon verde">👥</div>

              <div className="accion-texto">
                <strong>Gestionar alumnos</strong>
                <span>Consultar los alumnos registrados</span>
              </div>

              <b>›</b>
            </Link>

            <Link
              to="/historialpreceptor"
              className="accion"
            >
              <div className="accion-icon violeta">▤</div>

              <div className="accion-texto">
                <strong>Ver historial</strong>
                <span>Consultar comunicaciones enviadas</span>
              </div>

              <b>›</b>
            </Link>
          </article>
        </section>

        {/* MIS CURSOS */}
        <section className="tarjeta cursos">
          <div className="titulo-seccion">
            <h2>Mis cursos</h2>
            <Link to="/cursospreceptor">Ver todos</Link>
          </div>

          {/* Si no hay cursos, muestra un mensaje con un botón que lleva a Cursos; si hay, una cajita por cada curso */}
          {cursos.length === 0 ? (
            <div className="sin-cursos">
              <span className="sin-cursos-icono">🎓</span>

              <strong>No hay cursos cargados</strong>

              <p>
                Cuando agregues cursos desde la sección Cursos,
                aparecerán automáticamente en esta sección.
              </p>

              <Link
                to="/cursospreceptor"
                className="boton-agregar"
              >
                Consultar cursos
              </Link>
            </div>
          ) : (
            <div className="lista-cursos">
              {/* Una cajita por curso, con el nombre armado juntando año y división */}
              {cursos.map((curso) => (
                <div className="curso" key={curso.id}>
                  <strong>
                    {`${curso.curso || ""} ${curso.division || ""}`.trim()}
                  </strong>
                  <span>Curso registrado</span>
                  <b>♧</b>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default InicioPreceptor;