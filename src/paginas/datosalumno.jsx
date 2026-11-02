// Hooks de React: useState para la fecha y useEffect para el temporizador
import { useEffect, useState } from "react";
// NavLink arma los links del menú y marca el activo; Link es un enlace común (el de cerrar sesión)
import { NavLink, Link } from "react-router-dom";
// Estilos de esta pantalla
import "../estilos/datosalumno.css";

// Pantalla "Datos del alumno" del tutor. Por ahora muestra un mensaje de "todavía no hay alumnos": no lee datos de ninguna base
function DatosAlumno() {
  // fecha: la de hoy, para el encabezado
  const [fecha, setFecha] = useState(new Date());

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

  // Por ahora solo muestra un aviso (alert): todavía no carga ningún dato
  function agregarAlumno() {
    alert("Próximamente podrás cargar los datos del alumno.");
  }

  // Desde acá empieza lo que se dibuja en pantalla. Es una pantalla fija: no depende de datos de Firebase
  return (
    <div className="datos-alumno-pagina">
      {/* PANEL LATERAL */}
      <aside className="datos-alumno-sidebar">
        <div className="datos-alumno-logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        {/* Menú del tutor: NavLink pone la clase "activo" solo en la opción que coincide con la ruta actual (isActive); "end" pide que la ruta coincida exacta */}
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

        {/* Cerrar sesión: por ahora solo lleva a /login */}
        <Link to="/login" className="datos-alumno-cerrar-sesion">
          <span className="datos-alumno-icono">⇥</span>
          <span>Cerrar sesión</span>
        </Link>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="datos-alumno-contenido">
        {/* Encabezado: título a la izquierda, fecha y botón de login a la derecha */}
        <header className="datos-alumno-header">
          <div>
            <h1>Datos del alumno</h1>
            <p>Inicio &nbsp;›&nbsp; Datos del alumno</p>
          </div>

          {/* Fecha de hoy y botón "Iniciar sesión", juntos */}
          <div className="datos-alumno-fecha">
            <span>▦</span>
            <p>{fechaFormateada}</p>

            {/* Lleva a /login recargando toda la página (window.location.href), sin usar el router */}
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
          {/* Estado vacío: se muestra siempre, porque todavía no hay datos cargados */}
          <div className="datos-alumno-vacio">
            {/* Ícono de persona (no es una foto) */}
            <div className="datos-alumno-avatar">♙</div>

            <h2>Todavía no hay alumnos cargados</h2>

            <p>
              Cuando se carguen los datos de un alumno,
              vas a poder consultar acá su información
              personal, académica y los datos de su tutor.
            </p>

            {/* "Agregar alumno" ejecuta agregarAlumno, que por ahora solo muestra un aviso */}
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

        {/* Pie de la pantalla */}
        <footer className="datos-alumno-footer">
          Cuaderno de Comunicaciones Digital · EPET 20
        </footer>
      </main>
    </div>
  );
}

export default DatosAlumno;