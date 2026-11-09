// Hooks de React: useState para los datos de la pantalla y useEffect para el temporizador de la fecha
import { useEffect, useState } from "react";

// NavLink arma los links del menú y marca el activo
import { NavLink, useNavigate } from "react-router-dom";

// Permite detectar y cerrar la sesión de Firebase
import { onAuthStateChanged, signOut } from "firebase/auth";

// Funciones de Firestore para consultar y guardar información
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
// Icono proveniente de la Biblioteca Lucide-React
import { House, Presentation, UserRoundGroup, Bell, RotateCcwClock, UserRoundCheck, UserRound} from 'lucide-react';
// Estilos de esta pantalla
import "../estilos/notificacionpreceptor.css";

// Conexión con Firebase
import { db, auth } from "../firebase";

// Pantalla para crear una notificación y enviarla al tutor de un alumno
function NotificacionPreceptor() {

  // Permite navegar entre las páginas sin recargar todo el sitio
  const navigate = useNavigate();

  // Datos de los alumnos que se obtienen desde Firebase
  const [alumnos, setAlumnos] = useState([]);

  // Tutores relacionados con el alumno seleccionado
  const [tutores, setTutores] = useState([]);

  // Datos del preceptor que inició sesión
  const [preceptor, setPreceptor] = useState(null);

  // Indica si se están cargando los alumnos
  const [cargandoAlumnos, setCargandoAlumnos] = useState(true);

  // Indica si se están buscando los tutores
  const [cargandoTutores, setCargandoTutores] = useState(false);

  // Indica si se está guardando una notificación
  const [enviando, setEnviando] = useState(false);

  // Mensaje de error o información
  const [error, setError] = useState("");

  // Indica si hay una sesión iniciada
  const [sesionIniciada, setSesionIniciada] = useState(false);

  // Indica si Firebase todavía está comprobando la sesión
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  // fecha: la de hoy, para el encabezado
  const [fecha, setFecha] = useState(new Date());

  // Lo que se completa en el formulario:
  // alumnoId (el alumno elegido), tutorId, asunto, mensaje, fechaEnvio y prioridad
  const [alumnoId, setAlumnoId] = useState("");
  const [tutorId, setTutorId] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [fechaEnvio, setFechaEnvio] = useState("");
  const [prioridad, setPrioridad] = useState("normal");

  // Comprueba si hay una sesión activa en Firebase y carga los alumnos del preceptor
  useEffect(() => {
    let activo = true;

    const cancelarSuscripcion = onAuthStateChanged(auth, async (usuario) => {
      setSesionIniciada(!!usuario);

      if (!usuario) {
        setPreceptor(null);
        setAlumnos([]);
        setCargandoAlumnos(false);
        setVerificandoSesion(false);
        return;
      }

      try {
        setCargandoAlumnos(true);
        setError("");

        // Busca los datos del preceptor en la colección usuarios
        const referenciaPreceptor = doc(db, "usuarios", usuario.uid);
        const documentoPreceptor = await getDoc(referenciaPreceptor);

        if (!documentoPreceptor.exists()) {
          throw new Error("No se encontraron los datos del usuario.");
        }

        const datosPreceptor = {
          id: documentoPreceptor.id,
          ...documentoPreceptor.data(),
        };

        if (activo) {
          setPreceptor(datosPreceptor);
        }

        // Obtiene los cursos asignados al preceptor
        const cursosIds = datosPreceptor.cursosIds || [];

        // Si el preceptor todavía no tiene cursos asignados, no hay alumnos para mostrar
        if (cursosIds.length === 0) {
          if (activo) {
            setAlumnos([]);
          }

          return;
        }

        // Busca todos los alumnos registrados en Firestore
        const consultaAlumnos = await getDocs(
          collection(db, "Alumnos")
        );

        // Muestra solamente los alumnos que pertenecen a los cursos del preceptor
        const alumnosDelPreceptor = consultaAlumnos.docs
          .map((documento) => ({
            id: documento.id,
            ...documento.data(),
          }))
          .filter((alumno) =>
            cursosIds.includes(alumno.cursoId)
          );

        if (activo) {
          setAlumnos(alumnosDelPreceptor);
        }

      } catch (error) {
        console.error("Error al cargar los alumnos:", error);

        if (activo) {
          setError("No se pudieron cargar los alumnos. Revisá la conexión con Firebase.");
        }

      } finally {
        if (activo) {
          setCargandoAlumnos(false);
          setVerificandoSesion(false);
        }
      }
    });

    // Al salir de la pantalla se deja de escuchar el estado de la sesión
    return () => {
      activo = false;
      cancelarSuscripcion();
    };
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

  // Busca el alumno elegido en la lista obtenida desde Firebase
  const alumnoSeleccionado = alumnos.find(
    (alumno) => String(alumno.id) === String(alumnoId)
  );

  // Busca el tutor elegido entre los tutores relacionados con el alumno
  const tutorSeleccionado = tutores.find(
    (tutor) => String(tutor.id) === String(tutorId)
  );

  // Cuando se selecciona un alumno, busca qué tutor tiene asignado
  useEffect(() => {
    let activo = true;

    async function cargarTutores() {
      if (!alumnoId) {
        setTutores([]);
        setTutorId("");
        return;
      }

      try {
        setCargandoTutores(true);
        setError("");

        // Busca los usuarios que tengan el rol tutor y cuyo arreglo hijos incluya al alumno seleccionado
        const consultaTutores = query(
          collection(db, "usuarios"),
          where("rol", "==", "tutor"),
          where("hijos", "array-contains", alumnoId)
        );

        const resultadoTutores = await getDocs(consultaTutores);

        const tutoresEncontrados = resultadoTutores.docs.map(
          (documento) => ({
            id: documento.id,
            ...documento.data(),
          })
        );

        if (activo) {
          setTutores(tutoresEncontrados);

          // Si hay un solo tutor, queda seleccionado automáticamente
          if (tutoresEncontrados.length === 1) {
            setTutorId(tutoresEncontrados[0].id);
          } else {
            setTutorId("");
          }

          // Si el alumno no tiene tutor asignado, muestra un aviso
          if (tutoresEncontrados.length === 0) {
            setError("Este alumno todavía no tiene un tutor asignado.");
          }
        }

      } catch (error) {
        console.error("Error al buscar tutores:", error);

        if (activo) {
          setTutores([]);
          setTutorId("");
          setError("No se pudo encontrar el tutor del alumno.");
        }

      } finally {
        if (activo) {
          setCargandoTutores(false);
        }
      }
    }

    cargarTutores();

    return () => {
      activo = false;
    };
  }, [alumnoId]);

  // Es true cuando hay alumno, tutor, asunto y mensaje
  // Habilita el botón Enviar y cambia el estado del resumen
  const listoParaEnviar =
    alumnoSeleccionado &&
    tutorSeleccionado &&
    asunto.trim() !== "" &&
    mensaje.trim() !== "" &&
    !enviando;

  // Deja el formulario en blanco (es lo que hace el botón Cancelar)
  function limpiarFormulario() {
    setAlumnoId("");
    setTutorId("");
    setTutores([]);
    setAsunto("");
    setMensaje("");
    setFechaEnvio("");
    setPrioridad("normal");
    setError("");
  }

  // Se ejecuta al enviar el formulario
  async function enviar(e) {
    // Evita que el navegador recargue la página al enviar
    e.preventDefault();

    // Si falta algún dato obligatorio, no hace nada
    if (!listoParaEnviar) return;

    // Comprueba que exista una sesión activa
    const usuarioActual = auth.currentUser;

    if (!usuarioActual) {
      setError("Tu sesión expiró. Iniciá sesión nuevamente.");
      return;
    }

    try {
      setEnviando(true);
      setError("");

      // Prepara la fecha de la notificación
      const fechaNotificacion = fechaEnvio
        ? Timestamp.fromDate(new Date(`${fechaEnvio}T12:00:00`))
        : serverTimestamp();

      // Crea el documento de la notificación en Firestore
      await addDoc(collection(db, "Notificaciones"), {
        alumnoId: alumnoSeleccionado.id,
        alumnoNombre: alumnoSeleccionado.nombre,

        tutorId: tutorSeleccionado.id,
        tutorNombre: tutorSeleccionado.nombre || "",

        preceptorId: usuarioActual.uid,
        preceptorNombre: preceptor?.nombre || "",

        asunto: asunto.trim(),
        mensaje: mensaje.trim(),
        prioridad: prioridad,

        fechaEnvio: fechaNotificacion,
        creadoEn: serverTimestamp(),

        leida: false,
      });

      // Informa que la notificación se guardó correctamente
      alert("¡La notificación se guardó correctamente!");

      // Limpia el formulario después de enviar
      limpiarFormulario();

    } catch (error) {
      console.error("Error al guardar la notificación:", error);

      setError("No se pudo guardar la notificación. Revisá la conexión con Firebase.");

    } finally {
      setEnviando(false);
    }
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
            <House className="menu-icon" size={20} />
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/cursospreceptor"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <Presentation className="menu-icon" size={20}/>
            <span>Cursos</span>
          </NavLink>

          <NavLink
            to="/alumnospreceptor"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <UserRoundGroup className="menu-icon" size={20}/>
            <span>Alumnos</span>
          </NavLink>

          <NavLink
            to="/notificacionpreceptor"
            end
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <Bell className="menu-icon" size={20}/>
           <span>Notificaciones</span>
          </NavLink>

          <NavLink
            to="/historialpreceptor"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <RotateCcwClock className="menu-icon" size={20}/>
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
            {/* Alumno: las opciones salen de la colección Alumnos de Firebase */}
            <div className="campo">
              <label htmlFor="alumno">Alumno</label>

              <select
                id="alumno"
                className="entrada"
                value={alumnoId}
                onChange={(e) => setAlumnoId(e.target.value)}
                required
                disabled={cargandoAlumnos || alumnos.length === 0}
              >
                <option value="">
                  {cargandoAlumnos
                    ? "Cargando alumnos..."
                    : "Seleccionar alumno"}
                </option>

                {alumnos.map((alumno) => (
                  <option
                    key={alumno.id}
                    value={alumno.id}
                  >
                    {alumno.nombre}
                  </option>
                ))}
              </select>

              {/* Aviso que aparece si todavía no hay alumnos cargados */}
              {!cargandoAlumnos && alumnos.length === 0 && (
                <small className="campo-ayuda">
                  No hay alumnos disponibles en los cursos asignados.
                </small>
              )}
            </div>

            {/* Tutor: se obtiene desde usuarios buscando el ID del alumno en el arreglo hijos */}
            <div className="campo">
              <label htmlFor="tutor">Tutor</label>

              <select
                id="tutor"
                className="entrada"
                value={tutorId}
                onChange={(e) => setTutorId(e.target.value)}
                disabled={!alumnoId || cargandoTutores || tutores.length === 0}
                required
              >
                <option value="">
                  {cargandoTutores
                    ? "Buscando tutor..."
                    : "Seleccionar tutor"}
                </option>

                {tutores.map((tutor) => (
                  <option
                    key={tutor.id}
                    value={tutor.id}
                  >
                    {tutor.nombre || tutor.usuario || "Tutor"}
                  </option>
                ))}
              </select>
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
                {enviando ? "Enviando..." : "➤ Enviar"}
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
              <div className="icono-card azul">
                <UserRoundCheck size={18} />
              </div>

              <div>
                <span>Alumno seleccionado:</span>
                <strong>
                  {alumnoSeleccionado
                    ? alumnoSeleccionado.nombre
                    : "—"}
                </strong>
              </div>
            </div>

            {/* Tutor: sale del usuario relacionado con el alumno */}
            <div className="resumen-item">
              <div className="icono-card azul">
                <UserRound size={18}/>
              </div>

              <div>
                <span>Tutor:</span>
                <strong>
                  {tutorSeleccionado
                    ? tutorSeleccionado.nombre || tutorSeleccionado.usuario
                    : "—"}
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
                Al enviar, la notificación se guardará en el sistema
                y quedará asociada al tutor seleccionado.
              </p>
            </div>

            {/* Mensajes de error de Firebase */}
            {error && (
              <small className="campo-ayuda">
                {error}
              </small>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}

export default NotificacionPreceptor;