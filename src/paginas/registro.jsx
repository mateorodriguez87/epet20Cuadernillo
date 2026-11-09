
// Importamos useState para guardar y actualizar los datos del formulario.
import { useState } from "react";

// Importamos Link para navegar entre páginas sin recargar el sitio.
import { Link } from "react-router-dom";

// Importamos las funciones de Firebase Authentication.
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

// Importamos las funciones de Firestore para guardar los datos.
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

// Importamos la conexión con Firebase.
import { auth, db } from "../firebase";

// Importamos los estilos de la página de registro.
import "../estilos/registro.css";

function Registro() {

  // Hook para guardar el nombre completo.
  const [nombre, setNombre] = useState("");

  // Hook para guardar el nombre de usuario.
  const [usuario, setUsuario] = useState("");

  // Hook para guardar el correo electrónico.
  const [correo, setCorreo] = useState("");

  // Hook para guardar la contraseña.
  const [contrasena, setContrasena] = useState("");

  // Hook para guardar la confirmación de contraseña.
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  // Guarda los mensajes de error que puedan aparecer.
  const [error, setError] = useState("");

  // Indica si el formulario está procesando el registro.
  const [cargando, setCargando] = useState(false);

  // Indica si el registro terminó correctamente.
  const [registroExitoso, setRegistroExitoso] = useState(false);

  // FUNCIÓN PARA REGISTRAR AL USUARIO.
  const handleSubmit = async (e) => {

    // Evita que el formulario recargue la página.
    e.preventDefault();

    // Limpiamos los errores anteriores.
    setError("");

    // Comprobamos que todos los campos estén completos.
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

    // Comprobamos que la contraseña tenga al menos 6 caracteres.
    if (contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // Comprobamos que ambas contraseñas coincidan.
    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {

      // Activamos el estado de carga.
      setCargando(true);

      // Creamos la cuenta en Firebase Authentication.
      const credencial = await createUserWithEmailAndPassword(
        auth,
        correo.trim(),
        contrasena
      );

      // Actualizamos el perfil de Firebase con el nombre completo.
      await updateProfile(credencial.user, {
        displayName: nombre.trim(),
      });

      // Creamos un documento en la colección "usuarios".
      // El ID del documento será el UID que Firebase asignó a la cuenta.
      await setDoc(
        doc(db, "usuarios", credencial.user.uid),
        {
          nombre: nombre.trim(),
          usuario: usuario.trim(),
          correo: correo.trim(),

          // El usuario queda pendiente hasta que el administrador
          // le asigne el rol de tutor o preceptor.
          rol: "pendiente",

          // Guardamos automáticamente la fecha de registro.
          fechaRegistro: serverTimestamp(),
        }
      );

      // Cerramos la sesión para impedir que entre a un panel
      // antes de que el administrador le asigne un rol.
      await signOut(auth);

      // Mostramos el mensaje de registro exitoso.
      setRegistroExitoso(true);

    } catch (error) {

      // Mostramos el error en la consola para facilitar su revisión.
      console.error("Error al registrar:", error);

      // Comprobamos qué error devolvió Firebase.
      if (error.code === "auth/email-already-in-use") {

        setError("Ese correo ya está registrado.");

      } else if (error.code === "auth/invalid-email") {

        setError("Ingresá un correo electrónico válido.");

      } else if (error.code === "auth/weak-password") {

        setError("La contraseña debe tener al menos 6 caracteres.");

      } else {

        setError(
          "No se pudo crear la cuenta. Error: " + error.message
        );
      }

    } finally {

      // finalizamos el estado de carga, haya salido bien o mal.
      setCargando(false);
    }
  };

  // SI EL REGISTRO FUE EXITOSO, MOSTRAMOS EL MENSAJE DE ESPERA.
  // De esta manera, no mostramos nuevamente el formulario.
  if (registroExitoso) {
    return (
      <div className="registro-page">

        <div className="registro-card registro-pendiente">

          {/* ÍCONO DE ESPERA */}
          <div className="registro-pendiente-icono">
            <span>⏳</span>
          </div>

          {/* TÍTULO DEL MENSAJE */}
          <h1>¡Registro exitoso!</h1>

          <h2>Cuenta pendiente de asignación</h2>

          {/* EXPLICACIÓN PARA EL NUEVO USUARIO */}
          <p>
            Tu cuenta fue creada correctamente, pero todavía no se
            te ha asignado un rol.
          </p>

          <p>
            Esperá a que el administrador revise tus datos y
            habilite tu acceso al sistema.
          </p>

          {/* AVISO SOBRE LA ACTIVACIÓN DE LA CUENTA */}
          <div className="registro-pendiente-aviso">
            Una vez asignado tu rol, podrás iniciar sesión normalmente.
          </div>

          {/* ENLACE PARA VOLVER AL LOGIN */}
          <Link
            to="/login"
            className="registro-boton registro-pendiente-boton"
          >
            Ir al inicio de sesión
          </Link>

        </div>

        {/* PIE DE PÁGINA */}
        <footer className="registro-footer">
          COPYRIGHT © 2026 EPET N° 20 - NEUQUÉN.
          TODOS LOS DERECHOS RESERVADOS.
        </footer>

      </div>
    );
  }

  // FORMULARIO PRINCIPAL DE REGISTRO.
  return (
    <div className="registro-page">

      <div className="registro-card">

        <h1>Crear cuenta</h1>

        <p className="registro-subtitulo">
          Registrate para comenzar
        </p>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>

          {/* CAMPO: NOMBRE COMPLETO */}
          <div className="registro-campo">

            <label htmlFor="nombre">
              Nombre completo
            </label>

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

          {/* CAMPO: NOMBRE DE USUARIO */}
          <div className="registro-campo">

            <label htmlFor="usuario-registro">
              Nombre de usuario
            </label>

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

          {/* CAMPO: CORREO ELECTRÓNICO */}
          <div className="registro-campo">

            <label htmlFor="correo">
              Correo electrónico
            </label>

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

          {/* CAMPO: CONTRASEÑA */}
          <div className="registro-campo">

            <label htmlFor="contrasena-registro">
              Contraseña
            </label>

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

          {/* CAMPO: CONFIRMAR CONTRASEÑA */}
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

          {/* MOSTRAR ERROR SI EXISTE */}
          {error && (
            <p className="registro-error" role="alert">
              {error}
            </p>
          )}

          {/* BOTÓN PARA ENVIAR EL FORMULARIO */}
          <button
            type="submit"
            className="registro-boton"
            disabled={cargando}
          >
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>

        </form>

        {/* SEPARADOR VISUAL */}
        <div className="registro-separador">
          <span></span>
          <p>o</p>
          <span></span>
        </div>

        {/* ENLACE PARA IR AL LOGIN */}
        <p className="registro-volver">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login">
            Inicia sesión aquí
          </Link>
        </p>

      </div>

      {/* PIE DE PÁGINA */}
      <footer className="registro-footer">
        COPYRIGHT © 2026 EPET N° 20 - NEUQUÉN.
        TODOS LOS DERECHOS RESERVADOS.
      </footer>

    </div>
  );
}

// exportamos el componente para utilizarlo en App.jsx.
export default Registro;
