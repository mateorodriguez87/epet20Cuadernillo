
import { useEffect, useState } from "react";
import "../estilos/cursospreceptor.css";

function CursosPreceptor() {
  const [fecha, setFecha] = useState(new Date());
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");

  // Por ahora no hay cursos cargados.
  const cursos = [];

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

  function agregarCursos() {
    alert("Próximamente podrás agregar cursos.");
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

    alert("Próximamente podrás crear una notificación para el curso.");
    cerrarModal();
  }

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
          <a href="/preceptor" className="cursos-menu-item">
            <span className="cursos-icono">⌂</span>
            <span>Inicio</span>
          </a>

          <a href="/cursospreceptor" className="cursos-menu-item activo">
            <span className="cursos-icono">▤</span>
            <span>Cursos</span>
          </a>

          <a href="/alumnospreeceptor" className="cursos-menu-item">
            <span className="cursos-icono">♙</span>
            <span>Alumnos</span>
          </a>

          <a href="/notificacionpreceptor" className="cursos-menu-item">
            <span className="cursos-icono">♧</span>
            <span>Notificaciones</span>
          </a>

          <a href="/historialpreceptor" className="cursos-menu-item">
            <span className="cursos-icono">▤</span>
            <span>Historial</span>
          </a>
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

        {/* PANEL DE CURSOS */}
        <section className="cursos-panel">
          <div className="cursos-panel-titulo">
            <h2>Mis cursos asignados</h2>

            <span className="cursos-contador">
              {cursos.length} cursos
            </span>
          </div>

          {cursos.length === 0 ? (
            <div className="cursos-vacio">
              <div className="cursos-vacio-icono">▤</div>

              <h2>No hay cursos asignados</h2>

              <p>
                Todavía no tenés cursos asignados.
                Agregá un curso para comenzar a organizar
                tus alumnos y sus comunicaciones.
              </p>

              <button
                type="button"
                className="cursos-agregar cursos-agregar-centro"
                onClick={agregarCursos}
              >
                <span>＋</span>
                Agregar cursos
              </button>
            </div>
          ) : (
            <div className="cursos-lista">
              {cursos.map((curso) => (
                <div className="cursos-elemento" key={curso.id}>
                  {curso.nombre}
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
                  Seleccioná el curso al que querés enviar
                  una comunicación.
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
                onChange={(e) =>
                  setCursoSeleccionado(e.target.value)
                }
                disabled={cursos.length === 0}
              >
                <option value="">
                  Seleccionar curso
                </option>

                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nombre}
                  </option>
                ))}
              </select>

              {cursos.length === 0 && (
                <div className="cursos-modal-vacio">
                  <span>ⓘ</span>

                  <div>
                    <strong>No hay cursos disponibles</strong>
                    <p>
                      Primero necesitás tener un curso cargado
                      para poder enviarle una notificación.
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
                  disabled={
                    cursos.length === 0 || !cursoSeleccionado
                  }
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
