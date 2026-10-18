
import { useEffect, useState } from "react";
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

  function iniciarSesion() {
    window.location.href = "/login";
  }

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
          <a href="/bienvenida" className="datos-alumno-menu-item">
            <span className="datos-alumno-icono">⌂</span>
            <span>Inicio</span>
          </a>

          <a
            href="/notificacionesrecibidas"
            className="datos-alumno-menu-item"
          >
            <span className="datos-alumno-icono">♧</span>
            <span>Notificaciones recibidas</span>
          </a>

          <a
            href="/datosalumno"
            className="datos-alumno-menu-item activo"
          >
            <span className="datos-alumno-icono">▤</span>
            <span>Datos del alumno</span>
          </a>
        </nav>

        <button
          type="button"
          className="datos-alumno-cerrar-sesion"
          onClick={iniciarSesion}
        >
          <span className="datos-alumno-icono">⇥</span>
          <span>Cerrar sesión</span>
        </button>
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
              onClick={iniciarSesion}
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
