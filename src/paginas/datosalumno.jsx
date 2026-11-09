// Hooks de React: useState para los estados y useEffect para cargar datos y actualizar la fecha
import { useEffect, useState } from "react";

// NavLink arma los links del menú y marca el activo; useNavigate permite cambiar de pantalla
import { NavLink, useNavigate } from "react-router-dom";

// Funciones de Firebase Authentication
import { onAuthStateChanged, signOut } from "firebase/auth";

// Funciones de Firestore
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";

// Conexión con Firebase
import { auth, db } from "../firebase";

// Estilos de esta pantalla
import "../estilos/datosalumno.css";

// Pantalla "Datos del alumno" del tutor
function DatosAlumno() {
  const navigate = useNavigate();

  // fecha: la de hoy, para el encabezado
  const [fecha, setFecha] = useState(new Date());

  // Datos del tutor que inició sesión
  const [tutorId, setTutorId] = useState("");
  const [tutor, setTutor] = useState(null);

  // Lista de alumnos vinculados al tutor
  const [alumnos, setAlumnos] = useState([]);

  // Alumno seleccionado para consultar sus datos
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("");

  // Estados de carga y mensajes
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estados del formulario para agregar un alumno
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [dni, setDni] = useState("");
  const [buscandoAlumno, setBuscandoAlumno] = useState(false);
  const [mensajeFormulario, setMensajeFormulario] = useState("");

  // Cada minuto se vuelve a leer la fecha, para que el encabezado no quede desactualizado
  useEffect(() => {
    // Se ejecuta cada 60000 milisegundos (un minuto)
    const intervalo = setInterval(() => {
      setFecha(new Date());
    }, 60000);

    // Al salir de la pantalla se frena el temporizador
    return () => clearInterval(intervalo);
  }, []);

  // Fecha lista para mostrar, en español de Argentina
  const fechaFormateada = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Carga los datos del tutor y los alumnos vinculados
  useEffect(() => {
    const cancelarEscucha = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        navigate("/login");
        return;
      }

      try {
        setCargando(true);
        setError("");
        setTutorId(usuario.uid);

        // Busca los datos del tutor en la colección usuarios
        const tutorRef = doc(db, "usuarios", usuario.uid);
        const tutorSnap = await getDoc(tutorRef);

        if (!tutorSnap.exists()) {
          setError("No se encontraron los datos de tu cuenta.");
          setCargando(false);
          return;
        }

        const datosTutor = tutorSnap.data();

        if (datosTutor.rol !== "tutor") {
          setError("Esta pantalla está disponible para cuentas de tutor.");
          setCargando(false);
          return;
        }

        setTutor(datosTutor);

        // Obtiene los IDs de los alumnos vinculados al tutor
        const hijosIds = Array.isArray(datosTutor.hijos)
          ? datosTutor.hijos
          : [];

        if (hijosIds.length === 0) {
          setAlumnos([]);
          setAlumnoSeleccionado("");
          setCargando(false);
          return;
        }

        // Busca los datos de cada alumno en la colección Alumnos
        const alumnosEncontrados = await Promise.all(
          hijosIds.map(async (idAlumno) => {
            const alumnoRef = doc(db, "Alumnos", idAlumno);
            const alumnoSnap = await getDoc(alumnoRef);

            if (!alumnoSnap.exists()) {
              return null;
            }

            return {
              id: alumnoSnap.id,
              ...alumnoSnap.data(),
            };
          })
        );

        const alumnosValidos = alumnosEncontrados.filter(Boolean);

        setAlumnos(alumnosValidos);

        // Selecciona automáticamente el primer alumno si hay alguno
        if (alumnosValidos.length > 0) {
          setAlumnoSeleccionado(alumnosValidos[0].id);
        } else {
          setAlumnoSeleccionado("");
        }
      } catch (error) {
        console.error("Error al cargar los datos del alumno:", error);
        setError("No se pudieron cargar los datos. Revisá tu conexión e intentá nuevamente.");
      } finally {
        setCargando(false);
      }
    });

    return () => cancelarEscucha();
  }, [navigate]);

  // Busca el alumno por DNI y lo vincula a la cuenta del tutor
  async function agregarAlumno() {
    if (!dni.trim()) {
      setMensajeFormulario("Ingresá el DNI del alumno.");
      return;
    }

    try {
      setBuscandoAlumno(true);
      setMensajeFormulario("");

      // Obtiene los alumnos cargados en el sistema
      const alumnosRef = collection(db, "Alumnos");
      const alumnosSnap = await getDocs(alumnosRef);

      // Busca coincidencia de DNI, contemplando que esté guardado como texto o número
      const alumnoEncontrado = alumnosSnap.docs.find((documento) => {
        const datos = documento.data();
        return String(datos.dni || "").trim() === dni.trim();
      });

      if (!alumnoEncontrado) {
        setMensajeFormulario(
          "No encontramos un alumno con ese DNI. Consultá con la administración para verificar que esté cargado."
        );
        return;
      }

      // Verifica que el alumno no esté vinculado previamente
      if (alumnos.some((alumno) => alumno.id === alumnoEncontrado.id)) {
        setMensajeFormulario("Este alumno ya está vinculado a tu cuenta.");
        return;
      }

      // Agrega el ID del alumno al arreglo hijos del tutor
      const tutorRef = doc(db, "usuarios", tutorId);

      await updateDoc(tutorRef, {
        hijos: arrayUnion(alumnoEncontrado.id),
      });

      // Actualiza la pantalla sin tener que volver a iniciar sesión
      const nuevoAlumno = {
        id: alumnoEncontrado.id,
        ...alumnoEncontrado.data(),
      };

      setAlumnos((anteriores) => [...anteriores, nuevoAlumno]);
      setAlumnoSeleccionado(nuevoAlumno.id);

      setDni("");
      setMostrarFormulario(false);
      setMensajeFormulario("");
    } catch (error) {
      console.error("Error al vincular al alumno:", error);
      setMensajeFormulario("No se pudo vincular al alumno. Intentá nuevamente.");
    } finally {
      setBuscandoAlumno(false);
    }
  }

  // Cierra el formulario para agregar un alumno
  function cerrarFormulario() {
    setMostrarFormulario(false);
    setDni("");
    setMensajeFormulario("");
  }

  // Cierra la sesión y vuelve a la pantalla de inicio de sesión
  async function cerrarSesion() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setError("No se pudo cerrar la sesión.");
    }
  }

  // Alumno que se está mostrando actualmente
  const alumnoActual = alumnos.find(
    (alumno) => alumno.id === alumnoSeleccionado
  );

  // Permite mostrar el nombre completo aunque los campos estén separados
  function nombreCompleto(alumno) {
    if (!alumno) return "No especificado";

    return (
      [alumno.nombre, alumno.apellido].filter(Boolean).join(" ") ||
      alumno.nombreCompleto ||
      "No especificado"
    );
  }

  // Desde acá empieza lo que se dibuja en pantalla
  return (
    <div className="datos-alumno-pagina">
      {/* PANEL LATERAL */}
      <aside className="datos-alumno-sidebar">
        <div className="datos-alumno-logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        {/* Menú del tutor: NavLink pone la clase "activo" solo en la opción que coincide con la ruta actual */}
        <nav className="datos-alumno-menu">
          <NavLink
            to="/iniciotutor"
            end
            className={({ isActive }) =>
              `datos-alumno-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="datos-alumno-icono">⌂</span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/notificacionesrecibidas"
            className={({ isActive }) =>
              `datos-alumno-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="datos-alumno-icono">♧</span>
            <span>Notificaciones recibidas</span>
          </NavLink>

          <NavLink
            to="/datosalumno"
            className={({ isActive }) =>
              `datos-alumno-menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="datos-alumno-icono">▤</span>
            <span>Datos del alumno</span>
          </NavLink>
        </nav>

        {/* Cerrar sesión */}
        <button
          type="button"
          className="datos-alumno-cerrar-sesion"
          onClick={cerrarSesion}
        >
          <span className="datos-alumno-icono">⇥</span>
          <span>Cerrar sesión</span>
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="datos-alumno-contenido">
        {/* Encabezado: título a la izquierda, fecha y botón de login a la derecha */}
        <header className="datos-alumno-header">
          <div>
            <h1>Datos del alumno</h1>
            <p>Inicio &nbsp;›&nbsp; Datos del alumno</p>
          </div>

          {/* Fecha de hoy y botón "Iniciar sesión", juntos */}
          <div className="datos-alumno-fecha">
            <span>▦</span>
            <p>{fechaFormateada}</p>

            <button
              type="button"
              className="datos-alumno-login"
              onClick={cerrarSesion}
            >
              Iniciar sesión ↗
            </button>
          </div>
        </header>

        {/* INFORMACIÓN DEL ALUMNO */}
        <section className="datos-alumno-tarjeta">
          {cargando ? (
            <div className="datos-alumno-vacio">
              <h2>Cargando datos del alumno...</h2>
            </div>
          ) : error ? (
            <div className="datos-alumno-vacio">
              <h2>No se pudieron mostrar los datos</h2>
              <p>{error}</p>
            </div>
          ) : alumnos.length === 0 ? (
            /* Estado vacío: se muestra cuando el tutor todavía no tiene alumnos vinculados */
            <div className="datos-alumno-vacio">
              {/* Ícono de persona (no es una foto) */}
              <div className="datos-alumno-avatar">♙</div>

              <h2>Todavía no hay alumnos cargados</h2>

              <p>
                Cuando se carguen los datos de un alumno,
                vas a poder consultar acá su información
                personal, académica y los datos de su tutor.
              </p>

              {/* "Agregar alumno" abre el formulario para buscar un alumno por DNI */}
              <button
                type="button"
                className="datos-alumno-agregar"
                onClick={() => {
                  setMostrarFormulario(true);
                  setMensajeFormulario("");
                }}
              >
                <span>＋</span>
                Agregar alumno
              </button>
            </div>
          ) : (
            /* Información de los alumnos vinculados al tutor */
            <div className="datos-alumno-informacion">
              <div className="datos-alumno-acciones">
                <div>
                  <h2>Información del alumno</h2>
                  <p>Consultá los datos personales y académicos.</p>
                </div>

                <button
                  type="button"
                  className="datos-alumno-agregar"
                  onClick={() => {
                    setMostrarFormulario(true);
                    setMensajeFormulario("");
                  }}
                >
                  <span>＋</span>
                  Agregar alumno
                </button>
              </div>

              {/* Selector para tutores que tienen más de un hijo vinculado */}
              {alumnos.length > 1 && (
                <div className="datos-alumno-selector">
                  <label htmlFor="seleccionar-alumno">
                    Seleccionar alumno:
                  </label>

                  <select
                    id="seleccionar-alumno"
                    value={alumnoSeleccionado}
                    onChange={(e) => setAlumnoSeleccionado(e.target.value)}
                  >
                    {alumnos.map((alumno) => (
                      <option key={alumno.id} value={alumno.id}>
                        {nombreCompleto(alumno)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {alumnoActual && (
                <div className="datos-alumno-detalles">
                  <div className="datos-alumno-seccion">
                    <h3>Datos personales</h3>

                    <div className="datos-alumno-grilla">
                      <div className="datos-alumno-campo">
                        <span>Nombre y apellido</span>
                        <strong>{nombreCompleto(alumnoActual)}</strong>
                      </div>

                      <div className="datos-alumno-campo">
                        <span>DNI</span>
                        <strong>{alumnoActual.dni || "No especificado"}</strong>
                      </div>

                      <div className="datos-alumno-campo">
                        <span>Fecha de nacimiento</span>
                        <strong>
                          {alumnoActual.fechaNacimiento || "No especificada"}
                        </strong>
                      </div>

                      <div className="datos-alumno-campo">
                        <span>Legajo</span>
                        <strong>{alumnoActual.legajo || "No especificado"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="datos-alumno-seccion">
                    <h3>Datos académicos</h3>

                    <div className="datos-alumno-grilla">
                      <div className="datos-alumno-campo">
                        <span>Curso</span>
                        <strong>
                          {alumnoActual.curso || "No especificado"}
                        </strong>
                      </div>

                      <div className="datos-alumno-campo">
                        <span>División</span>
                        <strong>
                          {alumnoActual.division || "No especificada"}
                        </strong>
                      </div>

                      <div className="datos-alumno-campo">
                        <span>Turno</span>
                        <strong>
                          {alumnoActual.turno || "No especificado"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="datos-alumno-seccion">
                    <h3>Datos del tutor</h3>

                    <div className="datos-alumno-grilla">
                      <div className="datos-alumno-campo">
                        <span>Nombre del tutor</span>
                        <strong>
                          {tutor?.nombre || "No especificado"}
                        </strong>
                      </div>

                      <div className="datos-alumno-campo">
                        <span>Correo electrónico</span>
                        <strong>
                          {tutor?.correo || "No especificado"}
                        </strong>
                      </div>

                      <div className="datos-alumno-campo">
                        <span>Usuario</span>
                        <strong>
                          {tutor?.usuario || "No especificado"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* AVISO INFORMATIVO */}
        <div className="datos-alumno-aviso">
          <span>ⓘ</span>
          <p>
            La información del alumno aparecerá acá cuando
            se encuentre cargada en el sistema.
          </p>
        </div>

        {/* Pie de la pantalla */}
        <footer className="datos-alumno-footer">
          Cuaderno de Comunicaciones Digital · EPET 20
        </footer>
      </main>

      {/* FORMULARIO PARA AGREGAR UN ALUMNO */}
      {mostrarFormulario && (
        <div className="datos-alumno-modal-fondo">
          <div className="datos-alumno-modal">
            <button
              type="button"
              className="datos-alumno-modal-cerrar"
              onClick={cerrarFormulario}
              aria-label="Cerrar formulario"
            >
              ×
            </button>

            <h2>Agregar alumno</h2>
            <p>
              Ingresá el DNI del alumno para buscarlo entre los alumnos
              cargados en el sistema.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                agregarAlumno();
              }}
            >
              <label htmlFor="dni-alumno">DNI del alumno</label>

              <input
                id="dni-alumno"
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ingresá el DNI"
                autoComplete="off"
              />

              {mensajeFormulario && (
                <p className="datos-alumno-mensaje">
                  {mensajeFormulario}
                </p>
              )}

              <div className="datos-alumno-modal-botones">
                <button
                  type="button"
                  className="datos-alumno-cancelar"
                  onClick={cerrarFormulario}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="datos-alumno-confirmar"
                  disabled={buscandoAlumno}
                >
                  {buscandoAlumno ? "Buscando..." : "Buscar alumno"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatosAlumno;