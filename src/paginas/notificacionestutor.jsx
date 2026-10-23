
import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "../estilos/notificacionestutor.css";

function NotificacionesRecibidasTutor() {
  const [fechaActual, setFechaActual] = useState(new Date());

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
    <div className="recibidas-pagina">
      {/* PANEL LATERAL */}
      <aside className="recibidas-sidebar">
        <div className="recibidas-logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

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

        <Link to="/login" className="recibidas-cerrar">
          <span className="recibidas-icono">⇥</span>
          <span>Cerrar sesión</span>
        </Link>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="recibidas-contenido">
        <header className="recibidas-header">
          <div className="recibidas-titulo">
            <h1>Notificaciones recibidas</h1>
            <p>Inicio &gt; Notificaciones recibidas</p>
          </div>

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

          <div className="recibidas-contador">
            <span>0</span>
            <p>Notificaciones sin leer</p>
          </div>
        </section>

        {/* ESTADO VACÍO */}
        <section className="recibidas-lista">
          <div className="recibidas-vacio">
            <div className="recibidas-vacio-icono">♧</div>

            <h2>No recibiste notificaciones</h2>

            <p>
              Por el momento no tenés comunicaciones pendientes.
              Cuando la escuela te envíe una notificación,
              aparecerá en esta sección.
            </p>
          </div>

          <div className="recibidas-aviso">
            <span>i</span>
            <p>
              <strong>Importante:</strong> revisá esta sección
              para consultar las futuras comunicaciones de la escuela.
            </p>
          </div>
        </section>

        <footer className="recibidas-footer">
          Cuaderno de Comunicaciones Digital · EPET 20
        </footer>
      </main>
    </div>
  );
}

export default NotificacionesRecibidasTutor;
