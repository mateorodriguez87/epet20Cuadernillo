
// useState guarda los datos y mensajes de la pantalla.
import { useState } from "react";

// Link permite navegar entre páginas y useNavigate cambiar de pantalla.
import { Link, useNavigate } from "react-router-dom";

// Firebase Authentication permite iniciar y cerrar sesiones.
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// Firestore permite consultar los datos y el rol del usuario.
import { doc, getDoc } from "firebase/firestore";

// Conexión con Firebase.
import { auth, db } from "../firebase";
// Icono proveniente de la Biblioteca Lucide-React
import { AtSign, UserLock, KeyRound  } from 'lucide-react';
// Estilos de la pantalla de inicio de sesión.
import "../estilos/iniciarSesion.css";

function Login() {
  // Guarda el correo electrónico ingresado.
  const [usuario, setUsuario] = useState("");

  // Guarda la contraseña ingresada.
  const [contrasena, setContrasena] = useState("");

  // Guarda los mensajes de error.
  const [error, setError] = useState("");

  // Indica si se está procesando el inicio de sesión.
  const [cargando, setCargando] = useState(false);

  // Permite redirigir al usuario a otra página.
  const navigate = useNavigate();

  // FUNCIÓN PARA INICIAR SESIÓN.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiamos los mensajes anteriores.
    setError("");

    // Comprobamos que los campos estén completos.
    if (!usuario.trim() || !contrasena) {
      setError("Completá el correo y la contraseña.");
      return;
    }

    setCargando(true);

    let credencial;

    // PRIMERA PARTE: COMPROBAR LAS CREDENCIALES.
    try {
      credencial = await signInWithEmailAndPassword(
        auth,
        usuario.trim(),
        contrasena
      );

    } catch (error) {
      console.error("Error de Firebase Authentication:", error);

      // Correo o contraseña incorrectos.
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("El correo o la contraseña son incorrectos.");

      } else if (error.code === "auth/invalid-email") {
        setError("Ingresá un correo electrónico válido.");

      } else if (error.code === "auth/user-disabled") {
        setError("Esta cuenta se encuentra deshabilitada.");

      } else if (error.code === "auth/too-many-requests") {
        setError("Demasiados intentos. Intentá nuevamente más tarde.");

      } else {
        setError("No se pudo iniciar sesión. Revisá tu conexión.");
      }

      setCargando(false);
      return;
    }

    // SEGUNDA PARTE: CONSULTAR EL ROL EN FIRESTORE.
    try {
      // Obtenemos el identificador único de Firebase.
      const uid = credencial.user.uid;

      // Buscamos el documento del usuario en la colección usuarios.
      const usuarioRef = doc(db, "usuarios", uid);
      const usuarioDoc = await getDoc(usuarioRef);

      // Comprobamos que exista el documento.
      if (!usuarioDoc.exists()) {
        await signOut(auth);

        setError(
          "No se encontraron los datos de tu cuenta. Contactá al administrador."
        );

        return;
      }

      // Obtenemos la información guardada en Firestore.
      const datosUsuario = usuarioDoc.data();

      // Obtenemos el rol asignado.
      const rol = datosUsuario.rol;

      // CUENTA PENDIENTE.
      // Si todavía no tiene un rol asignado, cerramos la sesión
      // y mostramos un mensaje de espera.
      if (rol === "pendiente") {
        await signOut(auth);

        setError(
          "Tu cuenta todavía no tiene un rol asignado. Esperá a que el administrador habilite tu acceso."
        );

        return;
      }

      // ADMINISTRADOR.
      if (rol === "administrador") {
        navigate("/administrador", { replace: true });
        return;
      }

      // PRECEPTOR.
      if (rol === "preceptor") {
        navigate("/preceptor", { replace: true });
        return;
      }

      // TUTOR.
      if (rol === "tutor") {
        navigate("/iniciotutor", { replace: true });
        return;
      }

      // SI EL ROL NO ES RECONOCIDO, CERRAMOS LA SESIÓN.
      await signOut(auth);

      setError(
        "Tu cuenta no tiene un rol válido. Contactá al administrador."
      );

    } catch (error) {
      console.error("Error al consultar los datos del usuario:", error);

      // Cerramos la sesión si no se pudieron verificar los datos.
      try {
        await signOut(auth);
      } catch (errorCerrar) {
        console.error("Error al cerrar sesión:", errorCerrar);
      }

      setError(
        "No se pudieron consultar tus datos. Intentá nuevamente."
      );

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

        {/* FORMULARIO DE INICIO DE SESIÓN */}
        <form onSubmit={handleSubmit}>

          {/* CORREO ELECTRÓNICO */}
          <div className="campo">

            <label htmlFor="usuario">
              Correo electrónico
            </label>

            <div className="input-container">

              <span className="icon">
                <AtSign size={15}/>
              </span>

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

          {/* CONTRASEÑA */}
          <div className="campo">

            <label htmlFor="contrasena">
              Contraseña
            </label>

            <div className="input-container">

              <span className="icon">
                <UserLock size={15}/>
              </span>

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

          {/* MENSAJE DE ERROR */}
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          {/* BOTÓN PARA INGRESAR */}
          <button
            type="submit"
            className="btn-ingresar"
            disabled={cargando}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        {/* SEPARADOR */}
        <div className="separador">
          <span></span>
          <p>o</p>
          <span></span>
        </div>

        {/* RECUPERAR CONTRASEÑA */}
        <Link to="/login" className="recuperar">
          <KeyRound size={15} />
           ¿Olvidaste tu contraseña?
        </Link>

        {/* IR AL REGISTRO */}
        <p className="registro">
          ¿No tienes una cuenta?{" "}
          <Link to="/registro">
            Regístrate aquí
          </Link>
        </p>

      </div>

      {/* PIE DE PÁGINA */}
      <footer>
        COPYRIGHT © 2026 EPET N° 20 - NEUQUÉN.
        TODOS LOS DERECHOS RESERVADOS.
      </footer>

    </div>
  );
}

export default Login;
