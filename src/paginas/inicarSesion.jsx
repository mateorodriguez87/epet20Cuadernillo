
// useState guarda los datos y avisos de la pantalla
import { useState } from "react";

// Link arma enlaces y useNavigate permite cambiar de pantalla
import { Link, useNavigate } from "react-router-dom";

// Firebase Authentication
import { signInWithEmailAndPassword } from "firebase/auth";

// Firestore permite consultar el rol del usuario
import { doc, getDoc } from "firebase/firestore";

// Conexión con Firebase
import { auth, db } from "../firebase";

// Estilos
import "../estilos/iniciarSesion.css";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!usuario.trim() || !contrasena) {
      setError("Completá el correo y la contraseña.");
      return;
    }

    try {
      setCargando(true);

      // Iniciar sesión con Firebase Authentication
      const credencial = await signInWithEmailAndPassword(
        auth,
        usuario.trim(),
        contrasena
      );

      // Obtener el UID del usuario autenticado
      const uid = credencial.user.uid;

      // Buscar los datos del usuario en Firestore
      const usuarioRef = doc(db, "usuarios", uid);
      const usuarioDoc = await getDoc(usuarioRef);

      if (!usuarioDoc.exists()) {
        setError("No se encontraron los datos de tu cuenta.");
        await auth.signOut();
        return;
      }

      // Obtener el rol asignado por el administrador
      const datosUsuario = usuarioDoc.data();
      const rol = datosUsuario.rol;

      // Redirigir según el rol
      if (rol === "administrador") {
        navigate("/administrador", { replace: true });

      } else if (rol === "preceptor") {
        navigate("/preceptor", { replace: true });

      } else if (rol === "tutor") {
        navigate("/iniciotutor", { replace: true });

      } else {
        setError("Tu cuenta no tiene un rol válido.");
        await auth.signOut();
      }

    } catch (error) {

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("El correo o la contraseña son incorrectos.");

      } else if (error.code === "auth/invalid-email") {
        setError("Ingresá un correo electrónico válido.");

      } else {
        setError("No se pudo iniciar sesión. Intentá nuevamente.");
        console.error("Error de inicio de sesión:", error);
      }

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>Bienvenido</h1>

        <p className="subtitulo">
          Inicia sesión para continuar
        </p>

        <form onSubmit={handleSubmit}>

          <div className="campo">
            <label htmlFor="usuario">Correo electrónico</label>

            <div className="input-container">
              <span className="icon">♙</span>

              <input
                type="email"
                id="usuario"
                placeholder="Ingresa tu correo"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="campo">
            <label htmlFor="contrasena">Contraseña</label>

            <div className="input-container">
              <span className="icon">♙</span>

              <input
                type="password"
                id="contrasena"
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && <p role="alert">{error}</p>}

          <button
            type="submit"
            className="btn-ingresar"
            disabled={cargando}
          >
            <span>♙</span>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        <div className="separador">
          <span></span>
          <p>o</p>
          <span></span>
        </div>

        <Link to="/login" className="recuperar">
          ♧ ¿Olvidaste tu contraseña?
        </Link>

        <p className="registro">
          ¿No tienes una cuenta?{" "}
          <Link to="/registro">Regístrate aquí</Link>
        </p>

      </div>

      <footer>
        COPYRIGHT © 2026 EPET N° 20 - NEUQUÉN.
        TODOS LOS DERECHOS RESERVADOS.
      </footer>

    </div>
  );
}

export default Login;
