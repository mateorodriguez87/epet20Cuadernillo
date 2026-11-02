// Hooks de React: useState para los datos de la pantalla y useEffect para el temporizador de la fecha
import { useEffect, useState } from "react";
// NavLink arma los links del menú y marca el activo; Link es un enlace común (el de cerrar sesión)
import { NavLink, Link } from "react-router-dom";
// Estilos de esta pantalla
import "../estilos/historialpreceptor.css";

// Pantalla de historial de comunicaciones del preceptor. Por ahora no lee datos de ninguna base: la tabla siempre se muestra vacía
function HistorialPreceptor() {
  // fecha: la de hoy, para el encabezado
  // curso, alumno, fechaDesde y fechaHasta: lo que se elige en los filtros (por ahora no se usa para filtrar nada)
  const [fecha, setFecha] = useState(new Date());
  const [curso, setCurso] = useState("");
  const [alumno, setAlumno] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

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

  // Lleva a /login recargando toda la página (no usa el router) y no cierra ninguna sesión
  function iniciarSesion() {
    window.location.href = "/login";
  }

  // Por ahora solo muestra un aviso (alert): todavía no filtra nada porque no hay comunicaciones cargadas
  function filtrarHistorial() {
    alert("Todavía no hay comunicaciones para filtrar.");
  }

  // Desde acá empieza lo que se dibuja en pantalla. Es una pantalla fija: todavía no lee comunicaciones de ninguna base
  return (
    <div className="historial-pagina">
      {/* PANEL LATERAL */}
      <aside className="historial-sidebar">
        <div className="historial-logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        {/* Menú: NavLink pone la clase "activo" solo en la opción que coincide con la ruta actual (isActive); "end" pide que la ruta coincida exacta */}
        <nav className="historial-menu">
          <NavLink
            to="/preceptor"
            end
            className={({ isActive }) =>
              `historial-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="historial-icono">⌂</span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/cursospreceptor"
            className={({ isActive }) =>
              `historial-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="historial-icono">▤</span>
            <span>Cursos</span>
          </NavLink>

          <NavLink
            to="/alumnospreceptor"
            className={({ isActive }) =>
              `historial-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="historial-icono">♙</span>
            <span>Alumnos</span>
          </NavLink>

          <NavLink
            to="/notificacionpreceptor"
            className={({ isActive }) =>
              `historial-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="historial-icono">♧</span>
            <span>Notificaciones</span>
          </NavLink>

          <NavLink
            to="/historialpreceptor"
            end
            className={({ isActive }) =>
              `historial-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="historial-icono">▤</span>
            <span>Historial</span>
          </NavLink>
        </nav>

        {/* Cerrar sesión: por ahora solo lleva a /login */}
        <Link
          to="/login"
          className="historial-cerrar-sesion"
        >
          <span className="historial-icono">⇥</span>
          <span>Cerrar sesión</span>
        </Link>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="historial-contenido">
        {/* Encabezado: título a la izquierda, fecha y botón de login a la derecha */}
        <header className="historial-header">
          <div className="historial-titulo">
            <h1>
              <span className="historial-titulo-icono">▤</span>
              Historial
            </h1>

            <p>Inicio &nbsp;›&nbsp; Historial</p>
          </div>

          <div className="historial-header-derecha">
            {/* Fecha de hoy (viene del estado fecha) */}
            <div className="historial-fecha">
              <span>▦</span>
              <p>{fechaFormateada}</p>
            </div>

            {/* Botón "Iniciar sesión": ejecuta iniciarSesion (lleva a /login) */}
            <button
              type="button"
              className="historial-login"
              onClick={iniciarSesion}
            >
              Iniciar sesión
              <span>↗</span>
            </button>
          </div>
        </header>

        {/* TÍTULO DE SECCIÓN */}
        <section className="historial-introduccion">
          <h2>Historial de comunicaciones</h2>
          <p>
            Consultá las comunicaciones realizadas y sus estados.
          </p>
        </section>

        {/* FILTROS */}
        <section className="historial-filtros">
          {/* Curso: las opciones son fijas (de 1.º a 6.º año) y no salen de la base de datos. Los 4 filtros guardan lo elegido en estados, pero todavía no filtran nada */}
          <div className="historial-campo">
            <label htmlFor="filtro-curso">Curso</label>

            <select
              id="filtro-curso"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
            >
              <option value="">Todos los cursos</option>
              <option value="1">1.º año</option>
              <option value="2">2.º año</option>
              <option value="3">3.º año</option>
              <option value="4">4.º año</option>
              <option value="5">5.º año</option>
              <option value="6">6.º año</option>
            </select>
          </div>

          {/* Alumno: por ahora solo tiene la opción "Todos los alumnos" */}
          <div className="historial-campo">
            <label htmlFor="filtro-alumno">Alumno</label>

            <select
              id="filtro-alumno"
              value={alumno}
              onChange={(e) => setAlumno(e.target.value)}
            >
              <option value="">Todos los alumnos</option>
            </select>
          </div>

          {/* Fecha desde */}
          <div className="historial-campo">
            <label htmlFor="fecha-desde">Fecha desde</label>

            <input
              id="fecha-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          {/* Fecha hasta (junto con la anterior forma el rango de fechas) */}
          <div className="historial-campo">
            <label htmlFor="fecha-hasta">Fecha hasta</label>

            <input
              id="fecha-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>

          {/* "Filtrar" ejecuta filtrarHistorial, que por ahora solo muestra un aviso */}
          <button
            type="button"
            className="historial-filtrar"
            onClick={filtrarHistorial}
          >
            <span>⌕</span>
            Filtrar
          </button>
        </section>

        {/* TABLA DE HISTORIAL */}
        <section className="historial-tabla-panel">
          {/* Si la tabla no entra en pantalla, el scroll horizontal aparece solo acá adentro */}
          <div className="historial-tabla-scroll">
            <table className="historial-tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Alumno</th>
                  <th>Asunto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              {/* Hoy tiene una sola fila que ocupa las 5 columnas (colSpan) con el mensaje de vacío. Cuando haya comunicaciones, acá irían sus filas */}
              <tbody>
                <tr>
                  <td colSpan={5}>
                    {/* Mensaje de "No hay comunicaciones registradas" */}
                    <div className="historial-vacio">
                      <div className="historial-vacio-icono">
                        ▤
                      </div>

                      <h3>
                        No hay comunicaciones registradas
                      </h3>

                      <p>
                        Cuando se realicen comunicaciones,
                        aparecerán acá para que puedas consultar
                        su historial.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Paginación de abajo de la tabla: por ahora es solo visual, con todos los botones deshabilitados */}
          <div className="historial-paginacion">
            <span>Mostrando 0 comunicaciones</span>

            <div className="historial-paginas">
              <button type="button" disabled>
                ← Anterior
              </button>

              <button
                type="button"
                className="pagina-actual"
                disabled
              >
                1
              </button>

              <button type="button" disabled>
                Siguiente →
              </button>
            </div>
          </div>
        </section>

        {/* Pie de la pantalla */}
        <footer className="historial-footer">
          Cuaderno de Comunicaciones Digital · EPET 20
        </footer>
      </main>
    </div>
  );
}

export default HistorialPreceptor;