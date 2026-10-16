import { useState } from "react";
import "../estilos/notificacionpreceptor.css";

function NotificacionPreceptor() {

  const datos = {
    nombre: "",
    rol: "",
    iniciales: "",
    fecha: "",
    dia: "",
    alumnos: []
  };

  /* Estado del formulario */
  const [alumnoId, setAlumnoId] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [fechaEnvio, setFechaEnvio] = useState("");
  const [prioridad, setPrioridad] = useState("normal");

  /* Alumno elegido y estado del resumen */
  const alumnoSeleccionado = datos.alumnos.find(
    (alumno) => String(alumno.id) === String(alumnoId)
  );

  const listoParaEnviar =
    alumnoSeleccionado && asunto.trim() !== "" && mensaje.trim() !== "";

  const limpiarFormulario = () => {
    setAlumnoId("");
    setAsunto("");
    setMensaje("");
    setFechaEnvio("");
    setPrioridad("normal");
  };

  const enviar = (e) => {
    e.preventDefault();
    if (!listoParaEnviar) return;

    // Acá se conecta con la base de datos
    // const notificacion = { alumnoId, asunto, mensaje, fecha: fechaEnvio, prioridad };
  };

  return (
    <div className="panel">

      {/* =========================
          BARRA LATERAL
      ========================= */}

      <aside className="sidebar">

        <div className="logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        <nav className="menu">

          <a href="#" className="menu-item">
            <span className="menu-icon">⌂</span>
            <span>Inicio</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">♙</span>
            <span>Cursos</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">♙</span>
            <span>Alumnos</span>
          </a>

          <a href="#" className="menu-item activo">
            <span className="menu-icon">♧</span>
            <span>Notificaciones</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">▤</span>
            <span>Historial</span>
          </a>

        </nav>

        <a href="#" className="cerrar-sesion">
          <span className="logout-icon">⇥</span>
          <span>Cerrar sesión</span>
        </a>

      </aside>


      {/* =========================
          CONTENIDO
      ========================= */}

      <main className="contenido">

        {/* ENCABEZADO */}

        <header className="encabezado encabezado-alumnos">

          <div>
            <h1>Notificaciones</h1>
            <p>Inicio &gt; Notificaciones &gt; Nueva notificación</p>
          </div>

          <div className="encabezado-derecha">

            <div className="fecha">
              <strong>{datos.fecha || ""}</strong>
              <span>{datos.dia || ""}</span>
            </div>

            <div className="usuario">
              <span className="usuario-avatar">{datos.iniciales}</span>
              <div>
                <strong>{datos.nombre}</strong>
                <span>{datos.rol}</span>
              </div>
            </div>

          </div>

        </header>

        <p className="subtitulo">
          Crear y enviar comunicaciones a padres y tutores.
        </p>


        {/* =========================
            ZONA CENTRAL
        ========================= */}

        <section className="zona-formulario">


          {/* FORMULARIO */}

          <form className="tarjeta formulario" onSubmit={enviar}>

            {/* ALUMNO */}

            <div className="campo">
              <label htmlFor="alumno">Alumno</label>

              <select
                id="alumno"
                className="entrada"
                value={alumnoId}
                onChange={(e) => setAlumnoId(e.target.value)}
              >
                <option value="">Seleccionar alumno</option>
                {datos.alumnos.map((alumno, index) => (
                  <option key={alumno.id || index} value={alumno.id}>
                    {alumno.nombre}
                  </option>
                ))}
              </select>
            </div>


            {/* ASUNTO */}

            <div className="campo">
              <label htmlFor="asunto">Asunto</label>

              <input
                id="asunto"
                type="text"
                className="entrada"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
              />
            </div>


            {/* MENSAJE */}

            <div className="campo">
              <label htmlFor="mensaje">Mensaje</label>

              <textarea
                id="mensaje"
                className="entrada"
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />
            </div>


            {/* FECHA */}

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


            {/* PRIORIDAD */}

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

              <div className="icono-card azul">
                ♙
              </div>

              <div>
                <span>Alumno seleccionado:</span>
                <strong>
                  {alumnoSeleccionado ? alumnoSeleccionado.nombre : "—"}
                </strong>
              </div>

            </div>


            <div className="resumen-item">

              <div className="icono-card azul">
                👥
              </div>

              <div>
                <span>Tutor:</span>
                <strong>
                  {alumnoSeleccionado && alumnoSeleccionado.tutor
                    ? alumnoSeleccionado.tutor
                    : "—"}
                </strong>
              </div>

            </div>


            <div className="resumen-item">

              <div className="icono-card azul">
                ✉
              </div>

              <div>
                <span>Estado:</span>

                <span className={`estado-etiqueta ${listoParaEnviar ? "listo" : "incompleto"}`}>
                  {listoParaEnviar ? "Listo para enviar" : "Faltan datos"}
                </span>
              </div>

            </div>


            <div className="aviso">
              <span className="aviso-icono">i</span>
              <p>
                Al enviar, la notificación será registrada y enviada
                automáticamente al tutor.
              </p>
            </div>

          </aside>

        </section>

      </main>

    </div>
  );
}

export default NotificacionPreceptor;