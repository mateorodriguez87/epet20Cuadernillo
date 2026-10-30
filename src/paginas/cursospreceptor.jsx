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

function CursosPreceptor() {
  const [fecha, setFecha] = useState(new Date());
  const [cursos, setCursos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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
        setError("No se pudieron cargar los cursos. Revisá las reglas de Firebase.");
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

  // Mostrar el nombre completo del curso.
  function nombreCurso(curso) {
    return `${curso.curso || ""} ${curso.division || ""}`.trim();
  }

  // Agregar un curso a Firebase.
  async function agregarCursos() {
    const nombre = prompt(
      "Ingresá el año del curso (ejemplo: primero):"
    );

    if (!nombre || !nombre.trim()) return;

    const division = prompt(
      "Ingresá la división (ejemplo: primera):"
    );

    if (!division || !division.trim()) return;

    try {
      await addDoc(collection(db, "Cursos"), {
        curso: nombre.trim().toLowerCase(),
        division: division.trim().toLowerCase(),
      });

      alert("¡Curso agregado correctamente!");
    } catch (error) {
      console.error("Error al agregar el curso:", error);
      alert("No se pudo agregar el curso. Revisá las reglas de Firebase.");
    }
  }

  // Editar un curso.
  async function editarCurso(curso) {
    const nombre = prompt(
      "Modificá el año del curso:",
      curso.curso || ""
    );

    if (!nombre || !nombre.trim()) return;

    const division = prompt(
      "Modificá la división:",
      curso.division || ""
    );

    if (!division || !division.trim()) return;

    try {
      await updateDoc(doc(db, "Cursos", curso.id), {
        curso: nombre.trim().toLowerCase(),
        division: division.trim().toLowerCase(),
      });

      alert("¡Curso actualizado correctamente!");
    } catch (error) {
      console.error("Error al editar el curso:", error);
      alert("No se pudo editar el curso.");
    }
  }

  // Eliminar un curso.
  async function eliminarCurso(curso) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar el curso ${nombreCurso(curso)}?`
    );

    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "Cursos", curso.id));
      alert("¡Curso eliminado correctamente!");
    } catch (error) {
      console.error("Error al eliminar el curso:", error);
      alert("No se pudo eliminar el curso.");
    }
  }

  function iniciarSesion() {
    window.location.href = "/login";
  }

  function abrirNotificacion() {
    setCursoSeleccionado("");
    setMostrarModal(true);
  }

  function cerrarModal() {
    setMostrarModal(false);
    setCursoSeleccionado("");
  }

  function notificarCurso(e) {
    e.preventDefault();

    if (!cursoSeleccionado) return;

    alert("Seleccionaste el curso. Próximamente conectaremos el envío de notificaciones.");
    cerrarModal();
  }

  // Filtrar cursos mediante el buscador.
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
              onClick={agregarCursos}
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
                  onClick={agregarCursos}
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
                      onClick={() => editarCurso(curso)}
                      aria-label={`Editar ${nombreCurso(curso)}`}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarCurso(curso)}
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

      {/* VENTANA PARA NOTIFICAR A UN CURSO */}
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
                  Notificar al curso
                </h2>
                <p>
                  Seleccioná el curso al que querés enviar una comunicación.
                </p>
              </div>

              <button
                type="button"
                className="cursos-modal-cerrar"
                onClick={cerrarModal}
                aria-label="Cerrar ventana"
              >
                ×
              </button>
            </div>

            <form onSubmit={notificarCurso}>
              <label htmlFor="seleccionar-curso">
                Curso
              </label>

              <select
                id="seleccionar-curso"
                value={cursoSeleccionado}
                onChange={(e) => setCursoSeleccionado(e.target.value)}
                disabled={cursos.length === 0}
              >
                <option value="">Seleccionar curso</option>

                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {nombreCurso(curso)}
                  </option>
                ))}
              </select>

              {cursos.length === 0 && (
                <div className="cursos-modal-vacio">
                  <span>ⓘ</span>
                  <div>
                    <strong>No hay cursos disponibles</strong>
                    <p>
                      Primero necesitás cargar un curso.
                    </p>
                  </div>
                </div>
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
          </section>
        </div>
      )}
    </div>
  );
}

export default CursosPreceptor;