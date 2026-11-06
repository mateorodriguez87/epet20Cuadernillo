import { useState } from "react";
import { Link } from "react-router-dom";
import "../estilos/ayuda.css";

// Pantalla de preguntas frecuentes: buscador, categorías y respuestas que se abren al tocarlas
function Ayuda() {
  // Categorías para filtrar (el id es el que usa cada pregunta en "categoria")
  const categorias = [
    { id: "todas", nombre: "Todas" },
    { id: "cuenta", nombre: "Cuenta y acceso" },
    { id: "cursos", nombre: "Cursos y alumnos" },
    { id: "notificaciones", nombre: "Notificaciones" },
    { id: "tutores", nombre: "Para tutores" },
  ];

  // Las preguntas. "pasos" es opcional: se usa cuando la respuesta es una secuencia
  // Ojo: algunas respuestas avisan que una función todavía no está conectada.
  // Cuando se conecte, hay que actualizar ese texto.
  const preguntas = [
    {
      id: "crear-cuenta",
      categoria: "cuenta",
      pregunta: "¿Cómo creo una cuenta?",
      respuesta:
        "Desde la pantalla de inicio de sesión, tocá “Regístrate aquí” y completá el formulario.",
      pasos: [
        "Escribí tu nombre completo y elegí un nombre de usuario.",
        "Ingresá tu correo electrónico: con ese correo vas a iniciar sesión.",
        "Elegí el tipo de cuenta: preceptor/a o padre, madre o tutor.",
        "Elegí cómo querés que te salude la aplicación: Bienvenido o Bienvenida.",
        "Creá una contraseña de al menos 6 caracteres y repetila.",
        "Tocá “Crear cuenta”.",
      ],
    },
    {
      id: "tipo-cuenta",
      categoria: "cuenta",
      pregunta: "¿Qué tipo de cuenta tengo que elegir?",
      respuesta:
        "Elegí preceptor/a si vas a administrar cursos y alumnos y a enviar comunicaciones. Elegí padre, madre o tutor si vas a recibir las comunicaciones de la escuela. Al terminar el registro, la aplicación te lleva al inicio que corresponde a tu tipo de cuenta.",
    },
    {
      id: "datos-incorrectos",
      categoria: "cuenta",
      pregunta: "Me dice que el correo o la contraseña son incorrectos. ¿Qué hago?",
      respuesta:
        "Revisá que el correo esté bien escrito y sin espacios, y que la contraseña sea la que creaste al registrarte (se distinguen mayúsculas y minúsculas). Si todavía no tenés cuenta, creala desde “Regístrate aquí”.",
    },
    {
      id: "correo-registrado",
      categoria: "cuenta",
      pregunta: "Me dice que ese correo ya está registrado. ¿Qué significa?",
      respuesta:
        "Ese correo ya tiene una cuenta. Iniciá sesión con él en lugar de crear una nueva.",
    },
    {
      id: "olvide-contrasena",
      categoria: "cuenta",
      pregunta: "Olvidé mi contraseña. ¿Cómo la recupero?",
      respuesta:
        "La recuperación automática todavía no está disponible: el enlace “¿Olvidaste tu contraseña?” por ahora no envía ningún correo. Consultá con la escuela para que te ayuden a recuperar el acceso.",
    },
    {
      id: "cerrar-sesion",
      categoria: "cuenta",
      pregunta: "¿Cómo salgo de mi cuenta?",
      respuesta:
        "Usá el botón “Cerrar sesión” del menú lateral: te lleva a la pantalla de acceso. En algunas pantallas del preceptor el botón dice “Iniciar sesión”, pero lleva al mismo lugar.",
    },
    {
      id: "agregar-curso",
      categoria: "cursos",
      pregunta: "¿Cómo agrego un curso?",
      respuesta: "Se hace desde la sección Cursos del preceptor.",
      pasos: [
        "Entrá a “Cursos” desde el menú.",
        "Tocá “Agregar cursos”.",
        "Escribí el año (por ejemplo, primero o 1°) y la división (por ejemplo, primera o 1).",
        "Tocá “Guardar curso”.",
      ],
    },
    {
      id: "editar-eliminar-curso",
      categoria: "cursos",
      pregunta: "¿Cómo edito o elimino un curso?",
      respuesta:
        "En Cursos, cada curso tiene los botones “Editar” y “Eliminar”. Al eliminar, la aplicación te pide que confirmes, y esa acción no se puede deshacer.",
    },
    {
      id: "agregar-alumno",
      categoria: "cursos",
      pregunta: "¿Cómo agrego un alumno?",
      respuesta:
        "Para poder elegir un curso, primero tiene que haber cursos cargados.",
      pasos: [
        "Entrá a “Alumnos” desde el menú.",
        "Tocá “Agregar alumno”.",
        "Escribí el nombre y apellido, el DNI (7 u 8 números) y elegí el curso.",
        "Tocá “Guardar alumno”.",
      ],
    },
    {
      id: "no-guarda-alumno",
      categoria: "cursos",
      pregunta: "No me deja guardar un alumno. ¿Por qué?",
      respuesta:
        "Puede ser por tres motivos: falta completar algún campo, el DNI no tiene 7 u 8 números, o ya existe un alumno registrado con ese DNI. El mensaje que aparece en el formulario te dice cuál es.",
    },
    {
      id: "baja-alumno",
      categoria: "cursos",
      pregunta: "¿Cómo doy de baja a un alumno?",
      respuesta:
        "En Alumnos, tocá “Dar de baja alumno” para ir a la pantalla de alta y baja. Buscá al alumno por nombre o DNI, tocá “Dar de baja”, elegí el tipo de baja y el motivo, y confirmá.",
    },
    {
      id: "tipos-baja",
      categoria: "cursos",
      pregunta: "¿Qué diferencia hay entre baja temporal y definitiva?",
      respuesta:
        "En la baja temporal, el alumno conserva sus datos pero queda marcado como inactivo. En la definitiva se elimina de la base de datos y no se puede deshacer; las comunicaciones guardadas en otras colecciones no se borran automáticamente.",
    },
    {
      id: "estados-alumno",
      categoria: "cursos",
      pregunta: "¿Qué significan “Al día”, “Pendiente” y “Con observaciones”?",
      respuesta:
        "Son los estados de las comunicaciones de cada alumno. “Al día” quiere decir que todas están confirmadas, “Pendiente” que tiene comunicaciones sin leer y “Con observaciones” que requiere revisión.",
    },
    {
      id: "enviar-notificacion",
      categoria: "notificaciones",
      pregunta: "¿Cómo envío una notificación a un tutor?",
      respuesta:
        "Ojo: el envío todavía no está conectado, así que por ahora la notificación no se guarda ni le llega al tutor.",
      pasos: [
        "Entrá a “Notificaciones” desde el menú.",
        "Elegí al alumno: la notificación es para su tutor.",
        "Escribí el asunto y el mensaje.",
        "Elegí la prioridad (normal o importante). La fecha es opcional.",
        "Tocá “Enviar”.",
      ],
    },
    {
      id: "boton-enviar",
      categoria: "notificaciones",
      pregunta: "El botón “Enviar” está deshabilitado. ¿Por qué?",
      respuesta:
        "Se habilita cuando elegiste un alumno y completaste el asunto y el mensaje. El resumen de la derecha muestra “Faltan datos” hasta que estén completos y “Listo para enviar” cuando se puede enviar.",
    },
    {
      id: "prioridad",
      categoria: "notificaciones",
      pregunta: "¿Cuándo uso la prioridad “Importante”?",
      respuesta:
        "Usala para comunicaciones que el tutor debería leer cuanto antes. Para el resto, dejá “Normal”.",
    },
    {
      id: "historial",
      categoria: "notificaciones",
      pregunta: "¿Dónde veo las comunicaciones que ya envié?",
      respuesta:
        "En “Historial”. Por ahora aparece vacío y los filtros todavía no funcionan, porque el envío de notificaciones no está conectado.",
    },
    {
      id: "ver-notificaciones",
      categoria: "tutores",
      pregunta: "¿Dónde veo las notificaciones que envía la escuela?",
      respuesta:
        "En “Notificaciones recibidas”, desde el menú lateral. Si todavía no recibiste ninguna, vas a ver el mensaje “No recibiste notificaciones”.",
    },
    {
      id: "datos-del-alumno",
      categoria: "tutores",
      pregunta: "¿Dónde veo los datos de mi hijo o hija?",
      respuesta:
        "En “Datos del alumno”. Si aparece “Todavía no hay alumnos cargados”, la escuela aún no cargó sus datos: consultá con el preceptor.",
    },
    {
      id: "sin-leer",
      categoria: "tutores",
      pregunta: "¿Qué significa el puntito rojo en una notificación?",
      respuesta:
        "Marca una notificación que todavía no leíste. El número de “Notificaciones sin leer” del inicio cuenta esas notificaciones.",
    },
    {
      id: "tipos-notificacion",
      categoria: "tutores",
      pregunta: "¿Qué significa el color del ícono de cada notificación?",
      respuesta:
        "Indica el tipo de comunicación: rojo para las inasistencias, naranja para las de conducta, azul para las notas y verde para los avisos generales.",
    },
  ];

  // Estados de la pantalla:
  // busqueda: lo que se escribe en el buscador / categoria: la categoría elegida
  // abierta: el id de la pregunta desplegada (solo una a la vez)
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [abierta, setAbierta] = useState(null);

  // Pasa el texto a minúsculas y le saca los acentos, así "contrasena" encuentra "contraseña"
  const normalizar = (texto) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Preguntas que se muestran: tienen que ser de la categoría elegida
  // y contener lo que se escribió en la pregunta, la respuesta o los pasos
  const preguntasFiltradas = preguntas.filter((p) => {
    const coincideCategoria = categoria === "todas" || p.categoria === categoria;

    const texto = normalizar(
      `${p.pregunta} ${p.respuesta} ${(p.pasos || []).join(" ")}`
    );

    return coincideCategoria && texto.includes(normalizar(busqueda.trim()));
  });

  // Abre la pregunta tocada; si ya estaba abierta, la cierra
  const alternar = (id) => {
    setAbierta(abierta === id ? null : id);
  };

  // Deja el buscador y la categoría como al principio
  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoria("todas");
    setAbierta(null);
  };

  return (
    <div className="ayuda-pagina">
      {/* BARRA SUPERIOR */}
      <header className="ayuda-header">
        <div className="ayuda-marca">
          <div className="ayuda-marca-icono">💻</div>

          <div className="ayuda-marca-texto">
            <strong>Escuela Técnica</strong>
            <span>Cuaderno de Comunicaciones Digital</span>
          </div>
        </div>

        <Link to="/login" className="ayuda-volver">
          Volver al inicio de sesión
        </Link>
      </header>

      <main className="ayuda-contenido">
        {/* TÍTULO */}
        <section className="ayuda-intro">
          <h1>Preguntas frecuentes</h1>
          <p>
            Respuestas a las dudas más comunes sobre cómo usar el Cuaderno de
            Comunicaciones Digital.
          </p>
        </section>

        {/* BUSCADOR */}
        <div className="ayuda-buscador">
          <label htmlFor="ayuda-busqueda">Buscar una pregunta</label>

          <input
            id="ayuda-busqueda"
            type="search"
            placeholder="Por ejemplo: contraseña, alumno, notificación"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setAbierta(null);
            }}
          />
        </div>

        {/* CATEGORÍAS */}
        <div className="ayuda-categorias" role="group" aria-label="Categorías">
          {categorias.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`ayuda-categoria ${categoria === c.id ? "activa" : ""}`}
              aria-pressed={categoria === c.id}
              onClick={() => {
                setCategoria(c.id);
                setAbierta(null);
              }}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        {/* aria-live avisa a los lectores de pantalla cuando cambia la cantidad */}
        <p className="ayuda-contador" aria-live="polite">
          {preguntasFiltradas.length}{" "}
          {preguntasFiltradas.length === 1 ? "pregunta" : "preguntas"}
        </p>

        {/* LISTA DE PREGUNTAS */}
        {preguntasFiltradas.length === 0 ? (
          <div className="ayuda-vacio">
            <h2>No encontramos preguntas con esa búsqueda</h2>
            <p>
              Probá con otra palabra o mirá todas las preguntas de una
              categoría.
            </p>

            <button
              type="button"
              className="ayuda-boton"
              onClick={limpiarFiltros}
            >
              Ver todas las preguntas
            </button>
          </div>
        ) : (
          <div className="ayuda-lista">
            {preguntasFiltradas.map((p) => {
              const estaAbierta = abierta === p.id;

              return (
                <article
                  className={`ayuda-item ${estaAbierta ? "abierta" : ""}`}
                  key={p.id}
                >
                  {/* La pregunta es un botón: así se puede abrir con el teclado */}
                  <h2>
                    <button
                      type="button"
                      id={`pregunta-${p.id}`}
                      className="ayuda-pregunta"
                      aria-expanded={estaAbierta}
                      aria-controls={`respuesta-${p.id}`}
                      onClick={() => alternar(p.id)}
                    >
                      <span>{p.pregunta}</span>
                      <span className="ayuda-signo" aria-hidden="true">
                        {estaAbierta ? "−" : "+"}
                      </span>
                    </button>
                  </h2>

                  {/* La respuesta siempre está en la página; hidden la oculta hasta que se abre */}
                  <div
                    id={`respuesta-${p.id}`}
                    className="ayuda-respuesta"
                    role="region"
                    aria-labelledby={`pregunta-${p.id}`}
                    hidden={!estaAbierta}
                  >
                    <p>{p.respuesta}</p>

                    {p.pasos && (
                      <ol className="ayuda-pasos">
                        {p.pasos.map((paso, index) => (
                          <li key={index}>{paso}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* SI NO ALCANZA */}
        <section className="ayuda-contacto">
          <h2>¿No encontraste lo que buscabas?</h2>
          <p>
            Consultá con la escuela: el preceptor o el personal de la
            institución te van a ayudar.
          </p>

          <div className="ayuda-enlaces">
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/registro">Crear una cuenta</Link>
          </div>
        </section>
      </main>

      <footer className="ayuda-footer">
        Cuaderno de Comunicaciones Digital - EPET N° 20, Neuquén
      </footer>
    </div>
  );
}

export default Ayuda;