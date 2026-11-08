
import { useEffect, useState } from "react";
import {
  X,
  UserRound,
  Mail,
  ShieldCheck,
} from "lucide-react";

import "../estilos/adminmodal.css";

function AdminModal({ usuario, onCerrar, onGuardar }) {
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("tutor");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // cargar los datos del usuario seleccionado
  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setRol(usuario.rol || "tutor");
      setError("");
    }
  }, [usuario]);

  // guardar los cambios
  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const datosActualizados = {
        nombre: nombre.trim(),
      };

      // no permitir modificar el rol de un administrador
      if (usuario.rol !== "administrador") {
        datosActualizados.rol = rol;
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
    <div className="admin-modal-overlay" onClick={onCerrar}>
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ENCABEZADO */}
        <div className="admin-modal-header">
          <div>
            <h2>Editar usuario</h2>
            <p>Modificá los datos del usuario seleccionado.</p>
          </div>

          <button
            type="button"
            className="admin-modal-cerrar"
            onClick={onCerrar}
          >
            <X size={22} />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={manejarEnvio}>

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
