import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import "../estilos/registro.css";

function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !nombre.trim() ||
      !usuario.trim() ||
      !correo.trim() ||
      !contrasena ||
      !confirmarContrasena
    ) {
      setError("Completá todos los campos.");
      return;
    }

    if (contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);

      const credencial = await createUserWithEmailAndPassword(
        auth,
        correo.trim(),
        contrasena
      );

      await updateProfile(credencial.user, {
        displayName: nombre.trim(),
      });

      navigate("/preceptor", { replace: true });
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Ese correo ya está registrado.");
      } else if (error.code === "auth/invalid-email") {
        setError("Ingresá un correo electrónico válido.");
      } else if (error.code === "auth/weak-password") {
        setError("La contraseña es demasiado débil.");
      } else {
        setError("No se pudo crear la cuenta. Revisá la configuración de Firebase.");
        console.error(error);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro-page">
      <div className="registro-card">
        <h1>Crear cuenta</h1>

        <p className="registro-subtitulo">
          Registrate para comenzar
        </p>

        <form onSubmit={handleSubmit}>
          <div className="registro-campo">
            <label htmlFor="nombre">Nombre completo</label>

            <div className="registro-input-container">
              <span className="registro-icon">♙</span>
              <input
                type="text"
                id="nombre"
                placeholder="Ingresa tu nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="registro-campo">
            <label htmlFor="usuario-registro">Nombre de usuario</label>

            <div className="registro-input-container">
              <span className="registro-icon">♙</span>
              <input
                type="text"
                id="usuario-registro"
                placeholder="Elige un usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="registro-campo">
            <label htmlFor="correo">Correo electrónico</label>

            <div className="registro-input-container">
              <span className="registro-icon">✉</span>
              <input
                type="email"
                id="correo"
                placeholder="Ingresa tu correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="registro-campo">
            <label htmlFor="contrasena-registro">Contraseña</label>

            <div className="registro-input-container">
              <span className="registro-icon">♙</span>
              <input
                type="password"
                id="contrasena-registro"
                placeholder="Crea una contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="registro-campo">
            <label htmlFor="confirmar-contrasena">
              Confirmar contraseña
            </label>

            <div className="registro-input-container">
              <span className="registro-icon">♙</span>
              <input
                type="password"
                id="confirmar-contrasena"
                placeholder="Repite tu contraseña"
                value={confirmarContrasena}
                onChange={(e) =>
                  setConfirmarContrasena(e.target.value)
                }
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && (
            <p className="registro-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="registro-boton"
            disabled={cargando}
          >
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="registro-separador">
          <span></span>
          <p>o</p>
          <span></span>
        </div>

        <p className="registro-volver">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>

      <footer className="registro-footer">
        COPYRIGHT © 2026 EPET N° 20 - NEUQUÉN.
        TODOS LOS DERECHOS RESERVADOS.
      </footer>
    </div>
  );
}

export default Registro;