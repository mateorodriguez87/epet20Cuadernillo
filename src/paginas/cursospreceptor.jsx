import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import "../estilos/cursospreceptor.css";
import "../estilos/modalcursospreceptor.css";

function CursosPreceptor() {
  const [fecha, setFecha] = useState(new Date());
  const [cursos, setCursos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoModal, setTipoModal] = useState("");
  const [cursoActual, setCursoActual] = useState(null);

  const [formulario, setFormulario] = useState({
    curso: "",
    division: "",
  });

  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Obtener los cursos de Firebase en tiempo real.
  useEffect(() => {
    const cancelar = onSnapshot(
      collection(db, "Cursos"),
      (snapshot) => {
        setCursos(
          snapshot.docs.map((documento) => ({
            id: documento.id,
            ...documento.data(),
          }))
        );
        setCargando(false);
        setError("");
      },
      (error) => {
        console.error("Error al obtener cursos:", error);
        setError("No se pudieron cargar los cursos.");
        setCargando(false);
      }
    );

    return () => cancelar();
  }, []);

  // Actualizar la fecha.
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

  function nombreCurso(curso) {
    return `${curso.curso || ""} ${curso.division || ""}`.trim();
  }

  // Abrir el formulario para agregar un curso.
  function abrirAgregar() {
    setFormulario({ curso: "", division: "" });
    setCursoActual(null);
    setMensaje("");
    setTipoModal("agregar");
    setMostrarModal(true);
  }

  // Abrir el formulario para editar un curso.
  function abrirEditar(curso) {
    setFormulario({
      curso: curso.curso || "",
      division: curso.division || "",
    });
    setCursoActual(curso);
    setMensaje("");
    setTipoModal("editar");
    setMostrarModal(true);
  }

  // Abrir la confirmación personalizada para eliminar.
  function abrirEliminar(curso) {
    setCursoActual(curso);
    setMensaje("");
    setTipoModal("eliminar");
    setMostrarModal(true);
  }

  // Abrir el formulario de notificación.
  function abrirNotificacion() {
    setCursoSeleccionado("");
    setMensaje("");
    setTipoModal("notificar");
    setMostrarModal(true);
  }

  function cerrarModal() {
    if (guardando) return;

    setMostrarModal(false);
    setTipoModal("");
    setCursoActual(null);
    setMensaje("");
  }

  function manejarCambio(e) {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // Guardar un curso nuevo o editar uno existente.
  async function guardarCurso(e) {
    e.preventDefault();
    setMensaje("");

    const nombre = formulario.curso.trim();
    const division = formulario.division.trim();

    if (!nombre || !division) {
      setMensaje("Completá todos los campos.");
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        curso: nombre.toLowerCase(),
        division: division.toLowerCase(),
      };

      if (tipoModal === "agregar") {
        await addDoc(collection(db, "Cursos"), datos);
      } else {
        await updateDoc(doc(db, "Cursos", cursoActual.id), datos);
      }

      setMostrarModal(false);
      setTipoModal("");
      setCursoActual(null);
      setMensaje("");
    } catch (error) {
      console.error("Error al guardar el curso:", error);
      setMensaje("No se pudo guardar el curso. Intentá nuevamente.");
    } finally {
      setGuardando(false);
    }
  }

  // Eliminar un curso.
  async function confirmarEliminar() {
    if (!cursoActual) return;

    setGuardando(true);
    setMensaje("");

    try {
      await deleteDoc(doc(db, "Cursos", cursoActual.id));
      setMostrarModal(false);
      setTipoModal("");
      setCursoActual(null);
    } catch (error) {
      console.error("Error al eliminar el curso:", error);
      setMensaje("No se pudo eliminar el curso. Intentá nuevamente.");
    } finally {
      setGuardando(false);
    }
  }

  // Por ahora, la notificación no se envía: todavía no está conectada.
  function notificarCurso(e) {
    e.preventDefault();

    if (!cursoSeleccionado) {
      setMensaje("Seleccioná un curso.");
      return;
    }

    setMensaje(
      "El curso fue seleccionado. El envío de notificaciones todavía no está conectado."
    );
  }

  function iniciarSesion() {
    window.location.href = "/login";
  }

  const cursosFiltrados = cursos.filter((curso) =>
    nombreCurso(curso).toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="cursos-pagina">
      {/* PANEL LATERAL */}
      <aside className="cursos-sidebar">
        <div className="cursos-logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        <nav className="cursos-menu">
          <NavLink
            to="/preceptor"
            end
            className={({ isActive }) =>
              `cursos-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="cursos-icono">⌂</span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/cursospreceptor"
            end
            className={({ isActive }) =>
              `cursos-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="cursos-icono">▤</span>
            <span>Cursos</span>
          </NavLink>

          <NavLink
            to="/alumnospreceptor"
            className={({ isActive }) =>
              `cursos-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="cursos-icono">♙</span>
            <span>Alumnos</span>
          </NavLink>

          <NavLink
            to="/notificacionpreceptor"
            className={({ isActive }) =>
              `cursos-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="cursos-icono">♧</span>
            <span>Notificaciones</span>
          </NavLink>

          <NavLink
            to="/historialpreceptor"
            className={({ isActive }) =>
              `cursos-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="cursos-icono">▤</span>
            <span>Historial</span>
          </NavLink>
        </nav>

        <button
          type="button"
          className="cursos-cerrar-sesion"
          onClick={iniciarSesion}
        >
          <span className="cursos-icono">⇥</span>
          <span>Iniciar sesión</span>
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="cursos-contenido">
        <header className="cursos-header">
          <div className="cursos-titulo">
            <h1>
              <span className="titulo-icono">▤</span>
              Cursos
            </h1>
            <p>Inicio &nbsp;›&nbsp; Cursos</p>
          </div>

          <div className="cursos-header-derecha">
            <div className="cursos-fecha">
              <span>▦</span>
              <p>{fechaFormateada}</p>
            </div>

            <button
              type="button"
              className="cursos-login"
              onClick={iniciarSesion}
            >
              Iniciar sesión <span>↗</span>
            </button>
          </div>
        </header>

        {/* BUSCADOR Y BOTONES */}
        <section className="cursos-acciones">
          <div className="cursos-buscador">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Buscar curso..."
              aria-label="Buscar curso"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="cursos-botones">
            <button
              type="button"
              className="cursos-notificar"
              onClick={abrirNotificacion}
            >
              <span>✉</span>
              Notificar al curso
            </button>

            <button
              type="button"
              className="cursos-agregar"
              onClick={abrirAgregar}
            >
              <span>＋</span>
              Agregar cursos
            </button>
          </div>
        </section>

        {/* LISTA DE CURSOS */}
        <section className="cursos-panel">
          <div className="cursos-panel-titulo">
            <h2>Mis cursos asignados</h2>
            <span className="cursos-contador">
              {cursos.length} cursos
            </span>
          </div>

          {cargando ? (
            <p>Cargando cursos...</p>
          ) : error ? (
            <p role="alert">{error}</p>
          ) : cursosFiltrados.length === 0 ? (
            <div className="cursos-vacio">
              <div className="cursos-vacio-icono">▤</div>
              <h2>
                {busqueda
                  ? "No se encontraron cursos"
                  : "No hay cursos asignados"}
              </h2>
              <p>
                {busqueda
                  ? "Probá con otro nombre de curso."
                  : "Agregá un curso para comenzar a organizar tus alumnos y sus comunicaciones."}
              </p>

              {!busqueda && (
                <button
                  type="button"
                  className="cursos-agregar cursos-agregar-centro"
                  onClick={abrirAgregar}
                >
                  <span>＋</span>
                  Agregar cursos
                </button>
              )}
            </div>
          ) : (
            <div className="cursos-lista">
              {cursosFiltrados.map((curso) => (
                <div className="cursos-elemento" key={curso.id}>
                  <div>
                    <h3>{nombreCurso(curso)}</h3>
                    <p>Curso asignado</p>
                  </div>

                  <div className="cursos-acciones-crud">
                    <button
                      type="button"
                      onClick={() => abrirEditar(curso)}
                      aria-label={`Editar ${nombreCurso(curso)}`}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => abrirEliminar(curso)}
                      aria-label={`Eliminar ${nombreCurso(curso)}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="cursos-footer">
          Cuaderno de Comunicaciones Digital · EPET 20
        </footer>
      </main>

      {/* VENTANAS PERSONALIZADAS */}
      {mostrarModal && (
        <div
          className="cursos-modal-fondo"
          onClick={cerrarModal}
        >
          <section
            className="cursos-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-cursos"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cursos-modal-header">
              <div>
                <h2 id="titulo-modal-cursos">
                  {tipoModal === "agregar" && "Agregar curso"}
                  {tipoModal === "editar" && "Editar curso"}
                  {tipoModal === "eliminar" && "Eliminar curso"}
                  {tipoModal === "notificar" && "Notificar al curso"}
                </h2>

                <p>
                  {tipoModal === "agregar" &&
                    "Completá los datos para registrar un nuevo curso."}
                  {tipoModal === "editar" &&
                    "Modificá los datos del curso seleccionado."}
                  {tipoModal === "eliminar" &&
                    "Revisá la información antes de confirmar."}
                  {tipoModal === "notificar" &&
                    "Seleccioná el curso al que querés enviar una comunicación."}
                </p>
              </div>

              <button
                type="button"
                className="cursos-modal-cerrar"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar ventana"
              >
                ×
              </button>
            </div>

            {(tipoModal === "agregar" || tipoModal === "editar") && (
              <form onSubmit={guardarCurso}>
                <div className="cursos-form-grupo">
                  <label htmlFor="curso">Año del curso</label>
                  <input
                    id="curso"
                    name="curso"
                    type="text"
                    placeholder="Ej.: primero o 1°"
                    value={formulario.curso}
                    onChange={manejarCambio}
                    required
                    autoFocus
                  />
                </div>

                <div className="cursos-form-grupo">
                  <label htmlFor="division">División</label>
                  <input
                    id="division"
                    name="division"
                    type="text"
                    placeholder="Ej.: primera o 1"
                    value={formulario.division}
                    onChange={manejarCambio}
                    required
                  />
                </div>

                {mensaje && (
                  <p className="cursos-modal-mensaje" role="alert">
                    {mensaje}
                  </p>
                )}

                <div className="cursos-modal-botones">
                  <button
                    type="button"
                    className="cursos-modal-cancelar"
                    onClick={cerrarModal}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="cursos-modal-enviar"
                    disabled={guardando}
                  >
                    {guardando
                      ? "Guardando..."
                      : tipoModal === "agregar"
                      ? "Guardar curso"
                      : "Guardar cambios"}
                  </button>
                </div>
              </form>
            )}

            {tipoModal === "eliminar" && (
              <div>
                <div className="cursos-modal-confirmacion">
                  ¿Seguro que querés eliminar el curso{" "}
                  <strong>{nombreCurso(cursoActual || {})}</strong>?
                  <p>Esta acción no se puede deshacer.</p>
                </div>

                {mensaje && (
                  <p className="cursos-modal-mensaje" role="alert">
                    {mensaje}
                  </p>
                )}

                <div className="cursos-modal-botones">
                  <button
                    type="button"
                    className="cursos-modal-cancelar"
                    onClick={cerrarModal}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="cursos-modal-eliminar"
                    onClick={confirmarEliminar}
                    disabled={guardando}
                  >
                    {guardando ? "Eliminando..." : "Sí, eliminar"}
                  </button>
                </div>
              </div>
            )}

            {tipoModal === "notificar" && (
              <form onSubmit={notificarCurso}>
                <div className="cursos-form-grupo">
                  <label htmlFor="seleccionar-curso">Curso</label>

                  <select
                    id="seleccionar-curso"
                    value={cursoSeleccionado}
                    onChange={(e) => {
                      setCursoSeleccionado(e.target.value);
                      setMensaje("");
                    }}
                    disabled={cursos.length === 0}
                    required
                  >
                    <option value="">Seleccionar curso</option>

                    {cursos.map((curso) => (
                      <option key={curso.id} value={curso.id}>
                        {nombreCurso(curso)}
                      </option>
                    ))}
                  </select>
                </div>

                {cursos.length === 0 && (
                  <p className="cursos-modal-mensaje">
                    Primero necesitás cargar un curso.
                  </p>
                )}

                {mensaje && (
                  <p className="cursos-modal-mensaje" role="status">
                    {mensaje}
                  </p>
                )}

                <div className="cursos-modal-botones">
                  <button
                    type="button"
                    className="cursos-modal-cancelar"
                    onClick={cerrarModal}
                  >
                    Cerrar
                  </button>

                  <button
                    type="submit"
                    className="cursos-modal-enviar"
                    disabled={!cursoSeleccionado}
                  >
                    Continuar
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default CursosPreceptor;