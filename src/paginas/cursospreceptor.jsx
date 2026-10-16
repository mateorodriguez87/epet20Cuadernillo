
import { useEffect, useState } from "react";
import "../estilos/cursospreceptor.css";

function CursosPreceptor() {
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
    alert("Próximamente podrás iniciar sesión.");
  }

  function agregarCursos() {
    alert("Próximamente podrás agregar cursos.");
  }

  return (
    <div className="cursos-pagina">
      {/* Panel lateral */}
      <aside className="cursos-sidebar">
        <div className="cursos-logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        <nav className="cursos-menu">
          <a href="/" className="cursos-menu-item">
            <span className="cursos-icono">⌂</span>
            <span>Inicio</span>
          </a>

          <a href="/cursos" className="cursos-menu-item activo">
            <span className="cursos-icono">▤</span>
            <span>Cursos</span>
          </a>

          <a href="/alumnos" className="cursos-menu-item">
            <span className="cursos-icono">♙</span>
            <span>Alumnos</span>
          </a>

          <a href="/notificaciones" className="cursos-menu-item">
            <span className="cursos-icono">♧</span>
            <span>Notificaciones</span>
          </a>

          <a href="/historial" className="cursos-menu-item">
            <span className="cursos-icono">▤</span>
            <span>Historial</span>
          </a>
        </nav>

        <button
          className="cursos-cerrar-sesion"
          onClick={iniciarSesion}
        >
          <span className="cursos-icono">⇥</span>
          <span>Iniciar sesión</span>
        </button>
      </aside>

      {/* Contenido principal */}
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
              className="cursos-login"
              onClick={iniciarSesion}
            >
              Iniciar sesión
              <span>↗</span>
            </button>
          </div>
        </header>

        {/* Buscador y botón */}
        <section className="cursos-acciones">
          <div className="cursos-buscador">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Buscar curso..."
              aria-label="Buscar curso"
            />
          </div>

          <button
            className="cursos-agregar"
            onClick={agregarCursos}
          >
            <span>＋</span>
            Agregar cursos
          </button>
        </section>

        {/* Panel de cursos */}
        <section className="cursos-panel">
          <div className="cursos-panel-titulo">
            <h2>Mis cursos asignados</h2>
            <span className="cursos-contador">0 cursos</span>
          </div>

          <div className="cursos-vacio">
            <div className="cursos-vacio-icono">▤</div>

            <h2>No hay cursos asignados</h2>

            <p>
              Todavía no tenés cursos asignados.
              Agregá un curso para comenzar a organizar
              tus alumnos y sus comunicaciones.
            </p>

            <button
              className="cursos-agregar cursos-agregar-centro"
              onClick={agregarCursos}
            >
              <span>＋</span>
              Agregar cursos
            </button>
          </div>
        </section>

        <footer className="cursos-footer">
          Cuaderno de Comunicaciones Digital · EPET 20
        </footer>
      </main>
    </div>
  );
}

export default CursosPreceptor;
