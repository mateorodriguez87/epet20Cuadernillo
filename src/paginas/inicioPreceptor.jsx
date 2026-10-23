
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "../estilos/inicioPreceptor.css";

function InicioPreceptor() {
  const [fechaActual, setFechaActual] = useState(new Date());

  const datos = {
    nombre: "",
    cursos: [],
    alumnos: [],
    notificaciones: [],
    comunicaciones: [],
  };

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

  function iniciarSesion() {
    window.location.href = "/login";
  }

  return (
    <div className="panel">
      {/* PANEL LATERAL */}
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

        <button
          type="button"
          className="cerrar-sesion"
          onClick={iniciarSesion}
        >
          <span className="logout-icon">⇥</span>
          <span>Iniciar sesión</span>
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="contenido">
        <header className="encabezado">
          <div>
            <h1>
              Bienvenido{datos.nombre ? `, ${datos.nombre}` : ""}
            </h1>
            <p className="fecha-actual">{fechaFormateada}</p>
          </div>

          <button
            type="button"
            className="boton-login"
            onClick={iniciarSesion}
          >
            Iniciar sesión <span>↗</span>
          </button>
        </header>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <section className="estadisticas">
          <article className="tarjeta estadistica">
            <div className="icono-card azul">🎓</div>

            <div className="info-card">
              <span>Cursos a cargo</span>
              <strong>{datos.cursos.length || "—"}</strong>
            </div>

            <Link to="/cursospreceptor" className="enlace-estadistica">
              Ver cursos <span>›</span>
            </Link>
          </article>

          <article className="tarjeta estadistica">
            <div className="icono-card verde">👥</div>

            <div className="info-card">
              <span>Alumnos a cargo</span>
              <strong>{datos.alumnos.length || "—"}</strong>
            </div>

            <Link to="/alumnospreceptor" className="enlace-estadistica">
              Ver alumnos <span>›</span>
            </Link>
          </article>

          <article className="tarjeta estadistica">
            <div className="icono-card naranja">✉</div>

            <div className="info-card">
              <span>Notificaciones pendientes</span>
              <strong className="numero-rojo">
                {datos.notificaciones.length || "—"}
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
              <strong>{datos.comunicaciones.length || "—"}</strong>
            </div>

            <Link
              to="/historialpreceptor"
              className="enlace-estadistica"
            >
              Ver historial <span>›</span>
            </Link>
          </article>
        </section>

        {/* NOTIFICACIONES Y ACCIONES RÁPIDAS */}
        <section className="zona-central">
          <article className="tarjeta notificaciones">
            <div className="titulo-seccion">
              <h2>Notificaciones pendientes</h2>
              <Link to="/notificacionpreceptor">Ver todas</Link>
            </div>

            {datos.notificaciones.length === 0 ? (
              <div className="sin-datos">
                No hay notificaciones pendientes
              </div>
            ) : (
              datos.notificaciones.map((notificacion) => (
                <div className="notificacion" key={notificacion.id}>
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

            <Link to="/notificacionpreceptor" className="accion">
              <div className="accion-icon azul">➤</div>
              <div className="accion-texto">
                <strong>Nueva comunicación</strong>
                <span>Crear una nueva notificación</span>
              </div>
              <b>›</b>
            </Link>

            <Link to="/alumnospreceptor" className="accion">
              <div className="accion-icon verde">👥</div>
              <div className="accion-texto">
                <strong>Gestionar alumnos</strong>
                <span>Consultar los alumnos registrados</span>
              </div>
              <b>›</b>
            </Link>

            <Link to="/historialpreceptor" className="accion">
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

          {datos.cursos.length === 0 ? (
            <div className="sin-cursos">
              <span className="sin-cursos-icono">🎓</span>
              <strong>No hay cursos cargados</strong>
              <p>
                Cuando se asignen cursos al preceptor,
                aparecerán en esta sección.
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
              {datos.cursos.map((curso) => (
                <div className="curso" key={curso.id}>
                  <strong>{curso.nombre}</strong>
                  <span>{curso.alumnos} alumnos</span>
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
