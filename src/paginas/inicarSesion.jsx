// useState guarda lo que se escribe y los avisos de la pantalla
import { useState } from "react";
// Link arma enlaces a otras pantallas; useNavigate permite cambiar de pantalla desde el código
import { Link, useNavigate } from "react-router-dom";
// Función de Firebase Authentication que inicia sesión con correo y contraseña
import { signInWithEmailAndPassword } from "firebase/auth";
// Conexión al servicio de autenticación de Firebase
import { auth } from "../firebase";
// Estilos de esta pantalla
import "../estilos/iniciarSesion.css";

// Pantalla de inicio de sesión: valida los datos, inicia sesión con Firebase y lleva al inicio del preceptor
function Login() {
  // usuario y contrasena: lo que se escribe en los campos
  // error: mensaje que se muestra si algo falla
  // cargando: true mientras se inicia sesión, para bloquear el botón
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Sirve para ir a otra pantalla desde el código (después de iniciar sesión)
  const navigate = useNavigate();

  // Se ejecuta al enviar el formulario (con el botón Ingresar o con la tecla Enter)
  const handleSubmit = async (e) => {
    // Evita que el navegador recargue la página al enviar el formulario
    e.preventDefault();
    setError("");

    // Validación: hacen falta el correo (sin espacios sobrantes) y la contraseña
    if (!usuario.trim() || !contrasena) {
      setError("Completá el correo y la contraseña.");
      return;
    }

    try {
      // Desde acá se bloquea el botón hasta terminar
      setCargando(true);

      // Le pide a Firebase que inicie sesión con ese correo y esa contraseña
      await signInWithEmailAndPassword(
        auth,
        usuario.trim(),
        contrasena
      );

      // Si salió bien, va al inicio del preceptor (por ahora siempre a /preceptor, sin distinguir el tipo de usuario)
      // El replace: true evita que el botón "Atrás" vuelva al login
      navigate("/preceptor", { replace: true });
    } catch (error) {
      // Si Firebase rechaza el inicio de sesión, se elige el mensaje según el código del error
      // Estos tres códigos significan lo mismo para quien usa la pantalla: correo o contraseña incorrectos
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("El correo o la contraseña son incorrectos.");
      } else if (error.code === "auth/invalid-email") {
        // El correo no tiene un formato válido
        setError("Ingresá un correo electrónico válido.");
      } else {
        // Cualquier otro error: mensaje general; el código se muestra en la consola para poder revisarlo
        setError("No se pudo iniciar sesión. Intentá nuevamente.");
        console.error("Error de inicio de sesión:", error.code);
      }
    } finally {
      // Pase lo que pase, se desbloquea el botón
      setCargando(false);
    }
  };

  // Desde acá empieza lo que se dibuja en pantalla
  return (
    <div className="login-page">
      {/* Tarjeta del centro con el formulario */}
      <div className="login-card">
        <h1>Bienvenido</h1>

        <p className="subtitulo">
          Inicia sesión para continuar
        </p>

        {/* Al enviarlo se ejecuta handleSubmit */}
        <form onSubmit={handleSubmit}>
          {/* Campo de correo: el ícono va dentro del mismo contenedor que el input. El autoComplete le avisa al navegador qué datos puede sugerir o guardar */}
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

          {/* Campo de contraseña (type="password" oculta lo que se escribe) */}
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

          {/* Mensaje de error: solo aparece si hay uno */}
          {error && <p role="alert">{error}</p>}

          {/* Botón "Ingresar": queda deshabilitado y cambia su texto mientras se inicia sesión */}
          <button
            type="submit"
            className="btn-ingresar"
            disabled={cargando}
          >
            <span>♙</span>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* Línea con una "o" en el medio */}
        <div className="separador">
          <span></span>
          <p>o</p>
          <span></span>
        </div>

        {/* "¿Olvidaste tu contraseña?": por ahora lleva a /login (esta misma pantalla), todavía no recupera nada */}
        <Link to="/login" className="recuperar">
          ♧ ¿Olvidaste tu contraseña?
        </Link>

        {/* Link a /registro para crear una cuenta */}
        <p className="registro">
          ¿No tienes una cuenta?{" "}
          <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>

      {/* Pie de la pantalla (no tiene clase: se estiliza por la etiqueta) */}
      <footer>
        COPYRIGHT © 2026 EPET N° 20 - NEUQUÉN. TODOS LOS DERECHOS RESERVADOS.
      </footer>
    </div>
  );
}

export default Login;