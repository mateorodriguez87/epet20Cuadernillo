
// Hooks de React: useState para los datos de la pantalla y useEffect para escuchar Firebase y manejar la fecha
import { useEffect, useState } from "react";

// NavLink arma los links del menú y marca cuál es el activo.
// useNavigate permite navegar entre páginas sin recargar el sitio.
import { NavLink, useNavigate } from "react-router-dom";

// Firebase Authentication permite comprobar y cerrar la sesión.
import { onAuthStateChanged, signOut } from "firebase/auth";

// Funciones de Firestore: onSnapshot escucha en tiempo real, addDoc crea, updateDoc edita, deleteDoc borra y doc arma la referencia a un documento
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Conexión a la base de datos y a la autenticación de Firebase
import { db, auth } from "../firebase";
// Icono proveniente de la Biblioteca Lucide-React
import { House, Presentation, UserRoundGroup, Bell, RotateCcwClock, BookOpen} from 'lucide-react';
// Estilos de la pantalla y de sus ventanas
import "../estilos/cursospreceptor.css";
import "../estilos/modalcursospreceptor.css";


// Pantalla de cursos del preceptor: lista con buscador y ventanas para agregar, editar, eliminar y notificar
function CursosPreceptor() {

  // fecha: la de hoy, para el encabezado
  // cursos: la lista que viene de Firebase
  // busqueda: texto del buscador
  // cargando y error: para avisar mientras se cargan los cursos o si algo falla
  const [fecha, setFecha] = useState(new Date());
  const [cursos, setCursos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // mostrarModal: abre o cierra la ventana
  // tipoModal: cuál ventana es (agregar, editar, eliminar o notificar)
  // cursoActual: el curso que se está editando o eliminando
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoModal, setTipoModal] = useState("");
  const [cursoActual, setCursoActual] = useState(null);

  // Lo que se escribe en el formulario de agregar o editar un curso
  const [formulario, setFormulario] = useState({
    curso: "",
    division: "",
  });

  // cursoSeleccionado: el curso elegido en la ventana de notificar
  // mensaje: avisos dentro de la ventana
  // guardando: bloquea los botones mientras se guarda o se elimina
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  // sesionIniciada: indica si hay un usuario autenticado en Firebase
  // verificandoSesion: indica si Firebase todavía está comprobando la sesión
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  // Permite navegar entre las páginas sin recargar el sitio
  const navigate = useNavigate();


  // Comprobar si hay una sesión iniciada en Firebase.
  useEffect(() => {

    // onAuthStateChanged escucha los cambios de autenticación.
    // Si hay un usuario, sesionIniciada será true; si no, será false.
    const cancelar = onAuthStateChanged(auth, (usuario) => {
      setSesionIniciada(!!usuario);
      setVerificandoSesion(false);
    });

    // Al salir de la pantalla se deja de escuchar los cambios de sesión
    return () => cancelar();

  }, []);


  // Obtener los cursos de Firebase en tiempo real.
  useEffect(() => {

    // onSnapshot escucha la colección: si algo cambia en Firebase, la lista se actualiza sola, sin recargar la página
    const cancelar = onSnapshot(
      collection(db, "Cursos"),
      (snapshot) => {

        // Cada curso se guarda junto con el id de su documento
        setCursos(
          snapshot.docs.map((documento) => ({
            id: documento.id,
            ...documento.data(),
          }))
        );

        setCargando(false);
        setError("");
      },

      // Si falla la lectura, se muestra el error
      (error) => {
        console.error("Error al obtener cursos:", error);
        setError("No se pudieron cargar los cursos.");
        setCargando(false);
      }
    );

    // Al salir de la pantalla se deja de escuchar, para no gastar recursos
    return () => cancelar();

  }, []);


  // Actualizar la fecha.
  useEffect(() => {

    // Cada 60000 milisegundos (un minuto) se vuelve a leer la fecha
    const intervalo = setInterval(() => {
      setFecha(new Date());
    }, 60000);

    // Al salir de la pantalla se frena el temporizador
    return () => clearInterval(intervalo);

  }, []);


  // Fecha lista para mostrar, en español de Argentina (con día de la semana, día, mes y año)
  const fechaFormateada = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });


  // Arma el nombre del curso juntando año y división; el trim() saca espacios sobrantes
  function nombreCurso(curso) {
    return `${curso.curso || ""} ${curso.division || ""}`.trim();
  }


  // Abrir el formulario para agregar un curso.
  function abrirAgregar() {

    // Se deja todo limpio y después se elige el tipo de ventana (tipoModal) y se muestra
    setFormulario({ curso: "", division: "" });
    setCursoActual(null);
    setMensaje("");
    setTipoModal("agregar");
    setMostrarModal(true);
  }


  // Abrir el formulario para editar un curso.
  function abrirEditar(curso) {

    // Se carga el formulario con los datos del curso, para poder modificarlos
    setFormulario({
      curso: curso.curso || "",
      division: curso.division || "",
    });

    // Guarda qué curso se va a editar
    setCursoActual(curso);
    setMensaje("");
    setTipoModal("editar");
    setMostrarModal(true);
  }


  // Abrir la confirmación personalizada para eliminar.
  function abrirEliminar(curso) {

    // Guarda qué curso se va a eliminar, para mostrarlo en la confirmación
    setCursoActual(curso);
    setMensaje("");
    setTipoModal("eliminar");
    setMostrarModal(true);
  }


  // Abrir el formulario de notificación.
  function abrirNotificacion() {

    // La ventana de notificar arranca sin ningún curso elegido
    setCursoSeleccionado("");
    setMensaje("");
    setTipoModal("notificar");
    setMostrarModal(true);
  }


  function cerrarModal() {

    // No deja cerrar la ventana mientras se está guardando o eliminando
    if (guardando) return;

    setMostrarModal(false);
    setTipoModal("");
    setCursoActual(null);
    setMensaje("");
  }


  function manejarCambio(e) {

    // Un solo manejador para los dos campos: el atributo name del input dice cuál cambió
    const { name, value } = e.target;

    // Copia lo que había y pisa solo el campo que cambió
    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }


  // Guardar un curso nuevo o editar uno existente.
  async function guardarCurso(e) {
    e.preventDefault();
    setMensaje("");

    // trim() saca los espacios de los extremos
    const nombre = formulario.curso.trim();
    const division = formulario.division.trim();

    // Validación: los dos campos son obligatorios
    if (!nombre || !division) {
      setMensaje("Completá todos los campos.");
      return;
    }

    // Desde acá se bloquean los botones hasta terminar
    setGuardando(true);

    try {
      const datos = {

        // Se guarda todo en minúsculas para que quede parejo ("Primero" y "primero" son lo mismo)
        curso: nombre.toLowerCase(),
        division: division.toLowerCase(),
      };

      // Según la ventana: crea un curso nuevo o actualiza el que se está editando
      if (tipoModal === "agregar") {

        // Crea el curso en la colección "Cursos"
        await addDoc(collection(db, "Cursos"), datos);

      } else {

        // Actualiza el documento de ese curso, buscándolo por su id
        await updateDoc(doc(db, "Cursos", cursoActual.id), datos);
      }

      // Si salió bien, se cierra la ventana (la lista se actualiza sola por el onSnapshot)
      setMostrarModal(false);
      setTipoModal("");
      setCursoActual(null);
      setMensaje("");

    } catch (error) {

      // Si Firebase falla, se avisa dentro de la ventana
      console.error("Error al guardar el curso:", error);
      setMensaje("No se pudo guardar el curso. Intentá nuevamente.");

    } finally {

      // Pase lo que pase, se desbloquean los botones
      setGuardando(false);
    }
  }


  // Eliminar un curso.
  async function confirmarEliminar() {

    // Si no hay un curso elegido, no hace nada
    if (!cursoActual) return;

    setGuardando(true);
    setMensaje("");

    try {

      // Borra el documento del curso (no se puede deshacer)
      await deleteDoc(doc(db, "Cursos", cursoActual.id));

      setMostrarModal(false);
      setTipoModal("");
      setCursoActual(null);

    } catch (error) {

      // Si falla, se avisa dentro de la ventana
      console.error("Error al eliminar el curso:", error);
      setMensaje("No se pudo eliminar el curso. Intentá nuevamente.");

    } finally {

      // Se desbloquean los botones
      setGuardando(false);
    }
  }


  // Por ahora, la notificación no se envía: todavía no está conectada.
  function notificarCurso(e) {
    e.preventDefault();

    // Validación: hay que elegir un curso
    if (!cursoSeleccionado) {
      setMensaje("Seleccioná un curso.");
      return;
    }

    setMensaje(
      "El curso fue seleccionado. El envío de notificaciones todavía no está conectado."
    );
  }


  // Lleva a /login si no hay una sesión iniciada.
  function iniciarSesion() {
    navigate("/login");
  }


  // Cierra la sesión de Firebase y vuelve a la pantalla de inicio de sesión.
  async function cerrarSesion() {
    try {

      // signOut cierra la sesión del usuario autenticado
      await signOut(auth);

      // Después de cerrar la sesión, vuelve al login
      navigate("/login", { replace: true });

    } catch (error) {

      // Si ocurre un problema, se muestra el error en la consola y en la pantalla
      console.error("Error al cerrar sesión:", error);
      setError("No se pudo cerrar la sesión. Intentá nuevamente.");
    }
  }


  // Lista que se muestra: filtra por lo que se escribió en el buscador, sin importar mayúsculas o minúsculas
  const cursosFiltrados = cursos.filter((curso) =>
    nombreCurso(curso).toLowerCase().includes(busqueda.toLowerCase())
  );


  // Desde acá empieza lo que se dibuja en pantalla
  return (
    <div className="cursos-pagina">

      {/* PANEL LATERAL */}
      <aside className="cursos-sidebar">

        <div className="cursos-logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>


        {/* Menú: NavLink pone la clase "activo" solo en la opción que coincide con la ruta actual (isActive); "end" pide que la ruta coincida exacta */}
        <nav className="cursos-menu">

          <NavLink
            to="/preceptor"
            end
            className={({ isActive }) =>
              `cursos-menu-item ${isActive ? "activo" : ""}`
            }
          >
             <House className="menu-icon" size={20} />
            <span>Inicio</span>
          </NavLink>


          <NavLink
            to="/cursospreceptor"
            end
            className={({ isActive }) =>
              `cursos-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <Presentation className="menu-icon" size={20}/>
            <span>Cursos</span>
          </NavLink>


          <NavLink
            to="/alumnospreceptor"
            className={({ isActive }) =>
              `cursos-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <UserRoundGroup className="menu-icon" size={20}/>
            <span>Alumnos</span>
          </NavLink>


          <NavLink
            to="/notificacionpreceptor"
            className={({ isActive }) =>
              `cursos-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <Bell className="menu-icon" size={20}/>
           <span>Notificaciones</span>
          </NavLink>


          <NavLink
            to="/historialpreceptor"
            className={({ isActive }) =>
              `cursos-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <RotateCcwClock className="menu-icon" size={20}/>
            <span>Historial</span>
          </NavLink>

        </nav>


        {/* Botón de abajo de la barra lateral: cambia según el estado de la sesión */}
        <button
          type="button"
          className="cursos-cerrar-sesion"
          onClick={sesionIniciada ? cerrarSesion : iniciarSesion}
          disabled={verificandoSesion}
        >
          <span className="cursos-icono">⇥</span>

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
      <main className="cursos-contenido">

        {/* Encabezado: título a la izquierda, fecha y botón de sesión a la derecha */}
        <header className="cursos-header">

          <div className="cursos-titulo">
            <h1>
              <span className="titulo-icono">
              <Presentation size={24}/>
              </span>
              Cursos
            </h1>

            <p>Inicio &nbsp;›&nbsp; Cursos</p>
          </div>


          <div className="cursos-header-derecha">

            {/* Fecha de hoy (viene del estado fecha) */}
            <div className="cursos-fecha">
              <span>▦</span>
              <p>{fechaFormateada}</p>
            </div>


            {/* Otro acceso al login o al cierre de sesión, según corresponda */}
            <button
              type="button"
              className="cursos-login"
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


          {/* "Notificar al curso" abre la ventana de notificar y "Agregar cursos" la de agregar */}
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

            {/* Cantidad total de cursos (sin tener en cuenta el buscador) */}
            <span className="cursos-contador">
              {cursos.length} cursos
            </span>
          </div>


          {/* Cuatro casos: cargando, error, sin resultados (lista vacía) o la lista de cursos */}
          {cargando ? (

            <p>Cargando cursos...</p>

          ) : error ? (

            <p role="alert">{error}</p>

          ) : cursosFiltrados.length === 0 ? (

            <div className="cursos-vacio">

              <div className="cursos-vacio-icono">
                <BookOpen size={35}/>
                </div>

              <h2>

                {/* El mensaje cambia según haya una búsqueda sin resultados o directamente no haya cursos */}
                {busqueda
                  ? "No se encontraron cursos"
                  : "No hay cursos asignados"}

              </h2>

              <p>
                {busqueda
                  ? "Probá con otro nombre de curso."
                  : "Agregá un curso para comenzar a organizar tus alumnos y sus comunicaciones."}
              </p>


              {/* El botón de agregar solo se ofrece cuando no hay una búsqueda activa */}
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

              {/* Un renglón por cada curso: nombre y botones Editar y Eliminar */}
              {cursosFiltrados.map((curso) => (

                <div className="cursos-elemento" key={curso.id}>

                  <div>
                    <h3>{nombreCurso(curso)}</h3>
                    <p>Curso asignado</p>
                  </div>


                  {/* Editar y Eliminar abren la ventana correspondiente con el curso elegido (el aria-label es para lectores de pantalla) */}
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


        {/* Pie de la pantalla */}
        <footer className="cursos-footer">
          Cuaderno de Comunicaciones Digital · EPET 20
        </footer>

      </main>


      {/* VENTANAS PERSONALIZADAS */}
      {/* Una sola ventana para los 4 casos: lo que muestra depende de tipoModal */}
      {mostrarModal && (

        <div
          className="cursos-modal-fondo"
          onClick={cerrarModal}
        >

          {/* La ventana. Hacer clic en el fondo oscuro la cierra, pero hacer clic adentro no (stopPropagation). El role y aria-modal ayudan a los lectores de pantalla */}
          <section
            className="cursos-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-cursos"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Encabezado de la ventana: el título y la frase cambian según tipoModal, y la × cierra (queda deshabilitada mientras se guarda) */}
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


            {/* Casos 1 y 2: formulario de agregar o editar (es el mismo formulario) */}
            {(tipoModal === "agregar" || tipoModal === "editar") && (

              <form onSubmit={guardarCurso}>

                {/* Año del curso */}
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


                {/* División */}
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


                {/* Mensaje de error del formulario */}
                {mensaje && (
                  <p className="cursos-modal-mensaje" role="alert">
                    {mensaje}
                  </p>
                )}


                {/* Cancelar y Guardar: el texto del botón cambia según se esté guardando y según sea agregar o editar */}
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


            {/* Caso 3: confirmación para eliminar */}
            {tipoModal === "eliminar" && (

              <div>

                {/* Pregunta de confirmación con el nombre del curso */}
                <div className="cursos-modal-confirmacion">

                  ¿Seguro que querés eliminar el curso{" "}

                  <strong>{nombreCurso(cursoActual || {})}</strong>?

                  <p>Esta acción no se puede deshacer.</p>

                </div>


                {/* Mensaje de error si falla el borrado */}
                {mensaje && (
                  <p className="cursos-modal-mensaje" role="alert">
                    {mensaje}
                  </p>
                )}


                {/* Cancelar y "Sí, eliminar" (el botón rojo) */}
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


            {/* Caso 4: elegir un curso para notificarle. Todavía no envía nada (mirá notificarCurso) */}
            {tipoModal === "notificar" && (

              <form onSubmit={notificarCurso}>

                {/* Select con todos los cursos; queda deshabilitado si no hay ninguno */}
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


                {/* Aviso si todavía no hay cursos cargados */}
                {cursos.length === 0 && (
                  <p className="cursos-modal-mensaje">
                    Primero necesitás cargar un curso.
                  </p>
                )}


                {/* Mensaje informativo (role="status"): por ahora avisa que el envío no está conectado */}
                {mensaje && (
                  <p className="cursos-modal-mensaje" role="status">
                    {mensaje}
                  </p>
                )}


                {/* "Continuar" se habilita cuando hay un curso elegido */}
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
