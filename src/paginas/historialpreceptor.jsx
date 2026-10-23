
import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "../estilos/historialpreceptor.css";

function HistorialPreceptor() {
  const [fecha, setFecha] = useState(new Date());
  const [curso, setCurso] = useState("");
  const [alumno, setAlumno] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

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

  function filtrarHistorial() {
    alert("Todavía no hay comunicaciones para filtrar.");
  }

  return (
    <div className="historial-pagina">
      {/* PANEL LATERAL */}
      <aside className="historial-sidebar">
        <div className="historial-logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

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
        <header className="historial-header">
          <div className="historial-titulo">
            <h1>
              <span className="historial-titulo-icono">▤</span>
              Historial
            </h1>

            <p>Inicio &nbsp;›&nbsp; Historial</p>
          </div>

          <div className="historial-header-derecha">
            <div className="historial-fecha">
              <span>▦</span>
              <p>{fechaFormateada}</p>
            </div>

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

          <div className="historial-campo">
            <label htmlFor="fecha-desde">Fecha desde</label>

            <input
              id="fecha-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          <div className="historial-campo">
            <label htmlFor="fecha-hasta">Fecha hasta</label>

            <input
              id="fecha-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>

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

              <tbody>
                <tr>
                  <td colSpan={5}>
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

        <footer className="historial-footer">
          Cuaderno de Comunicaciones Digital · EPET 20
        </footer>
      </main>
    </div>
  );
}

export default HistorialPreceptor;
