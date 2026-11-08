
import { useEffect, useState } from "react";

import {
  X,
  UserRound,
  Mail,
  ShieldCheck,
  Search,
  BookOpen,
  Users,
  Clock,
  Check,
} from "lucide-react";

import "../estilos/adminmodal.css";

function AdminModal({
  usuario,
  cursos = [],
  alumnos = [],
  onCerrar,
  onGuardar,
}) {
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("tutor");

  const [cursosSeleccionados, setCursosSeleccionados] = useState([]);
  const [hijosSeleccionados, setHijosSeleccionados] = useState([]);

  const [busquedaAlumno, setBusquedaAlumno] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Cargar los datos del usuario seleccionado
  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setRol(usuario.rol || "tutor");

      setCursosSeleccionados(usuario.cursosIds || []);
      setHijosSeleccionados(usuario.hijos || []);

      setBusquedaAlumno("");
      setError("");
    }
  }, [usuario]);

  // Seleccionar o quitar un curso
  const cambiarCurso = (idCurso) => {
    setCursosSeleccionados((actuales) =>
      actuales.includes(idCurso)
        ? actuales.filter((id) => id !== idCurso)
        : [...actuales, idCurso]
    );
  };

  // Seleccionar o quitar un hijo
  const cambiarHijo = (idAlumno) => {
    setHijosSeleccionados((actuales) =>
      actuales.includes(idAlumno)
        ? actuales.filter((id) => id !== idAlumno)
        : [...actuales, idAlumno]
    );
  };

  // Buscar alumnos por nombre o DNI
  const alumnosFiltrados = alumnos.filter((alumno) => {
    const texto = busquedaAlumno.toLowerCase();

    return (
      (alumno.nombre || "").toLowerCase().includes(texto) ||
      (alumno.dni || "").toLowerCase().includes(texto)
    );
  });

  // Guardar los cambios
  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    if (rol === "preceptor" && cursosSeleccionados.length === 0) {
      setError("Seleccioná al menos un curso para el preceptor.");
      return;
    }

    if (rol === "tutor" && hijosSeleccionados.length === 0) {
      setError("Seleccioná al menos un hijo para el tutor.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const datosActualizados = {
        nombre: nombre.trim(),
        rol,
      };

      if (rol === "preceptor") {
        datosActualizados.cursosIds = cursosSeleccionados;
        datosActualizados.hijos = [];
      }

      if (rol === "tutor") {
        datosActualizados.hijos = hijosSeleccionados;
        datosActualizados.cursosIds = [];
      }

      await onGuardar(datosActualizados);
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      setError("No se pudieron guardar los cambios.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="admin-modal-overlay"
      onClick={onCerrar}
    >
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ENCABEZADO */}
        <div className="admin-modal-header">
          <div>
            <h2>Editar usuario</h2>
            <p>Modificá los datos y las asignaciones del usuario.</p>
          </div>

          <button
            type="button"
            className="admin-modal-cerrar"
            onClick={onCerrar}
            disabled={cargando}
          >
            <X size={22} />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={manejarEnvio}>

          {/* NOMBRE */}
          <div className="admin-modal-campo">
            <label>
              <UserRound size={17} />
              Nombre completo
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingresá el nombre completo"
              disabled={cargando}
            />
          </div>

          {/* CORREO */}
          <div className="admin-modal-campo">
            <label>
              <Mail size={17} />
              Correo electrónico
            </label>

            <input
              type="email"
              value={usuario.correo || ""}
              disabled
            />
          </div>

          {/* ROL */}
          <div className="admin-modal-campo">
            <label>
              <ShieldCheck size={17} />
              Rol del usuario
            </label>

            {usuario.rol === "administrador" ? (
              <input
                type="text"
                value="Administrador"
                disabled
              />
            ) : (
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                disabled={cargando}
              >
                <option value="tutor">Tutor</option>
                <option value="preceptor">Preceptor</option>
              </select>
            )}
          </div>

          {/* ASIGNACIONES PARA PRECEPTORES */}
          {rol === "preceptor" && (
            <div className="admin-modal-asignaciones">

              <div className="admin-modal-subtitulo">
                <BookOpen size={19} />
                <div>
                  <h3>Cursos asignados</h3>
                  <p>Podés seleccionar varios cursos.</p>
                </div>
              </div>

              <div className="admin-modal-lista">

                {cursos.length > 0 ? (
                  cursos.map((curso) => {
                    const seleccionado =
                      cursosSeleccionados.includes(curso.id);

                    return (
                      <label
                        key={curso.id}
                        className={`admin-modal-opcion ${
                          seleccionado ? "seleccionado" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => cambiarCurso(curso.id)}
                          disabled={cargando}
                        />

                        <span className="admin-modal-check">
                          {seleccionado && <Check size={15} />}
                        </span>

                        <span className="admin-modal-opcion-info">
                          <strong>
                            {curso.curso}° {curso.division}
                          </strong>

                          <small>
                            <Clock size={13} />
                            {curso.turno || "Sin turno asignado"}
                          </small>
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <p className="admin-modal-vacio">
                    No hay cursos disponibles.
                  </p>
                )}

              </div>

              <p className="admin-modal-contador">
                {cursosSeleccionados.length} curso(s) seleccionado(s)
              </p>

            </div>
          )}

          {/* ASIGNACIONES PARA TUTORES */}
          {rol === "tutor" && (
            <div className="admin-modal-asignaciones">

              <div className="admin-modal-subtitulo">
                <Users size={19} />
                <div>
                  <h3>Hijos asignados</h3>
                  <p>Buscá y seleccioná los hijos del tutor.</p>
                </div>
              </div>

              {/* BUSCADOR */}
              <div className="admin-modal-busqueda">
                <Search size={17} />

                <input
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  value={busquedaAlumno}
                  onChange={(e) => setBusquedaAlumno(e.target.value)}
                  disabled={cargando}
                />
              </div>

              {/* LISTA DE ALUMNOS */}
              <div className="admin-modal-lista">

                {alumnosFiltrados.length > 0 ? (
                  alumnosFiltrados.map((alumno) => {
                    const seleccionado =
                      hijosSeleccionados.includes(alumno.id);

                    return (
                      <label
                        key={alumno.id}
                        className={`admin-modal-opcion ${
                          seleccionado ? "seleccionado" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => cambiarHijo(alumno.id)}
                          disabled={cargando}
                        />

                        <span className="admin-modal-check">
                          {seleccionado && <Check size={15} />}
                        </span>

                        <span className="admin-modal-opcion-info">
                          <strong>{alumno.nombre}</strong>

                          <small>
                            DNI: {alumno.dni || "Sin DNI"} ·
                            Curso: {alumno.curso || "Sin curso"}
                          </small>
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <p className="admin-modal-vacio">
                    No se encontraron alumnos.
                  </p>
                )}

              </div>

              <p className="admin-modal-contador">
                {hijosSeleccionados.length} hijo(s) seleccionado(s)
              </p>

            </div>
          )}

          {/* ERROR */}
          {error && (
            <p className="admin-modal-error">
              {error}
            </p>
          )}

          {/* BOTONES */}
          <div className="admin-modal-acciones">

            <button
              type="button"
              className="admin-modal-cancelar"
              onClick={onCerrar}
              disabled={cargando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="admin-modal-guardar"
              disabled={cargando}
            >
              {cargando ? "Guardando..." : "Guardar cambios"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default AdminModal;
