// useState guarda lo que se escribe y los avisos de la pantalla
import { useState } from "react";
// Link arma enlaces a otras pantallas; useNavigate permite cambiar de pantalla desde el código
import { Link, useNavigate } from "react-router-dom";
// Funciones de Firebase Authentication: createUserWithEmailAndPassword crea la cuenta y updateProfile guarda el nombre en el perfil del usuario
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
// Funciones de Firestore: doc arma la referencia a un documento, setDoc lo guarda y serverTimestamp pone la fecha del servidor
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
// auth: la autenticación de Firebase / db: la base de datos
import { auth, db } from "../firebase";
// Estilos de esta pantalla
import "../estilos/registro.css";

// Pantalla para crear una cuenta (preceptor o tutor): valida los datos, crea el usuario en Firebase, guarda sus datos y lo lleva a su inicio
function Registro() {
  // Sirve para ir a otra pantalla desde el código (después de registrarse)
  const navigate = useNavigate();

  // Un estado por cada campo del formulario:
  // nombre, usuario, correo, contrasena, confirmarContrasena, rol y tratamiento
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [rol, setRol] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  // error: mensaje que se muestra si algo falla
  // cargando: true mientras se crea la cuenta, para bloquear el botón
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Se ejecuta al enviar el formulario (con el botón Crear cuenta o con la tecla Enter)
  const handleSubmit = async (e) => {
    // Evita que el navegador recargue la página al enviar el formulario
    e.preventDefault();
    setError("");

    // Validación 1: ningún campo puede quedar vacío (los textos se revisan sin espacios sobrantes)
    if (
      !nombre.trim() ||
      !usuario.trim() ||
      !correo.trim() ||
      !contrasena ||
      !confirmarContrasena ||
      !rol ||
      !tratamiento
    ) {
      setError("Completá todos los campos.");
      return;
    }

    // Validación 2: la contraseña tiene que tener al menos 6 caracteres (es lo mínimo que pide Firebase)
    if (contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Validación 3: las dos contraseñas tienen que ser iguales
    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      // Desde acá se bloquea el botón hasta terminar
      setCargando(true);

      // Paso 1: crea la cuenta en Firebase Authentication con el correo y la contraseña
      const credencial = await createUserWithEmailAndPassword(
        auth,
        correo.trim(),
        contrasena
      );

      // Paso 2: guarda el nombre completo en el perfil del usuario (por eso después se lo puede saludar por su nombre)
      await updateProfile(credencial.user, {
        displayName: nombre.trim(),
      });

      // Paso 3: guarda en la colección "usuarios" los datos extra (usuario, rol, tratamiento...). El id del documento es el uid del usuario
      await setDoc(doc(db, "usuarios", credencial.user.uid), {
        nombre: nombre.trim(),
        usuario: usuario.trim(),
        correo: correo.trim(),
        rol: rol,
        tratamiento: tratamiento,
        // La fecha de registro la pone el servidor de Firebase
        fechaRegistro: serverTimestamp(),
      });

      // Según el rol, lo lleva a su pantalla de inicio. El replace: true evita que el botón "Atrás" vuelva al registro
      if (rol === "preceptor") {
        navigate("/preceptor", { replace: true });
      } else {
        // Cualquier otro rol (el de padre, madre o tutor) va al inicio del tutor
        navigate("/iniciotutor", { replace: true });
      }
    } catch (error) {
      // Si Firebase rechaza alguno de los pasos, se elige el mensaje según el código del error
      // Correo que ya tiene una cuenta
      if (error.code === "auth/email-already-in-use") {
        setError("Ese correo ya está registrado.");
      } else if (error.code === "auth/invalid-email") {
        // El correo no tiene un formato válido
        setError("Ingresá un correo electrónico válido.");
      } else if (error.code === "auth/weak-password") {
        // La contraseña es demasiado débil
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        // Cualquier otro error: se muestra el mensaje técnico que devuelve Firebase (error.message)
        setError("No se pudo crear la cuenta. Error: " + error.message);
      }
    } finally {
      // Pase lo que pase, se desbloquea el botón
      setCargando(false);
    }
  };

  // Desde acá empieza lo que se dibuja en pantalla
  return (
    <div className="registro-page">
      {/* Tarjeta del centro con el formulario */}
      <div className="registro-card">
        <h1>Crear cuenta</h1>

        <p className="registro-subtitulo">
          Registrate para comenzar
        </p>

        {/* Al enviarlo se ejecuta handleSubmit */}
        <form onSubmit={handleSubmit}>
          {/* Nombre completo: también se guarda en el perfil de Firebase. El autoComplete le avisa al navegador qué datos puede sugerir o guardar */}
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

          {/* Nombre de usuario */}
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

          {/* Correo electrónico: es el que se usa para iniciar sesión */}
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

          {/* Tipo de cuenta: decide a qué pantalla va después de registrarse (preceptor o tutor). Los dos selects no llevan ícono */}
          <div className="registro-campo">
            <label htmlFor="rol">Tipo de cuenta</label>

            <div className="registro-input-container">
              <select
                id="rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
              >
                <option value="">Seleccioná tu rol</option>
                <option value="preceptor">Preceptor/a</option>
                <option value="tutor">Padre/Madre/Tutor</option>
              </select>
            </div>
          </div>

          {/* Tratamiento para el saludo ("Bienvenido" o "Bienvenida"): se guarda en la base de datos para usarlo en el saludo. Las pantallas de inicio todavía tienen ese texto fijo */}
          <div className="registro-campo">
            <label htmlFor="tratamiento">Tratamiento para el saludo</label>

            <div className="registro-input-container">
              <select
                id="tratamiento"
                value={tratamiento}
                onChange={(e) => setTratamiento(e.target.value)}
              >
                <option value="">Seleccioná una opción</option>
                <option value="Bienvenido">Bienvenido</option>
                <option value="Bienvenida">Bienvenida</option>
              </select>
            </div>
          </div>

          {/* Contraseña (type="password" oculta lo que se escribe) */}
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

          {/* Confirmar contraseña: tiene que coincidir con la anterior */}
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

          {/* Mensaje de error: solo aparece si hay uno */}
          {error && (
            <p className="registro-error" role="alert">
              {error}
            </p>
          )}

          {/* Botón "Crear cuenta": queda deshabilitado y cambia su texto mientras se crea la cuenta */}
          <button
            type="submit"
            className="registro-boton"
            disabled={cargando}
          >
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        {/* Línea con una "o" en el medio */}
        <div className="registro-separador">
          <span></span>
          <p>o</p>
          <span></span>
        </div>

        {/* Link a /login para quien ya tiene cuenta */}
        <p className="registro-volver">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>

      {/* Pie de la pantalla */}
      <footer className="registro-footer">
        COPYRIGHT © 2026 EPET N° 20 - NEUQUÉN.
        TODOS LOS DERECHOS RESERVADOS.
      </footer>
    </div>
  );
}

export default Registro;