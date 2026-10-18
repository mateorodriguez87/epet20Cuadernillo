
import { useState } from "react";
import "../estilos/iniciarSesion.css";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      usuario,
      contrasena,
    });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Bienvenido</h1>

        <p className="subtitulo">
          Inicia sesión para continuar
        </p>

        <form onSubmit={handleSubmit}>
          {/* Usuario */}
          <div className="campo">
            <label htmlFor="usuario">Usuario</label>

            <div className="input-container">
              <span className="icon">♙</span>

              <input
                type="text"
                id="usuario"
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>
          </div>

          {/* Contraseña */}
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
              />
            </div>
          </div>

          {/* Botón */}
          <button type="submit" className="btn-ingresar">
            <span>♙</span>
            Ingresar
          </button>
        </form>

        {/* Separador */}
        <div className="separador">
          <span></span>
          <p>o</p>
          <span></span>
        </div>

        {/* Recuperar contraseña */}
        <a href="#" className="recuperar">
          ♧ ¿Olvidaste tu contraseña?
        </a>

        {/* Registro */}
        <p className="registro">
          ¿No tienes una cuenta?{" "}
          <a href="/registro">Regístrate aquí</a>
        </p>
      </div>

      {/* Footer */}
      <footer>
        COPYRIGHT © 2026 EPET N° 20 - NEUQUÉN. TODOS LOS DERECHOS RESERVADOS.
      </footer>
    </div>
  );
}

export default Login;
