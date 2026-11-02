// Link permite ir a otra pantalla sin recargar la página
import { Link } from 'react-router-dom';
// Estilos de esta pantalla
import "../estilos/bienvenida.css";

// Pantalla de bienvenida: es la primera que se ve y desde acá se pasa al login
function Bienvenida() {
  // Todo lo que se dibuja en pantalla. Es una pantalla fija: no tiene estados ni datos
  return (
    <div className="pagina">

      {/* Barra superior */}
      <header className="header">
        {/* Lado izquierdo del header: ícono y nombre de la escuela */}
        <div className="header-izquierda">
          {/* Ícono de la compu: es un emoji, no una imagen */}
          <div className="icono-laptop">
            💻
          </div>

          {/* Nombre de la escuela y del sistema */}
          <div className="titulo-header">
            <h1>ESCUELA TÉCNICA</h1>
            <p>CUADERNO DE COMUNICACIONES DIGITAL</p>
          </div>
        </div>

        {/* "AYUDA" a la derecha del header (por ahora es solo visual, no hace nada al tocarlo) */}
        <div className="ayuda">
          <span className="signo">?</span>
          <span>AYUDA</span>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="contenido">

        {/* Tarjeta del centro: texto a la izquierda y escudo a la derecha */}
        <div className="tarjeta">

          <div className="texto">
            {/* Nombre de la escuela en dos líneas (el <br /> corta la línea) */}
            <h2>
              E.P.E.T<br />
              N°20
            </h2>

            {/* Link que lleva a /login, la pantalla de inicio de sesión */}
            <p>
              <Link to="/login">CLICK PARA CONTINUAR</Link>
            </p>
          </div>

          {/* Escudo de la escuela */}
          <div className="escudo">
            {/* La ruta de la imagen está escrita a mano.*/}
            <img src="src/imagenes/epet20logo.webp" alt="Escudo E.P.E.T N°20" />
          </div>

        </div>

      </main>

      {/* Pie de página */}
      <footer>
        COPYRIGHT © 2026 EPET N° 20 - NEUQUÉN. TODOS LOS DERECHOS RESERVADOS.
      </footer>

    </div>
  );
}

export default Bienvenida;