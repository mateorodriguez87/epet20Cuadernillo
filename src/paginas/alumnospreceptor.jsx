import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

import "../estilos/alumnospreceptor.css";
import "../estilos/modalalumnospreceptor.css";

function AlumnosPreceptor() {
  const navigate = useNavigate();

  // Datos obtenidos de Firebase
  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Filtros y paginación
  const [busqueda, setBusqueda] = useState("");
  const [curso, setCurso] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(6);

  // Modal para agregar alumnos
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    dni: "",
    curso: "",
  });

  // Estados visuales de las comunicaciones
  const estados = {
    ok: {
      titulo: "Al día",
      icono: "✔",
      detalle: "Todas las comunicaciones confirmadas",
    },
    pendiente: {
      titulo: "Pendiente",
      icono: "◷",
      detalle: "Tiene comunicaciones sin leer",
    },
    obs: {
      titulo: "Con observaciones",
      icono: "!",
      detalle: "Requiere revisión",
    },
  };

  // Escuchar alumnos de Firebase en tiempo real
  useEffect(() => {
    const cancelarAlumnos = onSnapshot(
      collection(db, "Alumnos"),
      (snapshot) => {
        const lista = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setAlumnos(lista);
        setCargando(false);
        setError("");
      },
      (error) => {
        console.error("Error al obtener alumnos:", error);
        setError("No se pudieron cargar los alumnos.");
        setCargando(false);
      }
    );

    return () => cancelarAlumnos();
  }, []);

  // Escuchar cursos de Firebase en tiempo real
  useEffect(() => {
    const cancelarCursos = onSnapshot(
      collection(db, "Cursos"),
      (snapshot) => {
        const lista = snapshot.docs.map((documento) => {
          const datos = documento.data();

          return {
            id: documento.id,
            ...datos,
            nombre: `${datos.curso || ""} ${datos.division || ""}`.trim(),
          };
        });

        setCursos(lista);
      },
      (error) => {
        console.error("Error al obtener cursos:", error);
      }
    );

    return () => cancelarCursos();
  }, []);

  // Obtener las iniciales del alumno
  function iniciales(nombre = "") {
    return nombre
      .split(" ")
      .filter(Boolean)
      .map((palabra) => palabra[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  // Abrir modal
  function abrirModal() {
    setFormulario({
      nombre: "",
      dni: "",
      curso: "",
    });

    setMensaje("");
    setTipoMensaje("");
    setMostrarModal(true);
  }

  // Cerrar modal
  function cerrarModal() {
    if (guardando) return;

    setMostrarModal(false);
    setMensaje("");
    setTipoMensaje("");
  }

  // Actualizar campos
  function manejarCambio(e) {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // Registrar alumno en Firebase
  async function agregarAlumno(e) {
    e.preventDefault();

    setMensaje("");
    setTipoMensaje("");

    const nombre = formulario.nombre.trim();
    const dni = formulario.dni.trim();

    const cursoSeleccionado = cursos.find(
      (c) => c.id === formulario.curso
    );

    if (!nombre || !dni || !cursoSeleccionado) {
      setMensaje("Completá todos los campos.");
      setTipoMensaje("error");
      return;
    }

    if (!/^\d{7,8}$/.test(dni)) {
      setMensaje("Ingresá un DNI válido de 7 u 8 números.");
      setTipoMensaje("error");
      return;
    }

    // Evitar registrar dos veces el mismo DNI
    const dniExistente = alumnos.some(
      (alumno) => String(alumno.dni || "").trim() === dni
    );

    if (dniExistente) {
      setMensaje("Ya existe un alumno registrado con ese DNI.");
      setTipoMensaje("error");
      return;
    }

    setGuardando(true);

    try {
      await addDoc(collection(db, "Alumnos"), {
        nombre,
        dni,
        curso: cursoSeleccionado.nombre,
        cursoId: cursoSeleccionado.id,
        estado: "ok",
        detalle: "Sin comunicaciones pendientes",
        creadoEn: serverTimestamp(),
      });

      setMensaje("");
      setMostrarModal(false);

      setFormulario({
        nombre: "",
        dni: "",
        curso: "",
      });

      setPagina(1);
    } catch (error) {
      console.error("Error al registrar alumno:", error);

      setMensaje(
        "No se pudo registrar el alumno. Revisá la conexión con Firebase."
      );

      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  }

  // Filtrar alumnos
  const alumnosFiltrados = alumnos.filter((alumno) => {
    const coincideNombre = (alumno.nombre || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideDni = String(alumno.dni || "").includes(busqueda);

    const coincideCurso =
      curso === "todos" ||
      alumno.cursoId === curso ||
      alumno.curso === curso;

    const coincideEstado =
      estado === "todos" || alumno.estado === estado;

    return (
      (coincideNombre || coincideDni) &&
      coincideCurso &&
      coincideEstado
    );
  });

  // Paginación
  const totalPaginas = Math.max(
    1,
    Math.ceil(alumnosFiltrados.length / porPagina)
  );

  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * porPagina;

  const alumnosPagina = alumnosFiltrados.slice(
    inicio,
    inicio + porPagina
  );

  const desde = alumnosFiltrados.length === 0 ? 0 : inicio + 1;
  const hasta = inicio + alumnosPagina.length;

  const numeros = [];

  for (let i = 1; i <= totalPaginas; i++) {
    if (i <= 5 || i === totalPaginas) {
      numeros.push(i);
    } else if (numeros[numeros.length - 1] !== "…") {
      numeros.push("…");
    }
  }

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
            <span className="menu-icon">▤</span>
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
        </header>

        {/* FILTROS Y BOTONES */}
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

            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
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

          <button
            type="button"
            className="boton-primario"
            onClick={abrirModal}
          >
            + Agregar alumno
          </button>

          <button
            type="button"
            className="boton-dar-baja"
            onClick={() => navigate("/altabajaalumnos")}
          >
            − Dar de baja alumno
          </button>
        </section>

        {/* TARJETAS SUPERIORES */}
        <section className="estadisticas">
          <div className="tarjeta estadistica">
            <div className="icono-card azul">👥</div>
            <div className="info-card">
              <span>Total alumnos</span>
              <strong>{alumnos.length}</strong>
            </div>
          </div>

          <div className="tarjeta estadistica">
            <div className="icono-card verde">▤</div>
            <div className="info-card">
              <span>Comunicaciones enviadas (mes)</span>
              <strong>—</strong>
            </div>
          </div>

          <div className="tarjeta estadistica">
            <div className="icono-card naranja">✉</div>
            <div className="info-card">
              <span>Pendientes de leer</span>
              <strong>—</strong>
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
                {cargando ? (
                  <tr>
                    <td colSpan={5} className="sin-datos">
                      Cargando alumnos...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="sin-datos">
                      {error}
                    </td>
                  </tr>
                ) : alumnosPagina.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="sin-datos">
                      No hay alumnos para mostrar.
                      {busqueda && " Probá con otra búsqueda."}
                    </td>
                  </tr>
                ) : (
                  alumnosPagina.map((alumno) => {
                    const estadoActual =
                      estados[alumno.estado] || estados.ok;

                    return (
                      <tr key={alumno.id}>
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
                          <span
                            className={`estado estado-${alumno.estado || "ok"}`}
                            title={estadoActual.detalle}
                          >
                            {estadoActual.icono} {estadoActual.titulo}
                          </span>
                        </td>

                        <td>
                          <div className="acciones-fila">
                            <button
                              type="button"
                              className="boton-secundario"
                              onClick={() =>
                                navigate("/altabajaalumnos")
                              }
                            >
                              Dar de baja
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="paginacion">
            <span>
              Mostrando {desde}–{hasta} de {alumnosFiltrados.length} alumnos
            </span>

            <div className="controles-paginacion">
              <label htmlFor="porPagina">Mostrar:</label>

              <select
                id="porPagina"
                value={porPagina}
                onChange={(e) => {
                  setPorPagina(Number(e.target.value));
                  setPagina(1);
                }}
              >
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>

              <button
                type="button"
                disabled={paginaActual === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>

              {numeros.map((numero, index) =>
                numero === "…" ? (
                  <span key={`puntos-${index}`}>…</span>
                ) : (
                  <button
                    type="button"
                    key={numero}
                    className={paginaActual === numero ? "pagina-activa" : ""}
                    onClick={() => setPagina(numero)}
                  >
                    {numero}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={paginaActual === totalPaginas}
                onClick={() =>
                  setPagina((p) => Math.min(totalPaginas, p + 1))
                }
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL PARA AGREGAR ALUMNOS */}
      {mostrarModal && (
        <div className="fondo-modal" onClick={cerrarModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Agregar alumno</h2>
            <p>Completá los datos para registrar un nuevo alumno.</p>

            <form onSubmit={agregarAlumno}>
              <div className="campo">
                <label htmlFor="nombre">Nombre y apellido</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  className="entrada"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  placeholder="Ingresá el nombre completo"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="dni">DNI</label>
                <input
                  id="dni"
                  name="dni"
                  type="text"
                  className="entrada"
                  value={formulario.dni}
                  onChange={manejarCambio}
                  placeholder="Ej.: 12345678"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="curso">Curso</label>
                <select
                  id="curso"
                  name="curso"
                  className="entrada"
                  value={formulario.curso}
                  onChange={manejarCambio}
                  required
                >
                  <option value="">Seleccionar curso</option>

                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {mensaje && (
                <p className={`mensaje ${tipoMensaje}`}>
                  {mensaje}
                </p>
              )}

              <div className="botones">
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="boton-primario"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar alumno"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlumnosPreceptor;