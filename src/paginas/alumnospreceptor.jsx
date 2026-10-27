
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "../estilos/alumnospreceptor.css";

//function AlumnosPreceptor() {
 // const datos = {
   // nombre: "",
    //rol: "",
    //iniciales: "",
    //fecha: "",
    //dia: "",
    //cursos: [],
    //alumnos: [],
    //notificaciones: [],
    //comunicaciones: [],
  //};

  const datos = {
  nombre: "",
  rol: "",
  iniciales: "",
  fecha: "",
  dia: "",
  cursos: [
    { id: 1, nombre: "3.º A" },
  ],
  alumnos: [
    {
      id: 1,
      nombre: "Martina González",
      dni: "45123456",
      curso: "3.º A",
      estado: "ok",
      detalle: "Todas las comunicaciones confirmadas",
    },
    {
      id: 2,
      nombre: "Thiago Fernández",
      dni: "46234567",
      curso: "3.º A",
      estado: "pendiente",
      detalle: "Tiene comunicaciones sin leer",
    },
  ],
  notificaciones: [],
  comunicaciones: [],
};

  // Estado de la pantalla (filtros y paginación)
  const [busqueda, setBusqueda] = useState("");
  const [curso, setCurso] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(6);

  // Información visual de cada estado
  const estados = {
    ok: { titulo: "Al día", icono: "✔" },
    pendiente: { titulo: "Pendiente", icono: "◷" },
    obs: { titulo: "Con observaciones", icono: "!" },
  };

  // Filtrado de alumnos
  const alumnosFiltrados = datos.alumnos.filter(
    (alumno) =>
      (alumno.nombre || "")
        .toLowerCase()
        .includes(busqueda.toLowerCase()) &&
      (curso === "todos" || alumno.curso === curso) &&
      (estado === "todos" || alumno.estado === estado)
  );

  // Paginación
  const totalPaginas = Math.max(
    1,
    Math.ceil(alumnosFiltrados.length / porPagina)
  );

  const inicio = (pagina - 1) * porPagina;
  const alumnosPagina = alumnosFiltrados.slice(
    inicio,
    inicio + porPagina
  );

  const desde =
    alumnosFiltrados.length === 0 ? 0 : inicio + 1;

  const hasta = inicio + alumnosPagina.length;

  const numeros = [];

  for (let i = 1; i <= totalPaginas; i++) {
    if (i <= 5 || i === totalPaginas) {
      numeros.push(i);
    } else if (numeros[numeros.length - 1] !== "…") {
      numeros.push("…");
    }
  }

  const iniciales = (nombre = "") =>
    nombre
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2);

  return (
    <div className="panel">
      {/* BARRA LATERAL */}
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
            <span className="menu-icon">♙</span>
            <span>Cursos</span>
          </NavLink>

          <NavLink
            to="/alumnospreceptor"
            end
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

        <Link to="/login" className="cerrar-sesion">
          <span className="logout-icon">⇥</span>
          <span>Cerrar sesión</span>
        </Link>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="contenido">
        {/* ENCABEZADO */}
        <header className="encabezado encabezado-alumnos">
          <div>
            <h1>Alumnos</h1>
            <p>Inicio &gt; Alumnos</p>
          </div>

          <div className="encabezado-derecha">
            <div className="fecha">
              <strong>{datos.fecha || ""}</strong>
              <span>{datos.dia || ""}</span>
            </div>

            <div className="usuario">
              <span className="usuario-avatar">
                {datos.iniciales}
              </span>
              <div>
                <strong>{datos.nombre}</strong>
                <span>{datos.rol}</span>
              </div>
            </div>
          </div>
        </header>

        {/* FILTROS */}
        <section className="filtros">
          <input
            type="search"
            className="buscador"
            placeholder="Buscar alumno..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />

          <select
            className="selector"
            value={curso}
            onChange={(e) => {
              setCurso(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todos">Todos los cursos</option>
            {datos.cursos.map((c, index) => (
              <option key={index} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>

          <select
            className="selector"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setPagina(1);
            }}
          >
            <option value="todos">Estado de comunicaciones</option>
            <option value="ok">Al día</option>
            <option value="pendiente">Pendiente</option>
            <option value="obs">Con observaciones</option>
          </select>

          <button type="button" className="boton-primario">
            + Agregar alumno
          </button>
        </section>

        {/* TARJETAS SUPERIORES */}
        <section className="estadisticas">
          <div className="tarjeta estadistica">
            <div className="icono-card azul">👥</div>
            <div className="info-card">
              <span>Total alumnos</span>
              <strong>
                {datos.alumnos.length > 0
                  ? datos.alumnos.length
                  : "—"}
              </strong>
            </div>
          </div>

          <div className="tarjeta estadistica">
            <div className="icono-card verde">▤</div>
            <div className="info-card">
              <span>Comunicaciones enviadas (mes)</span>
              <strong>
                {datos.comunicaciones.length > 0
                  ? datos.comunicaciones.length
                  : "—"}
              </strong>
            </div>
          </div>

          <div className="tarjeta estadistica">
            <div className="icono-card naranja">✉</div>
            <div className="info-card">
              <span>Pendientes de leer</span>
              <strong>
                {datos.notificaciones.length > 0
                  ? datos.notificaciones.length
                  : "—"}
              </strong>
            </div>
          </div>

          <div className="tarjeta estadistica">
            <div className="icono-card violeta">✔</div>
            <div className="info-card">
              <span>Confirmadas por tutores</span>
              <strong>—</strong>
            </div>
          </div>
        </section>

        {/* TABLA DE ALUMNOS */}
        <section className="tarjeta tabla-alumnos">
          <div className="tabla-scroll">
            <table>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>DNI</th>
                  <th>Curso</th>
                  <th>Estado de comunicaciones</th>
                  <th className="centrado">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {alumnosPagina.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="sin-datos">
                      No hay alumnos para mostrar
                    </td>
                  </tr>
                ) : (
                  alumnosPagina.map((alumno, index) => (
                    <tr key={alumno.id || index}>
                      <td>
                        <div className="alumno">
                          <span className="avatar">
                            {alumno.foto ? (
                              <img
                                src={alumno.foto}
                                alt={alumno.nombre}
                              />
                            ) : (
                              iniciales(alumno.nombre)
                            )}
                          </span>
                          <strong>{alumno.nombre}</strong>
                        </div>
                      </td>

                      <td>{alumno.dni}</td>

                      <td>
                        <span className="etiqueta-curso">
                          {alumno.curso}
                        </span>
                      </td>

                      <td>
                        {estados[alumno.estado] && (
                          <div
                            className={`estado ${alumno.estado}`}
                          >
                            <span className="estado-icono">
                              {estados[alumno.estado].icono}
                            </span>
                            <div>
                              <strong>
                                {estados[alumno.estado].titulo}
                              </strong>
                              <span>{alumno.detalle}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="acciones-fila">
                          <button
                            type="button"
                            className="accion-boton"
                          >
                            <span>◉</span>
                            Ver perfil
                          </button>

                          <button
                            type="button"
                            className="accion-boton"
                          >
                            <span>➤</span>
                            Enviar
                          </button>

                          <button
                            type="button"
                            className="accion-boton"
                          >
                            <span>◷</span>
                            Historial
                          </button>

                          <button
                            type="button"
                            className="mas-opciones"
                          >
                            ⋮
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <footer className="paginacion">
            <p>
              Mostrando {desde} a {hasta} de{" "}
              {alumnosFiltrados.length} alumnos
            </p>

            <div className="paginas">
              <button
                type="button"
                className="boton-pagina"
                disabled={pagina <= 1}
                onClick={() =>
                  setPagina((paginaActual) =>
                    Math.max(1, paginaActual - 1)
                  )
                }
              >
                ← Anterior
              </button>

              {numeros.map((n, index) =>
                n === "…" ? (
                  <span key={`puntos-${index}`} className="puntos">
                    …
                  </span>
                ) : (
                  <button
                    type="button"
                    key={n}
                    className={`numero-pagina ${
                      pagina === n ? "activa" : ""
                    }`}
                    onClick={() => setPagina(n)}
                  >
                    {n}
                  </button>
                )
              )}

              <button
                type="button"
                className="boton-pagina"
                disabled={pagina >= totalPaginas}
                onClick={() =>
                  setPagina((paginaActual) =>
                    Math.min(totalPaginas, paginaActual + 1)
                  )
                }
              >
                Siguiente →
              </button>
            </div>

            <select
              className="selector chico"
              value={porPagina}
              onChange={(e) => {
                setPorPagina(Number(e.target.value));
                setPagina(1);
              }}
            >
              <option value={6}>6 por página</option>
              <option value={12}>12 por página</option>
              <option value={24}>24 por página</option>
            </select>
          </footer>
        </section>
      </main>
    </div>
  );


export default AlumnosPreceptor;
