
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

  // SECCIONES Y DATOS
  const [seccion, setSeccion] = useState("inicio");

  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);

  // FILTROS
  const [busqueda, setBusqueda] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("");

  // ESTADOS GENERALES
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [fecha, setFecha] = useState(new Date());

  // MODAL
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // ACTUALIZAR FECHA
  useEffect(() => {
    const intervalo = setInterval(() => {
      setFecha(new Date());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  // VERIFICAR ADMINISTRADOR Y CARGAR COLECCIONES
  useEffect(() => {
    let cancelar = false;
    let detenerUsuarios = null;
    let detenerCursos = null;
    let detenerAlumnos = null;

    const detenerAuth = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        navigate("/login");
        return;
      }

      try {
        const referencia = doc(db, "usuarios", usuario.uid);
        const documento = await getDoc(referencia);

        if (cancelar) return;

        if (
          !documento.exists() ||
          documento.data().rol !== "administrador"
        ) {
          await signOut(auth);
          navigate("/login");
          return;
        }

        setAutorizado(true);

        // CARGAR USUARIOS
        detenerUsuarios = onSnapshot(
          collection(db, "usuarios"),
          (snapshot) => {
            const lista = snapshot.docs.map((documento) => ({
              id: documento.id,
              ...documento.data(),
            }));

            if (!cancelar) {
              setUsuarios(lista);
              setCargando(false);
              setError("");
            }
          },
          (error) => {
            console.error("Error al cargar usuarios:", error);
            setError("No se pudieron cargar los usuarios.");
            setCargando(false);
          }
        );

        // CARGAR CURSOS
        detenerCursos = onSnapshot(
          collection(db, "Cursos"),
          (snapshot) => {
            const lista = snapshot.docs.map((documento) => ({
              id: documento.id,
              ...documento.data(),
            }));

            if (!cancelar) {
              setCursos(lista);
            }
          },
          (error) => {
            console.error("Error al cargar cursos:", error);
            setError("No se pudieron cargar los cursos.");
          }
        );

        // CARGAR ALUMNOS
        detenerAlumnos = onSnapshot(
          collection(db, "Alumnos"),
          (snapshot) => {
            const lista = snapshot.docs.map((documento) => ({
              id: documento.id,
              ...documento.data(),
            }));

            if (!cancelar) {
              setAlumnos(lista);
            }
          },
          (error) => {
            console.error("Error al cargar alumnos:", error);
            setError("No se pudieron cargar los alumnos.");
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
      detenerAuth();

      if (detenerUsuarios) detenerUsuarios();
      if (detenerCursos) detenerCursos();
      if (detenerAlumnos) detenerAlumnos();
    };
  }, [navigate]);

  // BUSCAR UN CURSO POR SU ID
  const obtenerCurso = (idCurso) => {
    return cursos.find((curso) => curso.id === idCurso);
  };

  // OBTENER LOS CURSOS ASIGNADOS A UN USUARIO
  const obtenerCursosUsuario = (usuario) => {
    if (usuario.rol === "preceptor") {
      return (usuario.cursosIds || [])
        .map((id) => obtenerCurso(id))
        .filter(Boolean);
    }

    if (usuario.rol === "tutor") {
      const hijosUsuario = alumnos.filter((alumno) =>
        (usuario.hijos || []).includes(alumno.id)
      );

      const idsCursos = [
        ...new Set(
          hijosUsuario
            .map((alumno) => alumno.cursoId)
            .filter(Boolean)
        ),
      ];

      return idsCursos
        .map((id) => obtenerCurso(id))
        .filter(Boolean);
    }

    return [];
  };

  // OBTENER LOS HIJOS DE UN TUTOR
  const obtenerHijosUsuario = (usuario) => {
    return alumnos.filter((alumno) =>
      (usuario.hijos || []).includes(alumno.id)
    );
  };

  // GUARDAR CAMBIOS DEL MODAL
  const guardarCambiosUsuario = async (datos) => {
    if (!usuarioSeleccionado) return;

    const referencia = doc(
      db,
      "usuarios",
      usuarioSeleccionado.id
    );

    await updateDoc(referencia, datos);

    setUsuarioSeleccionado(null);
  };

  // CERRAR SESIÓN
  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setError("No se pudo cerrar la sesión.");
    }
  };

  // CURSOS DISPONIBLES PARA FILTRAR
  const cursosDisponibles = useMemo(() => {
    return cursos
      .map((curso) => ({
        id: curso.id,
        nombre: `${curso.curso}° ${curso.division}`,
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [cursos]);

  // FILTRAR USUARIOS
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const texto = busqueda.toLowerCase();

      const coincideBusqueda =
        (usuario.nombre || "").toLowerCase().includes(texto) ||
        (usuario.usuario || "").toLowerCase().includes(texto) ||
        (usuario.correo || "").toLowerCase().includes(texto);

      let coincideSeccion = true;

      if (seccion === "preceptores") {
        coincideSeccion = usuario.rol === "preceptor";
      }

      if (seccion === "tutores") {
        coincideSeccion = usuario.rol === "tutor";
      }

      const cursosAsignados = obtenerCursosUsuario(usuario);

      const coincideCurso =
        filtroCurso === "" ||
        cursosAsignados.some((curso) => curso.id === filtroCurso);

      const coincideTurno =
        filtroTurno === "" ||
        cursosAsignados.some((curso) => curso.turno === filtroTurno);

      return (
        coincideBusqueda &&
        coincideSeccion &&
        coincideCurso &&
        coincideTurno
      );
    });
  }, [
    usuarios,
    alumnos,
    cursos,
    busqueda,
    filtroCurso,
    filtroTurno,
    seccion,
  ]);

  // CAMBIAR SECCIÓN
  const cambiarSeccion = (nuevaSeccion) => {
    setSeccion(nuevaSeccion);
    setBusqueda("");
    setFiltroCurso("");
    setFiltroTurno("");
  };

  // CONTADORES
  const totalUsuarios = usuarios.length;

  const totalPreceptores = usuarios.filter(
    (usuario) => usuario.rol === "preceptor"
  ).length;

  const totalTutores = usuarios.filter(
    (usuario) => usuario.rol === "tutor"
  ).length;

  // TÍTULO
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

        {/* ERRORES */}
        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {/* TARJETAS DEL INICIO */}
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
                <option key={curso.id} value={curso.id}>
                  {curso.nombre}
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
                    <th>Cursos / Hijos</th>
                    <th>Turnos</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>

                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => {
                      const cursosUsuario =
                        obtenerCursosUsuario(usuario);

                      const hijosUsuario =
                        obtenerHijosUsuario(usuario);

                      const turnos = [
                        ...new Set(
                          cursosUsuario
                            .map((curso) => curso.turno)
                            .filter(Boolean)
                        ),
                      ];

                      return (
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
                            {usuario.rol === "preceptor" ? (
                              cursosUsuario.length > 0
                                ? cursosUsuario.map((curso) => (
                                    <div key={curso.id}>
                                      {curso.curso}° {curso.division}
                                    </div>
                                  ))
                                : "Sin cursos"
                            ) : usuario.rol === "tutor" ? (
                              hijosUsuario.length > 0
                                ? hijosUsuario.map((hijo) => (
                                    <div key={hijo.id}>
                                      {hijo.nombre}
                                    </div>
                                  ))
                                : "Sin hijos"
                            ) : (
                              "—"
                            )}
                          </td>

                          <td>
                            {turnos.length > 0
                              ? turnos.join(", ")
                              : "—"}
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
                      );
                    })
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

      {/* MODAL DE EDICIÓN */}
      {usuarioSeleccionado && (
        <AdminModal
          usuario={usuarioSeleccionado}
          cursos={cursos}
          alumnos={alumnos}
          onCerrar={() => setUsuarioSeleccionado(null)}
          onGuardar={guardarCambiosUsuario}
        />
      )}

    </div>
  );
}

export default Administrador;
