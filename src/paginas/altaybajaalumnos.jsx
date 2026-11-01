// Hooks de React: useState para los datos de la pantalla y useEffect para cargar al abrirla
import { useState, useEffect } from "react";
// Funciones de Firestore para leer, crear, editar y borrar documentos
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

// Conexión a la base de datos (se configura en firebase.js)
import { db } from "../firebase";
// Estilos de esta pantalla
import "../estilos/altaybajaalumnos.css";

// Pantalla de alta y baja de alumnos (preceptor)
function AltaBajaAlumnos() {
  // Formulario en blanco: se usa al empezar y para limpiarlo después de guardar o cancelar
  const formularioVacio = {
    nombre: "",
    apellido: "",
    dni: "",
    legajo: "",
    nacimiento: "",
    curso: "",
    tutorNombre: "",
    tutorEmail: "",
    tutorTelefono: ""
  };

  // Estados de la pantalla:
  // - pestana: "alta" o "baja", define qué sección se ve
  // - form: lo que se va escribiendo en el formulario
  // - alumnos y cursos: los datos que vienen de Firebase
  // - cargando y error: para avisar si se está cargando o si algo falló
  // - busqueda: el texto del buscador de la tabla de bajas
  // - alumnoBaja: el alumno elegido para dar de baja (si hay uno, se abre el modal)
  // - motivo, tipoBaja y confirmacionDefinitiva: lo que se elige dentro del modal
  // - procesando: true mientras se guarda o se da de baja, para bloquear los botones
  const [pestana, setPestana] = useState("alta");
  const [form, setForm] = useState(formularioVacio);
  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [alumnoBaja, setAlumnoBaja] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [tipoBaja, setTipoBaja] = useState("temporal");
  const [confirmacionDefinitiva, setConfirmacionDefinitiva] =
    useState(false);
  const [procesando, setProcesando] = useState(false);

  // Cargar alumnos y cursos desde Firebase
  const cargarDatos = async () => {
    try {
      setError("");

      // Pide las dos colecciones al mismo tiempo (más rápido que una por una)
      const [alumnosSnapshot, cursosSnapshot] = await Promise.all([
        getDocs(collection(db, "Alumnos")),
        getDocs(collection(db, "Cursos"))
      ]);

      // Guarda cada alumno con su id, que es el id del documento en Firestore
      setAlumnos(
        alumnosSnapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data()
        }))
      );

      setCursos(
        cursosSnapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data()
        }))
      );
    } catch (error) {
      // Si Firebase falla, se muestra un mensaje de error
      console.error("Error al cargar los datos:", error);
      setError("No se pudieron cargar los datos de Firebase.");
    } finally {
      // Pase lo que pase, se apaga el cartel de "Cargando"
      setCargando(false);
    }
  };

  // Al abrir la pantalla se cargan los datos una sola vez (por eso el [] del final)
  useEffect(() => {
    cargarDatos();
  }, []);

  // Actualizar campos del formulario
  const cambiarCampo = (campo, valor) => {
    // Copia lo que había y pisa solo el campo que cambió, así no se pierde el resto
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor
    }));
  };

  // Validar formulario
  // Es true cuando están los datos obligatorios: habilita el botón Guardar y cambia el estado del resumen
  const altaLista =
    form.nombre.trim() !== "" &&
    form.apellido.trim() !== "" &&
    form.dni.trim() !== "" &&
    form.curso !== "" &&
    form.tutorNombre.trim() !== "";

  // Registrar alumno en Firestore
  const guardarAlumno = async (e) => {
    e.preventDefault();

    // Si falta algo o ya se está guardando, no hace nada (evita guardar dos veces)
    if (!altaLista || procesando) return;

    try {
      setProcesando(true);
      setError("");

      // El select guarda el id del curso; acá se busca el curso completo para sacar su nombre
      const cursoSeleccionado = cursos.find(
        (curso) => curso.id === form.curso
      );

      // Crea el alumno en la colección "Alumnos"
      await addDoc(collection(db, "Alumnos"), {
        // En "nombre" se guarda el nombre completo y el apellido también va por separado
        nombre: `${form.nombre.trim()} ${form.apellido.trim()}`,
        apellido: form.apellido.trim(),
        dni: form.dni.trim(),
        legajo: form.legajo.trim(),
        nacimiento: form.nacimiento,
        curso: cursoSeleccionado?.nombre || "",
        cursoId: cursoSeleccionado?.id || "",
        tutorNombre: form.tutorNombre.trim(),
        tutorEmail: form.tutorEmail.trim(),
        tutorTelefono: form.tutorTelefono.trim(),
        // Todo alumno nuevo arranca como activo y sin comunicaciones pendientes
        estado: "ok",
        detalle: "Sin comunicaciones pendientes",
        // La fecha de creación la pone el servidor de Firebase
        creadoEn: serverTimestamp()
      });

      // Vuelve a leer los datos para que el alumno nuevo aparezca en la lista
      await cargarDatos();
      setForm(formularioVacio);
      alert("Alumno registrado correctamente.");
    } catch (error) {
      console.error("Error al registrar al alumno:", error);
      setError("No se pudo registrar al alumno.");
    } finally {
      setProcesando(false);
    }
  };

  // Buscar alumnos activos
  const alumnosFiltrados = alumnos.filter((alumno) => {
    const nombre = (alumno.nombre || "").toLowerCase();
    const dni = String(alumno.dni || "");
    // Todo en minúsculas para que no importe cómo se escriba la búsqueda
    const termino = busqueda.toLowerCase();

    return (
      // Los alumnos dados de baja temporalmente no se muestran
      alumno.estado !== "inactivo" &&
      (nombre.includes(termino) || dni.includes(busqueda))
    );
  });

  // Abrir ventana de baja
  const abrirModal = (alumno) => {
    // Guarda qué alumno se va a dar de baja; con eso se muestra el modal
    setAlumnoBaja(alumno);
    setMotivo("");
    setTipoBaja("temporal");
    setConfirmacionDefinitiva(false);
    setError("");
  };

  // Cerrar ventana de baja
  const cerrarModal = () => {
    // No deja cerrar el modal mientras se está procesando algo
    if (procesando) return;

    setAlumnoBaja(null);
    setMotivo("");
    setTipoBaja("temporal");
    setConfirmacionDefinitiva(false);
    setError("");
  };

  // Dar de baja o eliminar definitivamente
  const confirmarBaja = async () => {
    // Hace falta tener alumno y motivo, y que no haya otra operación en curso
    if (!alumnoBaja || !motivo || procesando) return;

    // Solicitar una segunda confirmación antes de eliminar
    if (
      tipoBaja === "definitiva" &&
      !confirmacionDefinitiva
    ) {
      // Primer clic en eliminar: muestra el aviso y espera un segundo clic para borrar
      setConfirmacionDefinitiva(true);
      return;
    }

    try {
      setProcesando(true);
      setError("");

      // Referencia al documento de este alumno dentro de Firestore
      const referenciaAlumno = doc(
        db,
        "Alumnos",
        alumnoBaja.id
      );

      // Dos caminos según el tipo de baja: temporal (se actualiza) o definitiva (se borra)
      if (tipoBaja === "temporal") {
        // Conservar el documento, pero marcarlo como inactivo
        await updateDoc(referenciaAlumno, {
          estado: "inactivo",
          motivoBaja: motivo,
          fechaBaja: serverTimestamp()
        });
      } else {
        // Eliminar definitivamente el documento del alumno
        await deleteDoc(referenciaAlumno);
      }

      // Recarga la lista para reflejar el cambio
      await cargarDatos();

      setAlumnoBaja(null);
      setMotivo("");
      setTipoBaja("temporal");
      setConfirmacionDefinitiva(false);
    } catch (error) {
      console.error("Error al dar de baja al alumno:", error);
      setError("No se pudo completar la operación en Firebase.");
    } finally {
      setProcesando(false);
    }
  };

  // Obtener iniciales
  const iniciales = (nombre = "") =>
    nombre
      .split(" ")
      .filter(Boolean)
      .map((parte) => parte[0])
      .join("")
      // Se queda con las dos primeras letras (ejemplo: "Juan Pérez" queda "JP")
      .slice(0, 2)
      .toUpperCase();

  // Desde acá empieza lo que se dibuja en pantalla
  return (
    <div className="panel">
      {/* BARRA LATERAL */}
      <aside className="sidebar">
        {/* Logo del sistema */}
        <div className="logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        {/* Menú de navegación: la clase "activo" marca la pantalla actual (Alumnos) */}
        <nav className="menu">
          <a href="#" className="menu-item">
            <span className="menu-icon">⌂</span>
            <span>Inicio</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">♙</span>
            <span>Cursos</span>
          </a>

          <a href="#" className="menu-item activo">
            <span className="menu-icon">♙</span>
            <span>Alumnos</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">♧</span>
            <span>Notificaciones</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">▤</span>
            <span>Historial</span>
          </a>
        </nav>

        {/* Cerrar sesión (por ahora solo es el botón visual) */}
        <a href="#" className="cerrar-sesion">
          <span className="logout-icon">⇥</span>
          <span>Cerrar sesión</span>
        </a>
      </aside>

      {/* CONTENIDO */}
      <main className="contenido">
        {/* Encabezado: título a la izquierda, fecha y usuario a la derecha */}
        <header className="encabezado encabezado-alumnos">
          <div>
            <h1>Alumnos</h1>
            <p>Inicio &gt; Alumnos &gt; Alta y baja</p>
          </div>

          <div className="encabezado-derecha">
            {/* Fecha y día de la semana de hoy, tomados de la computadora */}
            <div className="fecha">
              <strong>
                {new Date().toLocaleDateString("es-AR")}
              </strong>
              <span>
                {new Date().toLocaleDateString("es-AR", {
                  weekday: "long"
                })}
              </span>
            </div>

            {/* Datos del usuario (por ahora son fijos, no salen del login) */}
            <div className="usuario">
              <span className="usuario-avatar">P</span>
              <div>
                <strong>Preceptor</strong>
                <span>Administración</span>
              </div>
            </div>
          </div>
        </header>

        <p className="subtitulo">
          Registrar nuevos alumnos o dar de baja alumnos existentes.
        </p>

        {/* Error general de la pantalla; si el modal está abierto, el error se muestra adentro del modal */}
        {error && !alumnoBaja && (
          <p role="alert">{error}</p>
        )}

        {/* PESTAÑAS */}
        {/* Al cambiar de pestaña también se borra cualquier error anterior */}
        <div className="pestanas">
          <button
            type="button"
            className={`pestana ${pestana === "alta" ? "activa" : ""}`}
            onClick={() => {
              setPestana("alta");
              setError("");
            }}
          >
            + Dar de alta
          </button>

          <button
            type="button"
            className={`pestana ${pestana === "baja" ? "activa" : ""}`}
            onClick={() => {
              setPestana("baja");
              setError("");
            }}
          >
            − Dar de baja
          </button>
        </div>

        {/* ALTA DE ALUMNO */}
        {pestana === "alta" && (
          <section className="zona-formulario">
            {/* Formulario de alta: al enviarlo se ejecuta guardarAlumno */}
            <form
              className="tarjeta formulario"
              onSubmit={guardarAlumno}
            >
              {/* Datos personales del alumno (los inputs con required son obligatorios) */}
              <div className="titulo-seccion">
                <h2>Datos del alumno</h2>
              </div>

              {/* Nombre y apellido */}
              <div className="fila">
                <div className="campo">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    className="entrada"
                    value={form.nombre}
                    onChange={(e) =>
                      cambiarCampo("nombre", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="campo">
                  <label htmlFor="apellido">Apellido</label>
                  <input
                    id="apellido"
                    type="text"
                    className="entrada"
                    value={form.apellido}
                    onChange={(e) =>
                      cambiarCampo("apellido", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* DNI y legajo */}
              <div className="fila">
                <div className="campo">
                  <label htmlFor="dni">DNI</label>
                  <input
                    id="dni"
                    type="text"
                    className="entrada"
                    value={form.dni}
                    onChange={(e) =>
                      cambiarCampo("dni", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="campo">
                  <label htmlFor="legajo">Legajo</label>
                  <input
                    id="legajo"
                    type="text"
                    className="entrada"
                    value={form.legajo}
                    onChange={(e) =>
                      cambiarCampo("legajo", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Fecha de nacimiento y curso */}
              <div className="fila">
                <div className="campo">
                  <label htmlFor="nacimiento">
                    Fecha de nacimiento
                  </label>
                  <input
                    id="nacimiento"
                    type="date"
                    className="entrada"
                    value={form.nacimiento}
                    onChange={(e) =>
                      cambiarCampo("nacimiento", e.target.value)
                    }
                  />
                </div>

                <div className="campo">
                  <label htmlFor="curso">Curso</label>
                  <select
                    id="curso"
                    className="entrada"
                    value={form.curso}
                    onChange={(e) =>
                      cambiarCampo("curso", e.target.value)
                    }
                    required
                  >
                    <option value="">Seleccionar curso</option>

                    {/* Las opciones salen de la colección Cursos: se guarda el id y se muestra el nombre */}
                    {cursos.map((curso) => (
                      <option key={curso.id} value={curso.id}>
                        {curso.nombre || curso.nombreCurso || curso.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Datos del tutor */}
              <div className="titulo-seccion separado">
                <h2>Datos del tutor</h2>
              </div>

              <div className="campo">
                <label htmlFor="tutor-nombre">
                  Nombre completo del tutor
                </label>
                <input
                  id="tutor-nombre"
                  type="text"
                  className="entrada"
                  value={form.tutorNombre}
                  onChange={(e) =>
                    cambiarCampo("tutorNombre", e.target.value)
                  }
                  required
                />
              </div>

              {/* Correo y teléfono del tutor (opcionales) */}
              <div className="fila">
                <div className="campo">
                  <label htmlFor="tutor-email">
                    Correo electrónico
                  </label>
                  <input
                    id="tutor-email"
                    type="email"
                    className="entrada"
                    value={form.tutorEmail}
                    onChange={(e) =>
                      cambiarCampo("tutorEmail", e.target.value)
                    }
                  />
                </div>

                <div className="campo">
                  <label htmlFor="tutor-telefono">Teléfono</label>
                  <input
                    id="tutor-telefono"
                    type="tel"
                    className="entrada"
                    value={form.tutorTelefono}
                    onChange={(e) =>
                      cambiarCampo("tutorTelefono", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Cancelar limpia el formulario; Guardar se habilita cuando altaLista es true */}
              <div className="botones">
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => setForm(formularioVacio)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="boton-primario"
                  disabled={!altaLista || procesando}
                >
                  {procesando ? "Guardando..." : "+ Guardar alumno"}
                </button>
              </div>
            </form>

            {/* RESUMEN */}
            <aside className="tarjeta resumen">
              <div className="titulo-seccion">
                <h2>Resumen</h2>
              </div>

              {/* Cada dato del resumen se actualiza mientras se escribe en el formulario */}
              <div className="resumen-item">
                <div className="icono-card azul">♙</div>
                <div>
                  <span>Alumno:</span>
                  <strong>
                    {form.nombre || form.apellido
                      ? `${form.nombre} ${form.apellido}`.trim()
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">🎓</div>
                <div>
                  <span>Curso:</span>
                  <strong>
                    {cursos.find((curso) => curso.id === form.curso)
                      ?.nombre ||
                      cursos.find((curso) => curso.id === form.curso)
                        ?.nombreCurso ||
                      "—"}
                  </strong>
                </div>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">👥</div>
                <div>
                  <span>Tutor:</span>
                  <strong>{form.tutorNombre || "—"}</strong>
                </div>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">✉</div>
                <div>
                  <span>Estado:</span>
                  <span
                    className={`estado-etiqueta ${
                      altaLista ? "listo" : "incompleto"
                    }`}
                  >
                    {altaLista ? "Listo para registrar" : "Faltan datos"}
                  </span>
                </div>
              </div>

              {/* Aviso informativo */}
              <div className="aviso">
                <span className="aviso-icono">i</span>
                <p>
                  Al guardar, el alumno quedará registrado en Firebase.
                </p>
              </div>
            </aside>
          </section>
        )}

        {/* BAJA DE ALUMNOS */}
        {pestana === "baja" && (
          <section className="tarjeta tabla-alumnos">
            {/* Buscador por nombre o DNI */}
            <div className="filtros">
              <input
                type="search"
                className="buscador"
                placeholder="Buscar por nombre o DNI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Tabla de alumnos activos */}
            <div className="tabla-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>DNI</th>
                    <th>Curso</th>
                    <th className="centrado">Acciones</th>
                  </tr>
                </thead>

                {/* Tres casos: cargando, lista vacía o una fila por cada alumno */}
                <tbody>
                  {cargando ? (
                    <tr>
                      <td colSpan={4} className="sin-datos">
                        Cargando alumnos...
                      </td>
                    </tr>
                  ) : alumnosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="sin-datos">
                        No hay alumnos para mostrar
                      </td>
                    </tr>
                  ) : (
                    alumnosFiltrados.map((alumno) => (
                      <tr key={alumno.id}>
                        <td>
                          <div className="alumno">
                            <span className="avatar">
                              {iniciales(alumno.nombre)}
                            </span>
                            <strong>{alumno.nombre}</strong>
                          </div>
                        </td>

                        <td>{alumno.dni || "—"}</td>

                        <td>
                          <span className="etiqueta-curso">
                            {alumno.curso || "—"}
                          </span>
                        </td>

                        <td>
                          <div className="acciones-fila">
                            <button
                              type="button"
                              className="boton-baja"
                              onClick={() => abrirModal(alumno)}
                            >
                              Dar de baja
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* MODAL DE BAJA */}
      {/* El modal solo se muestra si hay un alumno elegido (alumnoBaja) */}
      {alumnoBaja && (
        <div className="fondo-modal" onClick={cerrarModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ícono de advertencia */}
            <div className="modal-icono">!</div>

            <h2>Dar de baja alumno</h2>

            <p>
              Alumno: <strong>{alumnoBaja.nombre}</strong>
            </p>

            {/* Tipo de baja: temporal (queda inactivo) o definitiva (se borra el documento) */}
            <div className="campo">
              <label>¿Qué acción querés realizar?</label>

              <label>
                <input
                  type="radio"
                  name="tipoBaja"
                  value="temporal"
                  checked={tipoBaja === "temporal"}
                  onChange={() => {
                    setTipoBaja("temporal");
                    setConfirmacionDefinitiva(false);
                  }}
                />
                Dar de baja temporalmente
              </label>

              <label>
                <input
                  type="radio"
                  name="tipoBaja"
                  value="definitiva"
                  checked={tipoBaja === "definitiva"}
                  onChange={() => {
                    setTipoBaja("definitiva");
                    setConfirmacionDefinitiva(false);
                  }}
                />
                Eliminar definitivamente
              </label>
            </div>

            <p>
              {tipoBaja === "temporal"
                ? "El alumno conservará sus datos, pero quedará inactivo."
                : "Se eliminará el documento del alumno de Firebase. Las comunicaciones guardadas en otras colecciones no se borrarán automáticamente."}
            </p>

            {/* Motivo de la baja: sin elegirlo, el botón rojo queda deshabilitado */}
            <div className="campo">
              <label htmlFor="motivo">Motivo de la baja</label>
              <select
                id="motivo"
                className="entrada"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              >
                <option value="">Seleccionar motivo</option>
                <option value="cambio-escuela">Cambio de escuela</option>
                <option value="egreso">Egreso</option>
                <option value="abandono">Abandono</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Segundo aviso, solo para la eliminación definitiva */}
            {confirmacionDefinitiva &&
              tipoBaja === "definitiva" && (
                <p role="alert">
                  ¿Confirmás que querés eliminar definitivamente a este
                  alumno? Presioná nuevamente el botón para confirmar.
                </p>
              )}

            {/* Error de Firebase dentro del modal */}
            {error && <p role="alert">{error}</p>}

            {/* El texto del botón rojo cambia según el paso: Confirmar baja, Continuar o Sí, eliminar definitivamente */}
            <div className="botones">
              <button
                type="button"
                className="boton-secundario"
                onClick={cerrarModal}
                disabled={procesando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="boton-peligro"
                disabled={!motivo || procesando}
                onClick={confirmarBaja}
              >
                {procesando
                  ? "Procesando..."
                  : tipoBaja === "definitiva"
                    ? confirmacionDefinitiva
                      ? "Sí, eliminar definitivamente"
                      : "Continuar"
                    : "Confirmar baja"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AltaBajaAlumnos;