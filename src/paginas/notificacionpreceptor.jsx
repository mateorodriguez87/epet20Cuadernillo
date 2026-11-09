// Hooks de React: useState para los datos de la pantalla y useEffect para el temporizador de la fecha
import { useEffect, useState } from "react";

// NavLink arma los links del menú y marca el activo
import { NavLink, useNavigate } from "react-router-dom";

// Permite detectar y cerrar la sesión de Firebase
import { onAuthStateChanged, signOut } from "firebase/auth";

// Estilos de esta pantalla
import "../estilos/notificacionpreceptor.css";

// Conexión con Firebase
import { auth } from "../firebase";

// Pantalla para crear una notificación y enviarla al tutor de un alumno. Por ahora no guarda ni envía nada
function NotificacionPreceptor() {

  // Datos de la pantalla: por ahora vacíos, se completan con la base de datos
  // Solo tiene la lista de alumnos (cada uno con id, nombre y tutor)
  const datos = {
    alumnos: [],
  };

  // Permite navegar entre las páginas sin recargar todo el sitio
  const navigate = useNavigate();

  // Indica si hay una sesión iniciada
  const [sesionIniciada, setSesionIniciada] = useState(false);

  // Indica si Firebase todavía está comprobando la sesión
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  // fecha: la de hoy, para el encabezado
  const [fecha, setFecha] = useState(new Date());

  // Lo que se completa en el formulario:
  // alumnoId (el alumno elegido), asunto, mensaje, fechaEnvio y prioridad ("normal" o "importante")
  const [alumnoId, setAlumnoId] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [fechaEnvio, setFechaEnvio] = useState("");
  const [prioridad, setPrioridad] = useState("normal");

  // Comprueba si hay una sesión activa en Firebase
  useEffect(() => {
    const cancelarSuscripcion = onAuthStateChanged(auth, (usuario) => {
      setSesionIniciada(!!usuario);
      setVerificandoSesion(false);
    });

    // Al salir de la pantalla se deja de escuchar el estado de la sesión
    return () => cancelarSuscripcion();
  }, []);

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

  // Busca el alumno elegido en el select (se compara como texto porque el value del select siempre es string)
  const alumnoSeleccionado = datos.alumnos.find(
    (alumno) => String(alumno.id) === String(alumnoId)
  );

  // Es true cuando hay alumno, asunto y mensaje (la fecha y la prioridad no son obligatorias)
  // Habilita el botón Enviar y cambia el estado del resumen
  const listoParaEnviar =
    alumnoSeleccionado &&
    asunto.trim() !== "" &&
    mensaje.trim() !== "";

  // Deja el formulario en blanco (es lo que hace el botón Cancelar)
  function limpiarFormulario() {
    setAlumnoId("");
    setAsunto("");
    setMensaje("");
    setFechaEnvio("");
    setPrioridad("normal");
  }

  // Se ejecuta al enviar el formulario
  function enviar(e) {
    // Evita que el navegador recargue la página al enviar
    e.preventDefault();

    // Si falta algún dato obligatorio, no hace nada
    if (!listoParaEnviar) return;

    // Acá se conecta con la base de datos.
    // La notificación todavía no se guarda ni se envía.
    // Por ahora solo muestra este aviso: no guarda nada
    alert("Próximamente podrás enviar la notificación.");
  }

  // Lleva a /login si no hay una sesión iniciada
  function iniciarSesion() {
    navigate("/login");
  }

  // Cierra la sesión real de Firebase y lleva a /login
  async function cerrarSesion() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar la sesión. Intentá nuevamente.");
    }
  }

  // Desde acá empieza lo que se dibuja en pantalla
  return (
    <div className="panel">
      {/* PANEL LATERAL */}
      <aside className="sidebar">
        <div className="logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        {/* Menú: NavLink pone la clase "activo" solo en la opción que coincide con la ruta actual (isActive); "end" pide que la ruta coincida exacta */}
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
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">♙</span>
            <span>Alumnos</span>
          </NavLink>

          <NavLink
            to="/notificacionpreceptor"
            end
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

        {/* Cerrar sesión: ahora cierra la sesión real de Firebase */}
        <button
          type="button"
          className="cerrar-sesion"
          onClick={sesionIniciada ? cerrarSesion : iniciarSesion}
          disabled={verificandoSesion}
        >
          <span className="logout-icon">⇥</span>
          <span>
            {verificandoSesion
              ? "Comprobando..."
              : sesionIniciada
              ? "Cerrar sesión"
              : "Iniciar sesión"}
          </span>
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="contenido">
        {/* ENCABEZADO */}
        <header className="encabezado encabezado-alumnos">
          <div>
            <h1>Notificaciones</h1>
            <p>Inicio &gt; Notificaciones &gt; Nueva notificación</p>
          </div>

          {/* Fecha de hoy y botón de login, juntos a la derecha */}
          <div className="encabezado-derecha">
            <div className="fecha">
              <span>{fechaFormateada}</span>
            </div>

            {/* El botón cambia según el estado de la sesión */}
            <button
              type="button"
              className="boton-login"
              onClick={sesionIniciada ? cerrarSesion : iniciarSesion}
              disabled={verificandoSesion}
            >
              {verificandoSesion
                ? "Comprobando..."
                : sesionIniciada
                ? "Cerrar sesión"
                : "Iniciar sesión"}

              <span>↗</span>
            </button>
          </div>
        </header>

        <p className="subtitulo">
          Crear y enviar comunicaciones a padres y tutores.
        </p>

        {/* FORMULARIO Y RESUMEN */}
        <section className="zona-formulario">
          {/* FORMULARIO */}
          {/* Al enviarlo se ejecuta enviar. Los campos con required hacen que el navegador pida completarlos antes */}
          <form
            className="tarjeta formulario"
            onSubmit={enviar}
          >
            {/* Alumno: las opciones salen de datos.alumnos (hoy vacía) */}
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

              {/* Aviso que aparece si todavía no hay alumnos cargados */}
              {datos.alumnos.length === 0 && (
                <small className="campo-ayuda">
                  No hay alumnos disponibles para seleccionar.
                </small>
              )}
            </div>

            {/* Asunto */}
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

            {/* Mensaje (el textarea es el campo de texto de varias líneas) */}
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

            {/* Fecha de envío (opcional) */}
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

            {/* Prioridad: dos botones de opción (radio) que comparten el name "prioridad", así solo se puede elegir uno. El checked sigue el estado prioridad */}
            <div className="campo">
              <label>Prioridad</label>

              {/* Prioridad Normal (la que viene elegida al empezar) */}
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

              {/* Prioridad Importante */}
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
            {/* Cancelar limpia el formulario; Enviar se habilita cuando listoParaEnviar es true */}
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
          {/* Resumen de lo elegido: se va actualizando mientras se completa el formulario */}
          <aside className="tarjeta resumen">
            <div className="titulo-seccion">
              <h2>Resumen</h2>
            </div>

            {/* Alumno seleccionado (o "—" si no hay ninguno) */}
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

            {/* Tutor: sale del alumno elegido (campo tutor). Hoy siempre muestra "—", porque no hay alumnos */}
            <div className="resumen-item">
              <div className="icono-card azul">♟</div>

              <div>
                <span>Tutor:</span>
                <strong>
                  {alumnoSeleccionado?.tutor || "—"}
                </strong>
              </div>
            </div>

            {/* Estado: "Listo para enviar" o "Faltan datos" según listoParaEnviar */}
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

            {/* Aviso informativo */}
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