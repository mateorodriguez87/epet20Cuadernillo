// Se importa useState, pero esta pantalla todavía no lo usa (los datos salen de un objeto fijo)
import { useState } from "react";
// NavLink arma los links del menú y marca el activo; Link es un enlace común
import { NavLink, Link } from "react-router-dom";
// Estilos de esta pantalla
import "../estilos/iniciotutor.css";

// Pantalla de inicio del tutor: saludo, tarjeta del alumno, últimas notificaciones, datos del alumno y un mensaje final
function InicioTutor() {
  // Datos de la pantalla: por ahora vacíos, se completan con la base de datos
  // Tiene el nombre del tutor, la fecha, los datos del alumno y la lista de notificaciones
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
    // En cada tipo, el "color" es el nombre de la clase CSS (rojo, naranja, azul o verde)
    inasistencia: { icono: "!", color: "rojo" },
    conducta: { icono: "▤", color: "naranja" },
    nota: { icono: "✎", color: "azul" },
    aviso: { icono: "♧", color: "verde" }
  };

  // Cantidad de notificaciones sin leer: las que no tienen leida en true
  const sinLeer = datos.notificaciones.filter(
    (n) => !n.leida
  ).length;

  // Solo las 4 primeras notificaciones, para la tarjeta de "Últimas notificaciones"
  const ultimas = datos.notificaciones.slice(0, 4);

  // Saca las iniciales del alumno, para mostrarlas cuando no tiene foto
  const iniciales = (nombre = "") =>
    nombre
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      // Se queda con las dos primeras letras (ejemplo: "Tomás Rojas" queda "TR")
      .slice(0, 2);

  // Desde acá empieza lo que se dibuja en pantalla
  return (
    <div className="panel">

      {/* BARRA LATERAL */}
      <aside className="sidebar">

        <div className="logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        {/* Menú del tutor: NavLink pone la clase "activo" solo en la opción que coincide con la ruta actual (isActive); "end" pide que la ruta coincida exacta */}
        <nav className="menu">
          <NavLink
            to="/iniciotutor"
            end
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">⌂</span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/notificacionesrecibidas"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">♧</span>
            <span>Notificaciones recibidas</span>
          </NavLink>

          <NavLink
            to="/datosalumno"
            className={({ isActive }) =>
              `menu-item ${isActive ? "activo" : ""}`
            }
          >
            <span className="menu-icon">▤</span>
            <span>Datos del alumno</span>
          </NavLink>
        </nav>

        {/* Cerrar sesión: por ahora solo lleva a /login */}
        <Link to="/login" className="cerrar-sesion">
          <span className="logout-icon">⇥</span>
          <span>Cerrar Sesion</span>
        </Link>

      </aside>

      {/* CONTENIDO */}
      <main className="contenido">

        {/* ENCABEZADO */}
        {/* Saludo (el ", nombre" solo se agrega si hay uno; el texto "Bienvenida" es fijo) y la fecha */}
        <header className="encabezado">
          <h1>
            Bienvenida{datos.nombre ? `, ${datos.nombre}` : ""}
          </h1>

          <p>{datos.fecha || ""}</p>
        </header>

        {/* TARJETA DEL ALUMNO */}
        <section className="tarjeta-alumno">

          {/* Foto (o iniciales) y datos básicos del alumno */}
          <div className="alumno-info">

            <div className="foto-alumno">
              {/* Si el alumno tiene foto la muestra; si no, sus iniciales */}
              {datos.alumno.foto ? (
                <img
                  src={datos.alumno.foto}
                  alt={datos.alumno.nombre}
                />
              ) : (
                iniciales(datos.alumno.nombre)
              )}
            </div>

            {/* Los "—" aparecen mientras todavía no hay datos cargados */}
            <div className="alumno-datos">
              <span>Alumno</span>
              <strong>{datos.alumno.nombre || "—"}</strong>
              <p>{datos.alumno.curso}</p>
              <p>Legajo: {datos.alumno.legajo || "—"}</p>
            </div>

          </div>

          {/* Tarjeta con la cantidad de notificaciones sin leer */}
          <div className="tarjeta sin-leer">

            <div className="icono-card rojo">
              ♧
            </div>

            <div className="info-card">
              <span>Notificaciones sin leer</span>

              <strong className="numero-rojo">
                {/* Si no hay notificaciones, muestra "—" en vez de 0 */}
                {datos.notificaciones.length > 0 ? sinLeer : "—"}
              </strong>

              <Link to="/notificacionesrecibidas">
                ver todas
                <span> ›</span>
              </Link>
            </div>

          </div>

        </section>

        {/* ZONA CENTRAL */}
        <section className="zona-central">

          {/* ÚLTIMAS NOTIFICACIONES */}
          <div className="tarjeta notificaciones">

            <div className="titulo-seccion">
              <h2>Últimas notificaciones</h2>

              <Link to="/notificacionesrecibidas">
                Ver todas
              </Link>
            </div>

            {/* Si no hay notificaciones, muestra un mensaje de vacío; si hay, una fila por cada una */}
            {ultimas.length === 0 ? (
              <div className="sin-datos">
                No hay notificaciones
              </div>
            ) : (
              // Una fila por cada una de las últimas notificaciones
              ultimas.map((notificacion, index) => {
                // El tipo de la notificación (inasistencia, conducta, nota o aviso) define el ícono y el color; si el tipo no existe, usa el de aviso
                const tipo =
                  tipos[notificacion.tipo] || tipos.aviso;

                return (
                  <div
                    className="notificacion"
                    key={notificacion.id || index}
                  >
                    <div className={`notificacion-icon ${tipo.color}`}>
                      {tipo.icono}
                    </div>

                    <div className="notificacion-texto">
                      <strong>{notificacion.titulo}</strong>

                      <span>{notificacion.descripcion}</span>
                    </div>

                    <div className="notificacion-fecha">
                      {notificacion.fecha}
                    </div>

                    {/* El puntito y la flecha de abajo solo aparecen si la notificación no está leída */}
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

            {/* Link del final de la tarjeta, a la pantalla de notificaciones recibidas */}
            <Link
              to="/notificacionesrecibidas"
              className="ver-notificaciones"
            >
              Ver todas las notificaciones
            </Link>

          </div>

          {/* DATOS DEL ALUMNO */}
          <div className="tarjeta datos-alumno">

            <div className="titulo-seccion">
              <h2>Datos del alumno</h2>
            </div>

            {/* Cada dato del alumno: ícono y texto. Los "—" aparecen mientras no haya datos. Primero: nombre completo */}
            <div className="dato">

              <div className="icono-card azul">
                ♙
              </div>

              <div>
                <span>Nombre completo</span>
                <strong>{datos.alumno.nombre || "—"}</strong>
              </div>

            </div>

            {/* Curso */}
            <div className="dato">

              <div className="icono-card azul">
                🎓
              </div>

              <div>
                <span>Curso</span>
                <strong>{datos.alumno.curso || "—"}</strong>
              </div>

            </div>

            {/* Legajo */}
            <div className="dato">

              <div className="icono-card azul">
                ▤
              </div>

              <div>
                <span>Legajo</span>
                <strong>{datos.alumno.legajo || "—"}</strong>
              </div>

            </div>

            {/* Preceptor */}
            <div className="dato">

              <div className="icono-card azul">
                ♙
              </div>

              <div>
                <span>Preceptor</span>
                <strong>{datos.alumno.preceptor || "—"}</strong>
              </div>

            </div>

            {/* Lleva a la pantalla de Datos del alumno */}
            <Link to="/datosalumno" className="ver-mas">
              Ver más información
              <span>›</span>
            </Link>

          </div>

        </section>

        {/* MENSAJE FINAL */}
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

          {/* Emoji de la escuela */}
          <div className="mensaje-escuela">
            🏫
          </div>

        </section>

      </main>
    </div>
  );
}

export default InicioTutor;