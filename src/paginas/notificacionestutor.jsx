// Hooks de React: useState para la fecha y useEffect para el temporizador
import { useEffect, useState } from "react";
// NavLink arma los links del menú y marca el activo; Link es un enlace común (el de cerrar sesión)
import { NavLink, Link } from "react-router-dom";
// Estilos de esta pantalla
import "../estilos/notificacionestutor.css";

// Pantalla "Notificaciones recibidas" del tutor. Por ahora es fija: siempre muestra el estado vacío, porque todavía no lee notificaciones de ninguna base
function NotificacionesRecibidasTutor() {
  // fechaActual: la de hoy, para el encabezado
  const [fechaActual, setFechaActual] = useState(new Date());

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

        {/* Cerrar sesión: por ahora solo lleva a /login */}
        <Link to="/login" className="recibidas-cerrar">
          <span className="recibidas-icono">⇥</span>
          <span>Cerrar sesión</span>
        </Link>
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

          {/* Contador de notificaciones sin leer: el 0 está escrito a mano, todavía no se calcula */}
          <div className="recibidas-contador">
            <span>0</span>
            <p>Notificaciones sin leer</p>
          </div>
        </section>

        {/* ESTADO VACÍO */}
        <section className="recibidas-lista">
          {/* Mensaje de "No recibiste notificaciones". Cuando haya notificaciones, acá iría la lista */}
          <div className="recibidas-vacio">
            <div className="recibidas-vacio-icono">♧</div>

            <h2>No recibiste notificaciones</h2>

            <p>
              Por el momento no tenés comunicaciones pendientes.
              Cuando la escuela te envíe una notificación,
              aparecerá en esta sección.
            </p>
          </div>

          {/* Aviso informativo con un ícono "i" */}
          <div className="recibidas-aviso">
            <span>i</span>
            <p>
              <strong>Importante:</strong> revisá esta sección
              para consultar las futuras comunicaciones de la escuela.
            </p>
          </div>
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