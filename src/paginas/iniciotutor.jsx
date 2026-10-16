import { useState } from "react";
import "../estilos/iniciotutor.css";

function InicioTutor() {

  const datos = {
    nombre: "",
    fecha: "",
    alumno: {
      nombre: "",
      curso: "",
      legajo: "",
      preceptor: "",
      foto: ""
    },
    notificaciones: []
  };

  /* Estilo visual de cada tipo de notificación */
  const tipos = {
    inasistencia: { icono: "!", color: "rojo" },
    conducta: { icono: "▤", color: "naranja" },
    nota: { icono: "✎", color: "azul" },
    aviso: { icono: "♧", color: "verde" }
  };

  const sinLeer = datos.notificaciones.filter((n) => !n.leida).length;
  const ultimas = datos.notificaciones.slice(0, 4);

  const iniciales = (nombre = "") =>
    nombre.split(" ").filter(Boolean).map((p) => p[0]).join("").slice(0, 2);

  return (
    <div className="panel">

      {/* =========================
          BARRA LATERAL
      ========================= */}

      <aside className="sidebar">

        <div className="logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        <nav className="menu">

          <a href="#" className="menu-item activo">
            <span className="menu-icon">⌂</span>
            <span>Inicio</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">♧</span>
            <span>Notificaciones recibidas</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">▤</span>
            <span>Datos del alumno</span>
          </a>

        </nav>

        <a href="#" className="cerrar-sesion">
          <span className="logout-icon">⇥</span>
          <span>Cerrar Sesion</span>
        </a>

      </aside>


      {/* =========================
          CONTENIDO
      ========================= */}

      <main className="contenido">

        {/* ENCABEZADO */}

        <header className="encabezado">

          <h1>
            Bienvenida{datos.nombre ? `, ${datos.nombre}` : ""}
          </h1>

          <p>
            {datos.fecha || ""}
          </p>

        </header>


        {/* =========================
            TARJETA DEL ALUMNO
        ========================= */}

        <section className="tarjeta-alumno">

          <div className="alumno-info">

            <div className="foto-alumno">
              {datos.alumno.foto
                ? <img src={datos.alumno.foto} alt={datos.alumno.nombre} />
                : iniciales(datos.alumno.nombre)}
            </div>

            <div className="alumno-datos">
              <span>Alumno</span>
              <strong>{datos.alumno.nombre || "—"}</strong>
              <p>{datos.alumno.curso}</p>
              <p>
                Legajo: {datos.alumno.legajo || "—"}
              </p>
            </div>

          </div>


          <div className="tarjeta sin-leer">

            <div className="icono-card rojo">
              ♧
            </div>

            <div className="info-card">
              <span>Notificaciones sin leer</span>

              <strong className="numero-rojo">
                {datos.notificaciones.length > 0 ? sinLeer : "—"}
              </strong>

              <a href="#">
                ver todas
                <span> ›</span>
              </a>
            </div>

          </div>

        </section>


        {/* =========================
            ZONA CENTRAL
        ========================= */}

        <section className="zona-central">


          {/* ÚLTIMAS NOTIFICACIONES */}

          <div className="tarjeta notificaciones">

            <div className="titulo-seccion">
              <h2>Últimas notificaciones</h2>

              <a href="#">
                Ver todas
              </a>
            </div>


            {ultimas.length === 0 ? (

              <div className="sin-datos">
                No hay notificaciones
              </div>

            ) : (

              ultimas.map((notificacion, index) => {

                const tipo = tipos[notificacion.tipo] || tipos.aviso;

                return (

                  <div className="notificacion" key={notificacion.id || index}>

                    <div className={`notificacion-icon ${tipo.color}`}>
                      {tipo.icono}
                    </div>

                    <div className="notificacion-texto">
                      <strong>
                        {notificacion.titulo}
                      </strong>

                      <span>
                        {notificacion.descripcion}
                      </span>
                    </div>

                    <div className="notificacion-fecha">
                      {notificacion.fecha}
                    </div>

                    <span className="punto">
                      {!notificacion.leida && <i></i>}
                    </span>

                    <span className="flecha">
                      {!notificacion.leida ? "›" : ""}
                    </span>

                  </div>

                );

              })

            )}

            <a
              href="#"
              className="ver-notificaciones"
            >
              Ver todas las notificaciones
            </a>

          </div>


          {/* DATOS DEL ALUMNO */}

          <div className="tarjeta datos-alumno">

            <div className="titulo-seccion">
              <h2>Datos del alumno</h2>
            </div>


            <div className="dato">

              <div className="icono-card azul">
                ♙
              </div>

              <div>
                <span>Nombre completo</span>
                <strong>{datos.alumno.nombre || "—"}</strong>
              </div>

            </div>


            <div className="dato">

              <div className="icono-card azul">
                🎓
              </div>

              <div>
                <span>Curso</span>
                <strong>{datos.alumno.curso || "—"}</strong>
              </div>

            </div>


            <div className="dato">

              <div className="icono-card azul">
                ▤
              </div>

              <div>
                <span>Legajo</span>
                <strong>{datos.alumno.legajo || "—"}</strong>
              </div>

            </div>


            <div className="dato">

              <div className="icono-card azul">
                ♙
              </div>

              <div>
                <span>Preceptor</span>
                <strong>{datos.alumno.preceptor || "—"}</strong>
              </div>

            </div>


            <a
              href="#"
              className="ver-mas"
            >
              Ver más información
              <span>›</span>
            </a>

          </div>

        </section>


        {/* =========================
            MENSAJE FINAL
        ========================= */}

        <section className="mensaje-final">

          <div className="check-verde">
            ✔
          </div>

          <div className="mensaje-texto">
            <strong>
              Gracias por estar siempre al tanto.
            </strong>

            <span>
              La comunicación entre la escuela y la familia es muy importante
              para el desarrollo de nuestros alumnos.
            </span>
          </div>

          <div className="mensaje-escuela">
            🏫
          </div>

        </section>

      </main>

    </div>
  );
}

export default InicioTutor;