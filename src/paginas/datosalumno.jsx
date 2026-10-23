
import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "../estilos/datosalumno.css";

function DatosAlumno() {
  const [fecha, setFecha] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFecha(new Date());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  const fechaFormateada = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function agregarAlumno() {
    alert("Próximamente podrás cargar los datos del alumno.");
  }

  return (
    <div className="datos-alumno-pagina">
      {/* PANEL LATERAL */}
      <aside className="datos-alumno-sidebar">
        <div className="datos-alumno-logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        <nav className="datos-alumno-menu">
          <NavLink
            to="/iniciotutor"
            end
            className={({ isActive }) =>
              `datos-alumno-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="datos-alumno-icono">⌂</span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/notificacionesrecibidas"
            className={({ isActive }) =>
              `datos-alumno-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="datos-alumno-icono">♧</span>
            <span>Notificaciones recibidas</span>
          </NavLink>

          <NavLink
            to="/datosalumno"
            className={({ isActive }) =>
              `datos-alumno-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="datos-alumno-icono">▤</span>
            <span>Datos del alumno</span>
          </NavLink>
        </nav>

        <Link to="/login" className="datos-alumno-cerrar-sesion">
          <span className="datos-alumno-icono">⇥</span>
          <span>Cerrar sesión</span>
        </Link>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="datos-alumno-contenido">
        <header className="datos-alumno-header">
          <div>
            <h1>Datos del alumno</h1>
            <p>Inicio &nbsp;›&nbsp; Datos del alumno</p>
          </div>

          <div className="datos-alumno-fecha">
            <span>▦</span>
            <p>{fechaFormateada}</p>

            <button
              type="button"
              className="datos-alumno-login"
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              Iniciar sesión ↗
            </button>
          </div>
        </header>

        {/* INFORMACIÓN DEL ALUMNO */}
        <section className="datos-alumno-tarjeta">
          <div className="datos-alumno-vacio">
            <div className="datos-alumno-avatar">♙</div>

            <h2>Todavía no hay alumnos cargados</h2>

            <p>
              Cuando se carguen los datos de un alumno,
              vas a poder consultar acá su información
              personal, académica y los datos de su tutor.
            </p>

            <button
              type="button"
              className="datos-alumno-agregar"
              onClick={agregarAlumno}
            >
              <span>＋</span>
              Agregar alumno
            </button>
          </div>
        </section>

        {/* AVISO INFORMATIVO */}
        <div className="datos-alumno-aviso">
          <span>ⓘ</span>
          <p>
            La información del alumno aparecerá acá cuando
            se encuentre cargada en el sistema.
          </p>
        </div>

        <footer className="datos-alumno-footer">
          Cuaderno de Comunicaciones Digital · EPET 20
        </footer>
      </main>
    </div>
  );
}

export default DatosAlumno;
