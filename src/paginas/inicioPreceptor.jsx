import { useState } from "react";
import "../estilos/inicioPreceptor.css";

function InicioPreceptor() {


  const datos = {
    nombre: "",
    fecha: "",
    cursos: [],
    alumnos: [],
    notificaciones: [],
    comunicaciones: []
  };

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
            <span className="menu-icon">♙</span>
            <span>Cursos</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">♙</span>
            <span>Alumnos</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">♧</span>
            <span>Notificaciones</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">▤</span>
            <span>Historial</span>
          </a>

        </nav>

        <a href="#" className="cerrar-sesion">
          <span className="logout-icon">⇥</span>
          <span>Cerrar sesión</span>
        </a>

      </aside>


      {/* =========================
          CONTENIDO
      ========================= */}

      <main className="contenido">

        {/* ENCABEZADO */}

        <header className="encabezado">

          <h1>
            Bienvenido{datos.nombre ? `, ${datos.nombre}` : ""}
          </h1>

          <p>
            {datos.fecha || ""}
          </p>

        </header>


        {/* =========================
            TARJETAS SUPERIORES
        ========================= */}

        <section className="estadisticas">

          {/* CURSOS */}

          <div className="tarjeta estadistica">

            <div className="icono-card azul">
              🎓
            </div>

            <div className="info-card">
              <span>Cursos a cargo</span>

              <strong>
                {datos.cursos.length > 0
                  ? datos.cursos.length
                  : "—"}
              </strong>
            </div>

            <a href="#">
              Ver cursos
              <span>›</span>
            </a>

          </div>


          {/* ALUMNOS */}

          <div className="tarjeta estadistica">

            <div className="icono-card verde">
              👥
            </div>

            <div className="info-card">
              <span>Alumnos a cargo</span>

              <strong>
                {datos.alumnos.length > 0
                  ? datos.alumnos.length
                  : "—"}
              </strong>
            </div>

            <a href="#">
              Ver alumnos
              <span>›</span>
            </a>

          </div>


          {/* NOTIFICACIONES */}

          <div className="tarjeta estadistica">

            <div className="icono-card naranja">
              ✉
            </div>

            <div className="info-card">
              <span>
                Notificaciones
                <br />
                pendientes
              </span>

              <strong className="numero-rojo">
                {datos.notificaciones.length > 0
                  ? datos.notificaciones.length
                  : "—"}
              </strong>
            </div>

            <a href="#">
              Ver pendientes
              <span>›</span>
            </a>

          </div>


          {/* COMUNICACIONES */}

          <div className="tarjeta estadistica">

            <div className="icono-card violeta">
              ▤
            </div>

            <div className="info-card">
              <span>
                Comunicaciones
                <br />
                enviadas (este mes)
              </span>

              <strong>
                {datos.comunicaciones.length > 0
                  ? datos.comunicaciones.length
                  : "—"}
              </strong>
            </div>

            <a href="#">
              Ver historial
              <span>›</span>
            </a>

          </div>

        </section>


        {/* =========================
            ZONA CENTRAL
        ========================= */}

        <section className="zona-central">


          {/* NOTIFICACIONES */}

          <div className="tarjeta notificaciones">

            <div className="titulo-seccion">
              <h2>Notificaciones pendientes</h2>

              <a href="#">
                Ver todas
              </a>
            </div>


            {datos.notificaciones.length === 0 ? (

              <div className="sin-datos">
                No hay notificaciones pendientes
              </div>

            ) : (

              datos.notificaciones.map((notificacion, index) => (

                <div className="notificacion" key={index}>

                  <div className="notificacion-icon azul">
                    !
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

                  <span className="flecha">
                    ›
                  </span>

                </div>

              ))

            )}

            <a
              href="#"
              className="ver-notificaciones"
            >
              Ir a notificaciones
            </a>

          </div>


          {/* ACCIONES RÁPIDAS */}

          <div className="tarjeta acciones">

            <div className="titulo-seccion">
              <h2>Acciones rápidas</h2>
            </div>


            <div className="accion">

              <div className="accion-icon azul">
                ➤
              </div>

              <div>
                <strong>
                  Nueva comunicación
                </strong>

                <span>
                  Enviar una nueva notificación
                </span>
              </div>

              <b>›</b>

            </div>


            <div className="accion">

              <div className="accion-icon verde">
                👥
              </div>

              <div>
                <strong>
                  Gestionar alumnos
                </strong>

                <span>
                  Agregar, editar o consultar alumnos.
                </span>
              </div>

              <b>›</b>

            </div>


            <div className="accion">

              <div className="accion-icon violeta">
                ▢
              </div>

              <div>
                <strong>
                  Ver historial
                </strong>

                <span>
                  Consultar comunicaciones enviadas.
                </span>
              </div>

              <b>›</b>

            </div>

          </div>

        </section>


        {/* =========================
            MIS CURSOS
        ========================= */}

        <section className="tarjeta cursos">

          <div className="titulo-seccion">

            <h2>
              Mis cursos
            </h2>

            <a href="#">
              Ver todos
            </a>

          </div>


          {datos.cursos.length === 0 ? (

            <div className="sin-cursos">
              No hay cursos cargados
            </div>

          ) : (

            <div className="lista-cursos">

              {datos.cursos.map((curso, index) => (

                <div
                  className="curso"
                  key={index}
                >

                  <strong>
                    {curso.nombre}
                  </strong>

                  <span>
                    {curso.alumnos} alumnos
                  </span>

                  <b>
                    ♧
                  </b>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default InicioPreceptor;