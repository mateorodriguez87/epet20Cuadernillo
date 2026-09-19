import "./App.css";

function App() {
  return (
    <div className="pagina">

      {/* Barra superior */}
      <header className="header">
        <div className="header-izquierda">
          <div className="icono-laptop">
            💻
          </div>

          <div className="titulo-header">
            <h1>ESCUELA TÉCNICA</h1>
            <p>CUADERNO DE COMUNICACIONES DIGITAL</p>
          </div>
        </div>

        <div className="ayuda">
          <span className="signo">?</span>
          <span>AYUDA</span>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="contenido">

        <div className="tarjeta">

          <div className="texto">
            <h2>
              E.P.E.T<br />
              N°20
            </h2>

            <p>
              CLICK PARA<br />
              CONTINUAR
            </p>
          </div>

          <div className="escudo">
            <img src="/escudo-epet20.png" alt="Escudo E.P.E.T N°20" />
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

export default App;