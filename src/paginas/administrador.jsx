
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// la firebase Authentication y Firestore
import { auth, db } from "../firebase";

import {
  collection,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

// los iconos para el menú y las acciones
import {
  LayoutDashboard,
  Users,
  UserRound,
  LogOut,
  Search,
  ShieldCheck,
} from "lucide-react";

// estilos propios del administrador
import "../estilos/administrador.css";

function Administrador() {

  // nos permite navegar entre las diferentes pantallas
  const navigate = useNavigate();

  // guarda la sección seleccionada del menú lateral
  const [seccion, setSeccion] = useState("inicio");

  // guarda todos los usuarios obtenidos desde Firestore
  const [usuarios, setUsuarios] = useState([]);

  // guarda el texto ingresado en el buscador
  const [busqueda, setBusqueda] = useState("");

  // guarda el curso seleccionado en los filtros
  const [filtroCurso, setFiltroCurso] = useState("");

  // guarda el turno seleccionado en los filtros
  const [filtroTurno, setFiltroTurno] = useState("");

  // controla si se están cargando los datos
  const [cargando, setCargando] = useState(true);

  // guarda los mensajes de error
  const [error, setError] = useState("");

  // comprueba si el usuario tiene autorización
  const [autorizado, setAutorizado] = useState(false);

  // guarda la fecha actual
  const [fecha, setFecha] = useState(new Date());


  // actualiza la fecha automáticamente cada minuto
  useEffect(() => {

    const intervalo = setInterval(() => {
      setFecha(new Date());
    }, 60000);

    // limpia el intervalo al abandonar la pantalla
    return () => clearInterval(intervalo);
  }, []);


  // comprueba el rol y obtiene los usuarios desde Firestore
  useEffect(() => {

    let cancelarEscucha = null;
    let componenteActivo = true;

    const verificarAdministrador = async () => {

      try {

        // obtiene el usuario que inició sesión
        const usuarioActual = auth.currentUser;

        // si no hay una sesión iniciada, vuelve al login
        if (!usuarioActual) {
          navigate("/login", { replace: true });
          return;
        }

        // busca el documento del usuario en Firestore
        const referenciaUsuario = doc(
          db,
          "usuarios",
          usuarioActual.uid
        );

        const documentoUsuario = await getDoc(referenciaUsuario);

        // comprueba que el documento exista y tenga rol administrador
        if (
          !documentoUsuario.exists() ||
          documentoUsuario.data().rol !== "administrador"
        ) {
          navigate("/login", { replace: true });
          return;
        }

        if (!componenteActivo) return;

        // autoriza la visualización del panel
        setAutorizado(true);

        // escucha en tiempo real la colección de usuarios
        cancelarEscucha = onSnapshot(
          collection(db, "usuarios"),

          (snapshot) => {

            // convierte los documentos de Firebase en objetos
            const listaUsuarios = snapshot.docs.map((documento) => ({
              id: documento.id,
              ...documento.data(),
            }));

            // guarda los usuarios en el estado
            setUsuarios(listaUsuarios);

            // finaliza la carga
            setCargando(false);
          },

          (error) => {
            console.error("Error al cargar usuarios:", error);
            setError("No se pudieron cargar los usuarios.");
            setCargando(false);
          }
        );

      } catch (error) {

        console.error("Error al verificar administrador:", error);
        setError("No se pudo verificar el acceso al panel.");
        setCargando(false);

      }
    };

    verificarAdministrador();

    // cancela la escucha cuando se abandona la pantalla
    return () => {
      componenteActivo = false;

      if (cancelarEscucha) {
        cancelarEscucha();
      }
    };

  }, [navigate]);


  // separa los usuarios según su rol
  const preceptores = usuarios.filter(
    (usuario) => usuario.rol === "preceptor"
  );

  const tutores = usuarios.filter(
    (usuario) => usuario.rol === "tutor"
  );


  // obtiene los cursos disponibles para los filtros
  const cursosDisponibles = [
    ...new Set(
      usuarios
        .map((usuario) => usuario.curso)
        .filter(Boolean)
    ),
  ];


  // filtra los usuarios según el nombre, correo, curso y turno
  const filtrarUsuarios = (lista) => {

    return lista.filter((usuario) => {

      // busca coincidencias en nombre, usuario o correo
      const coincideBusqueda =
        (usuario.nombre || "")
          .toLowerCase()
          .includes(busqueda.toLowerCase()) ||

        (usuario.usuario || "")
          .toLowerCase()
          .includes(busqueda.toLowerCase()) ||

        (usuario.correo || "")
          .toLowerCase()
          .includes(busqueda.toLowerCase());

      // comprueba si coincide con el curso seleccionado
      const coincideCurso =
        !filtroCurso || usuario.curso === filtroCurso;

      // comprueba si coincide con el turno seleccionado
      const coincideTurno =
        !filtroTurno || usuario.turno === filtroTurno;

      return coincideBusqueda && coincideCurso && coincideTurno;

    });

  };


  // cierra la sesión del administrador
  const cerrarSesion = async () => {

    try {
      await auth.signOut();

      navigate("/login", { replace: true });

    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }

  };


  // cambia de sección y reinicia los filtros
  const cambiarSeccion = (nuevaSeccion) => {

    setSeccion(nuevaSeccion);
    setBusqueda("");
    setFiltroCurso("");
    setFiltroTurno("");

  };


  // obtiene la lista correspondiente a la sección seleccionada
  const usuariosMostrar =
    seccion === "preceptores"
      ? filtrarUsuarios(preceptores)
      : seccion === "tutores"
        ? filtrarUsuarios(tutores)
        : filtrarUsuarios(usuarios);


  // mientras se verifica el acceso, muestra un mensaje
  if (!autorizado || cargando) {
    return (
      <div className="admin-cargando">
        Verificando acceso y cargando usuarios...
      </div>
    );
  }


  // si ocurre un error, muestra el mensaje
  if (error) {
    return (
      <div className="admin-error">
        {error}
      </div>
    );
  }


  // interfaz principal del administrador
  return (

    <div className="admin-page">

      {/* MENÚ LATERAL */}

      <aside className="admin-sidebar">

        {/* Logo y nombre del sistema */}
        <div className="admin-logo">

          <ShieldCheck size={30} />

          <h2>
            CUADERNO DE COMUNICACIONES
          </h2>

        </div>


        {/* Información del administrador */}
        <div className="admin-perfil">

          <h3>Administrador</h3>

          <span>Panel de administración</span>

        </div>


        {/* estas son las opciones de navegación */}
        <nav className="admin-menu">

          <button
            className={seccion === "inicio" ? "activo" : ""}
            onClick={() => cambiarSeccion("inicio")}
          >
            <LayoutDashboard size={20} />
            Inicio
          </button>


          <button
            className={seccion === "preceptores" ? "activo" : ""}
            onClick={() => cambiarSeccion("preceptores")}
          >
            <Users size={20} />
            Preceptores
          </button>


          <button
            className={seccion === "tutores" ? "activo" : ""}
            onClick={() => cambiarSeccion("tutores")}
          >
            <UserRound size={20} />
            Tutores
          </button>

        </nav>


        {/* el btón para cerrar sesión */}
        <button
          className="admin-cerrar"
          onClick={cerrarSesion}
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>

      </aside>


      {/* CONTENIDO PRINCIPAL */}

      <main className="admin-contenido">


        {/* ENCABEZADO */}

        <header className="admin-header">

          <div>

            <h1>
              {seccion === "inicio"
                ? "Inicio"
                : seccion === "preceptores"
                  ? "Preceptores"
                  : "Tutores"}
            </h1>

            <p>
              Bienvenido al panel de administración.
            </p>

            {/* Muestra la fecha actualizada automáticamente */}
            <p className="admin-fecha">
              {fecha.toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

          </div>

        </header>


        {/* TARJETAS DE RESUMEN */}

        {seccion === "inicio" && (

          <div className="admin-tarjetas">

            <div className="admin-tarjeta">

              <Users size={25} />

              <h3>Usuarios registrados</h3>

              <strong>{usuarios.length}</strong>

            </div>


            <div className="admin-tarjeta">

              <UserRound size={25} />

              <h3>Preceptores</h3>

              <strong>{preceptores.length}</strong>

            </div>


            <div className="admin-tarjeta">

              <Users size={25} />

              <h3>Tutores</h3>

              <strong>{tutores.length}</strong>

            </div>

          </div>

        )}


        {/* LISTADO DE USUARIOS */}

        <section className="admin-listado">

          <div className="admin-listado-titulo">

            <h2>
              {seccion === "inicio"
                ? "Todos los usuarios registrados"
                : seccion === "preceptores"
                  ? "Listado de preceptores"
                  : "Listado de tutores"}
            </h2>

            <span>
              {usuariosMostrar.length} usuarios
            </span>

          </div>


          {/* BUSCADOR */}

          <div className="admin-filtros">

            <div className="admin-buscador">

              <Search size={19} />

              <input
                type="text"
                placeholder="Buscar por nombre, usuario o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

            </div>


            {/* FILTROS POR CURSO Y TURNO */}

            {seccion !== "inicio" && (

              <>

                <select
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                >

                  <option value="">Todos los cursos</option>

                  {cursosDisponibles.map((curso, indice) => (

                    <option key={indice} value={curso}>
                      {curso}
                    </option>

                  ))}

                </select>


                <select
                  value={filtroTurno}
                  onChange={(e) => setFiltroTurno(e.target.value)}
                >

                  <option value="">Todos los turnos</option>

                  <option value="mañana">Mañana</option>

                  <option value="tarde">Tarde</option>

                  <option value="vespertino">Vespertino</option>

                </select>

              </>

            )}

          </div>


          {/* TABLA DE USUARIOS */}

          <div className="admin-tabla-contenedor">

            <table className="admin-tabla">

              <thead>

                <tr>
                  <th>Nombre completo</th>
                  <th>Usuario</th>
                  <th>Correo electrónico</th>
                  <th>Curso</th>
                  <th>Turno</th>
                  <th>Rol</th>
                </tr>

              </thead>


              <tbody>

                {usuariosMostrar.length > 0 ? (

                  usuariosMostrar.map((usuario) => (

                    <tr key={usuario.id}>

                      <td>
                        {usuario.nombre || "Sin nombre"}
                      </td>

                      <td>
                        {usuario.usuario || "Sin usuario"}
                      </td>

                      <td>
                        {usuario.correo || "Sin correo"}
                      </td>

                      <td>
                        {usuario.curso || "Sin asignar"}
                      </td>

                      <td>
                        {usuario.turno || "Sin asignar"}
                      </td>

                      <td>

                        <span className={`admin-rol ${usuario.rol}`}>
                          {usuario.rol || "Sin rol"}
                        </span>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td colSpan="6">
                      No se encontraron usuarios.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>

  );

}

export default Administrador;
