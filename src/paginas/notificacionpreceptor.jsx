
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../estilos/notificacionpreceptor.css";

function NotificacionPreceptor() {
  const datos = {
    alumnos: [],
  };

  const [fecha, setFecha] = useState(new Date());
  const [alumnoId, setAlumnoId] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [fechaEnvio, setFechaEnvio] = useState("");
  const [prioridad, setPrioridad] = useState("normal");

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

  const alumnoSeleccionado = datos.alumnos.find(
    (alumno) => String(alumno.id) === String(alumnoId)
  );

  const listoParaEnviar =
    alumnoSeleccionado &&
    asunto.trim() !== "" &&
    mensaje.trim() !== "";

  function limpiarFormulario() {
    setAlumnoId("");
    setAsunto("");
    setMensaje("");
    setFechaEnvio("");
    setPrioridad("normal");
  }

  function enviar(e) {
    e.preventDefault();

    if (!listoParaEnviar) return;

    // Acá se conecta con la base de datos.
    // La notificación todavía no se guarda ni se envía.
  }

  function iniciarSesion() {
    alert("Próximamente podrás iniciar sesión.");
  }

  return (
    <div className="panel">

      {/* PANEL LATERAL */}
      <aside className="sidebar">
        <div className="logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        <nav className="menu">
          <Link to="/preceptor" className="menu-item">
            <span className="menu-icon">⌂</span>
            <span>Inicio</span>
          </Link>

          <Link to="/cursospreceptor" className="menu-item">
            <span className="menu-icon">▤</span>
            <span>Cursos</span>
          </Link>

          <Link to="/alumnospreeceptor" className="menu-item">
            <span className="menu-icon">♙</span>
            <span>Alumnos</span>
          </Link>

          <Link
            to="/notificacionpreceptor"
            className="menu-item activo"
          >
            <span className="menu-icon">♧</span>
            <span>Notificaciones</span>
          </Link>

          <Link to="/historialpreceptor" className="menu-item">
            <span className="menu-icon">▤</span>
            <span>Historial</span>
          </Link>
        </nav>

        <button
          type="button"
          className="cerrar-sesion"
          onClick={iniciarSesion}
        >
          <span className="logout-icon">⇥</span>
          <span>Iniciar sesión</span>
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="contenido">

        {/* ENCABEZADO */}
        <header className="encabezado encabezado-alumnos">
          <div>
            <h1>Notificaciones</h1>
            <p>
              Inicio &gt; Notificaciones &gt; Nueva notificación
            </p>
          </div>

          <div className="encabezado-derecha">
            <div className="fecha">
              <span>{fechaFormateada}</span>
            </div>

            <button
              type="button"
              className="boton-login"
              onClick={iniciarSesion}
            >
              Iniciar sesión <span>↗</span>
            </button>
          </div>
        </header>

        <p className="subtitulo">
          Crear y enviar comunicaciones a padres y tutores.
        </p>

        {/* FORMULARIO Y RESUMEN */}
        <section className="zona-formulario">

          {/* FORMULARIO */}
          <form className="tarjeta formulario" onSubmit={enviar}>

            <div className="campo">
              <label htmlFor="alumno">Alumno</label>

              <select
                id="alumno"
                className="entrada"
                value={alumnoId}
                onChange={(e) => setAlumnoId(e.target.value)}
                required
              >
                <option value="">Seleccionar alumno</option>

                {datos.alumnos.map((alumno, index) => (
                  <option
                    key={alumno.id || index}
                    value={alumno.id}
                  >
                    {alumno.nombre}
                  </option>
                ))}
              </select>

              {datos.alumnos.length === 0 && (
                <small className="campo-ayuda">
                  No hay alumnos disponibles para seleccionar.
                </small>
              )}
            </div>

            <div className="campo">
              <label htmlFor="asunto">Asunto</label>

              <input
                id="asunto"
                type="text"
                className="entrada"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="mensaje">Mensaje</label>

              <textarea
                id="mensaje"
                className="entrada"
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                required
              />
            </div>

            <div className="campo campo-fecha">
              <label htmlFor="fecha-envio">Fecha</label>

              <input
                id="fecha-envio"
                type="date"
                className="entrada"
                value={fechaEnvio}
                onChange={(e) => setFechaEnvio(e.target.value)}
              />
            </div>

            <div className="campo">
              <label>Prioridad</label>

              <label className="opcion">
                <input
                  type="radio"
                  name="prioridad"
                  value="normal"
                  checked={prioridad === "normal"}
                  onChange={(e) => setPrioridad(e.target.value)}
                />
                <span>Normal</span>
              </label>

              <label className="opcion">
                <input
                  type="radio"
                  name="prioridad"
                  value="importante"
                  checked={prioridad === "importante"}
                  onChange={(e) => setPrioridad(e.target.value)}
                />
                <span>Importante</span>
              </label>
            </div>

            {/* BOTONES */}
            <div className="botones">
              <button
                type="button"
                className="boton-secundario"
                onClick={limpiarFormulario}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="boton-primario"
                disabled={!listoParaEnviar}
              >
                ➤ Enviar
              </button>
            </div>
          </form>

          {/* RESUMEN */}
          <aside className="tarjeta resumen">
            <div className="titulo-seccion">
              <h2>Resumen</h2>
            </div>

            <div className="resumen-item">
              <div className="icono-card azul">♙</div>

              <div>
                <span>Alumno seleccionado:</span>
                <strong>
                  {alumnoSeleccionado
                    ? alumnoSeleccionado.nombre
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="resumen-item">
              <div className="icono-card azul">♟</div>

              <div>
                <span>Tutor:</span>
                <strong>
                  {alumnoSeleccionado?.tutor || "—"}
                </strong>
              </div>
            </div>

            <div className="resumen-item">
              <div className="icono-card azul">✉</div>

              <div>
                <span>Estado:</span>

                <span
                  className={`estado-etiqueta ${
                    listoParaEnviar ? "listo" : "incompleto"
                  }`}
                >
                  {listoParaEnviar
                    ? "Listo para enviar"
                    : "Faltan datos"}
                </span>
              </div>
            </div>

            <div className="aviso">
              <span className="aviso-icono">i</span>
              <p>
                Al enviar, la notificación podrá registrarse
                y enviarse al tutor cuando se conecte el sistema.
              </p>
            </div>
          </aside>
        </section>

      </main>
    </div>
  );
}

export default NotificacionPreceptor;
