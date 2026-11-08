
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { onAuthStateChanged, signOut } from "firebase/auth";

import {
  LayoutDashboard,
  Users,
  UserRound,
  LogOut,
  Search,
  ShieldCheck,
  Pencil,
} from "lucide-react";

import { db, auth } from "../firebase";
import AdminModal from "./adminmodal.jsx";

import "../estilos/administrador.css";

function Administrador() {
  const navigate = useNavigate();

  // Sección seleccionada del menú lateral
  const [seccion, setSeccion] = useState("inicio");

  // Usuarios obtenidos desde Firestore
  const [usuarios, setUsuarios] = useState([]);

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("");

  // Estados generales
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [fecha, setFecha] = useState(new Date());

  // Usuario seleccionado para editar
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Actualizar la fecha cada minuto
  useEffect(() => {
    const intervalo = setInterval(() => {
      setFecha(new Date());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  // Verificar que el usuario tenga el rol de administrador
  // y obtener los usuarios de Firestore
  useEffect(() => {
    let cancelar = false;
    let dejarDeEscucharUsuarios = null;

    const dejarDeEscucharAuth = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        navigate("/login");
        return;
      }

      try {
        const referencia = doc(db, "usuarios", usuario.uid);
        const documento = await getDoc(referencia);

        if (cancelar) return;

        if (!documento.exists() || documento.data().rol !== "administrador") {
          await signOut(auth);
          navigate("/login");
          return;
        }

        setAutorizado(true);

        // Escuchar los cambios de la colección usuarios en tiempo real
        dejarDeEscucharUsuarios = onSnapshot(
          collection(db, "usuarios"),
          (snapshot) => {
            const listaUsuarios = snapshot.docs.map((documento) => ({
              id: documento.id,
              ...documento.data(),
            }));

            if (!cancelar) {
              setUsuarios(listaUsuarios);
              setCargando(false);
              setError("");
            }
          },
          (error) => {
            console.error("Error al obtener usuarios:", error);
            setError("No se pudieron cargar los usuarios.");
            setCargando(false);
          }
        );
      } catch (error) {
        console.error("Error al verificar administrador:", error);

        if (!cancelar) {
          setError("Ocurrió un error al verificar los permisos.");
          setCargando(false);
        }
      }
    });

    return () => {
      cancelar = true;
      dejarDeEscucharAuth();

      if (dejarDeEscucharUsuarios) {
        dejarDeEscucharUsuarios();
      }
    };
  }, [navigate]);

  // Guardar los cambios realizados desde el modal
  const guardarCambiosUsuario = async (datos) => {
    if (!usuarioSeleccionado) return;

    try {
      const referenciaUsuario = doc(
        db,
        "usuarios",
        usuarioSeleccionado.id
      );

      await updateDoc(referenciaUsuario, datos);

      setUsuarioSeleccionado(null);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setError("No se pudo cerrar la sesión.");
    }
  };

  // Obtener cursos disponibles para el filtro
  const cursosDisponibles = useMemo(() => {
    return [
      ...new Set(
        usuarios
          .map((usuario) => usuario.curso)
          .filter(Boolean)
      ),
    ].sort();
  }, [usuarios]);

  // Filtrar usuarios según la sección, búsqueda, curso y turno
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
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

      const coincideCurso =
        filtroCurso === "" || usuario.curso === filtroCurso;

      const coincideTurno =
        filtroTurno === "" || usuario.turno === filtroTurno;

      let coincideSeccion = true;

      if (seccion === "preceptores") {
        coincideSeccion = usuario.rol === "preceptor";
      }

      if (seccion === "tutores") {
        coincideSeccion = usuario.rol === "tutor";
      }

      return (
        coincideBusqueda &&
        coincideCurso &&
        coincideTurno &&
        coincideSeccion
      );
    });
  }, [usuarios, busqueda, filtroCurso, filtroTurno, seccion]);

  // Cambiar de sección y limpiar los filtros
  const cambiarSeccion = (nuevaSeccion) => {
    setSeccion(nuevaSeccion);
    setBusqueda("");
    setFiltroCurso("");
    setFiltroTurno("");
  };

  // Contadores
  const totalUsuarios = usuarios.length;

  const totalPreceptores = usuarios.filter(
    (usuario) => usuario.rol === "preceptor"
  ).length;

  const totalTutores = usuarios.filter(
    (usuario) => usuario.rol === "tutor"
  ).length;

  // Título según la sección seleccionada
  const obtenerTitulo = () => {
    if (seccion === "preceptores") return "Preceptores";
    if (seccion === "tutores") return "Tutores";
    return "Panel de administración";
  };

  if (!autorizado) {
    return (
      <div className="admin-cargando">
        Verificando permisos...
      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* MENÚ LATERAL */}
      <aside className="admin-sidebar">

        <div className="admin-logo">
          <ShieldCheck size={30} />
          <h2>ADMINISTRACIÓN</h2>
        </div>

        <div className="admin-perfil">
          <div className="admin-avatar">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h3>Administrador</h3>
            <p>Panel de control</p>
          </div>
        </div>

        <nav className="admin-menu">

          <button
            className={seccion === "inicio" ? "activo" : ""}
            onClick={() => cambiarSeccion("inicio")}
          >
            <LayoutDashboard size={19} />
            Inicio
          </button>

          <button
            className={seccion === "preceptores" ? "activo" : ""}
            onClick={() => cambiarSeccion("preceptores")}
          >
            <Users size={19} />
            Preceptores
          </button>

          <button
            className={seccion === "tutores" ? "activo" : ""}
            onClick={() => cambiarSeccion("tutores")}
          >
            <UserRound size={19} />
            Tutores
          </button>

        </nav>

        <button
          className="admin-cerrar"
          onClick={cerrarSesion}
        >
          <LogOut size={19} />
          Cerrar sesión
        </button>

      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="admin-contenido">

        <header className="admin-header">
          <div>
            <h1>{obtenerTitulo()}</h1>
            <p>Administración del cuaderno de comunicaciones</p>
          </div>

          <div className="admin-fecha">
            {fecha.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </header>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {/* INICIO */}
        {seccion === "inicio" && (
          <section className="admin-tarjetas">

            <div className="admin-tarjeta">
              <div>
                <p>Usuarios registrados</p>
                <h2>{totalUsuarios}</h2>
              </div>

              <Users size={30} />
            </div>

            <div className="admin-tarjeta">
              <div>
                <p>Preceptores</p>
                <h2>{totalPreceptores}</h2>
              </div>

              <ShieldCheck size={30} />
            </div>

            <div className="admin-tarjeta">
              <div>
                <p>Tutores</p>
                <h2>{totalTutores}</h2>
              </div>

              <UserRound size={30} />
            </div>

          </section>
        )}

        {/* LISTADO DE USUARIOS */}
        <section className="admin-listado">

          <div className="admin-listado-titulo">
            <div>
              <h2>
                {seccion === "inicio"
                  ? "Todos los usuarios"
                  : seccion === "preceptores"
                  ? "Listado de preceptores"
                  : "Listado de tutores"}
              </h2>

              <p>
                Consultá y administrá los usuarios registrados.
              </p>
            </div>
          </div>

          {/* BUSCADOR Y FILTROS */}
          <div className="admin-filtros">

            <div className="admin-buscador">
              <Search size={18} />

              <input
                type="text"
                placeholder="Buscar por nombre, usuario o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              value={filtroCurso}
              onChange={(e) => setFiltroCurso(e.target.value)}
            >
              <option value="">Todos los cursos</option>

              {cursosDisponibles.map((curso) => (
                <option key={curso} value={curso}>
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

          </div>

          {/* TABLA */}
          {cargando ? (
            <p className="admin-cargando">
              Cargando usuarios...
            </p>
          ) : (
            <div className="admin-tabla-contenedor">

              <table className="admin-tabla">

                <thead>
                  <tr>
                    <th>Nombre completo</th>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Curso</th>
                    <th>Turno</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>

                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
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
                          <span className="admin-rol">
                            {usuario.rol || "Sin rol"}
                          </span>
                        </td>

                        <td>
                          {usuario.rol !== "administrador" && (
                            <button
                              className="admin-editar"
                              onClick={() =>
                                setUsuarioSeleccionado(usuario)
                              }
                              title="Editar usuario"
                            >
                              <Pencil size={16} />
                              Editar
                            </button>
                          )}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>

      {/* MODAL PARA EDITAR USUARIOS */}
      {usuarioSeleccionado && (
        <AdminModal
          usuario={usuarioSeleccionado}
          onCerrar={() => setUsuarioSeleccionado(null)}
          onGuardar={guardarCambiosUsuario}
        />
      )}

    </div>
  );
}

export default Administrador;
