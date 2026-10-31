import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import "../estilos/inicioPreceptor.css";

function InicioPreceptor() {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [nombre, setNombre] = useState("");

  // son los datos obtenidos de Firebase
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [comunicaciones, setComunicaciones] = useState([]);

  // obtener el usuario que inició sesión
  useEffect(() => {
    const cancelarEscucha = onAuthStateChanged(auth, (usuario) => {
      if (usuario) {
        setNombre(usuario.displayName || usuario.email || "");
      } else {
        setNombre("");
      }
    });

    return () => cancelarEscucha();
  }, []);

  // se obtienen los cursos de Firebase en tiempo real
  useEffect(() => {
    const cancelar = onSnapshot(
      collection(db, "Cursos"),
      (snapshot) => {
        setCursos(
          snapshot.docs.map((documento) => ({
            id: documento.id,
            ...documento.data(),
          }))
        );
      },
      (error) => {
        console.error("Error al cargar cursos:", error);
      }
    );

    return () => cancelar();
  }, []);

  // esto actualiza la fecha
  useEffect(() => {
    const actualizarFecha = () => {
      setFechaActual(new Date());
    };

    const intervalo = setInterval(actualizarFecha, 60000);

    return () => clearInterval(intervalo);
  }, []);

  const fechaFormateada = fechaActual.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="panel">
      <aside className="sidebar">
        <div className="logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

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
      </aside>

      <main className="contenido">
        <header className="encabezado">
          <div>
            <h1>
              ¡Bienvenida{nombre ? `, ${nombre}` : ""}!
            </h1>

            <p className="fecha-actual">{fechaFormateada}</p>
          </div>
        </header>

        {/* ESTADÍSTICAS */}
        <section className="estadisticas">
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
          <article className="tarjeta notificaciones">
            <div className="titulo-seccion">
              <h2>Notificaciones pendientes</h2>
              <Link to="/notificacionpreceptor">Ver todas</Link>
            </div>

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