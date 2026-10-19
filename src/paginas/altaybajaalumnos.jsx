import { useState } from "react";
import "../estilos/altaybajaalumnos.css";

function AltaBajaAlumnos() {

  const datos = {
    nombre: "",
    rol: "",
    iniciales: "",
    fecha: "",
    dia: "",
    cursos: [],
    alumnos: []
  };

  /* Pestaña activa: "alta" | "baja" */
  const [pestana, setPestana] = useState("alta");

  /* Formulario de alta */
  const formularioVacio = {
    nombre: "",
    apellido: "",
    dni: "",
    legajo: "",
    nacimiento: "",
    curso: "",
    tutorNombre: "",
    tutorEmail: "",
    tutorTelefono: ""
  };

  const [form, setForm] = useState(formularioVacio);

  const cambiarCampo = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const altaLista =
    form.nombre.trim() !== "" &&
    form.apellido.trim() !== "" &&
    form.dni.trim() !== "" &&
    form.curso !== "" &&
    form.tutorNombre.trim() !== "";

  const guardarAlumno = (e) => {
    e.preventDefault();
    if (!altaLista) return;

    // Acá se conecta con la base de datos (alta)
    // const nuevoAlumno = { ...form };

    setForm(formularioVacio);
  };

  /* Baja de alumnos */
  const [busqueda, setBusqueda] = useState("");
  const [alumnoBaja, setAlumnoBaja] = useState(null);
  const [motivo, setMotivo] = useState("");

  const alumnosFiltrados = datos.alumnos.filter((alumno) =>
    (alumno.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (alumno.dni || "").includes(busqueda)
  );

  const cerrarModal = () => {
    setAlumnoBaja(null);
    setMotivo("");
  };

  const confirmarBaja = () => {
    if (!alumnoBaja || motivo === "") return;

    // Acá se conecta con la base de datos (baja)
    // const baja = { alumnoId: alumnoBaja.id, motivo };

    cerrarModal();
  };

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

          <a href="#" className="menu-item">
            <span className="menu-icon">⌂</span>
            <span>Inicio</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">♙</span>
            <span>Cursos</span>
          </a>

          <a href="#" className="menu-item activo">
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

        <header className="encabezado encabezado-alumnos">

          <div>
            <h1>Alumnos</h1>
            <p>Inicio &gt; Alumnos &gt; Alta y baja</p>
          </div>

          <div className="encabezado-derecha">

            <div className="fecha">
              <strong>{datos.fecha || ""}</strong>
              <span>{datos.dia || ""}</span>
            </div>

            <div className="usuario">
              <span className="usuario-avatar">{datos.iniciales}</span>
              <div>
                <strong>{datos.nombre}</strong>
                <span>{datos.rol}</span>
              </div>
            </div>

          </div>

        </header>

        <p className="subtitulo">
          Registrar nuevos alumnos o dar de baja alumnos existentes.
        </p>


        {/* PESTAÑAS */}

        <div className="pestanas">

          <button
            className={`pestana ${pestana === "alta" ? "activa" : ""}`}
            onClick={() => setPestana("alta")}
          >
            + Dar de alta
          </button>

          <button
            className={`pestana ${pestana === "baja" ? "activa" : ""}`}
            onClick={() => setPestana("baja")}
          >
            − Dar de baja
          </button>

        </div>


        {/* =========================
            ALTA DE ALUMNO
        ========================= */}

        {pestana === "alta" && (

          <section className="zona-formulario">

            <form className="tarjeta formulario" onSubmit={guardarAlumno}>

              <div className="titulo-seccion">
                <h2>Datos del alumno</h2>
              </div>

              <div className="fila">

                <div className="campo">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    className="entrada"
                    value={form.nombre}
                    onChange={(e) => cambiarCampo("nombre", e.target.value)}
                  />
                </div>

                <div className="campo">
                  <label htmlFor="apellido">Apellido</label>
                  <input
                    id="apellido"
                    type="text"
                    className="entrada"
                    value={form.apellido}
                    onChange={(e) => cambiarCampo("apellido", e.target.value)}
                  />
                </div>

              </div>

              <div className="fila">

                <div className="campo">
                  <label htmlFor="dni">DNI</label>
                  <input
                    id="dni"
                    type="text"
                    className="entrada"
                    value={form.dni}
                    onChange={(e) => cambiarCampo("dni", e.target.value)}
                  />
                </div>

                <div className="campo">
                  <label htmlFor="legajo">Legajo</label>
                  <input
                    id="legajo"
                    type="text"
                    className="entrada"
                    value={form.legajo}
                    onChange={(e) => cambiarCampo("legajo", e.target.value)}
                  />
                </div>

              </div>

              <div className="fila">

                <div className="campo">
                  <label htmlFor="nacimiento">Fecha de nacimiento</label>
                  <input
                    id="nacimiento"
                    type="date"
                    className="entrada"
                    value={form.nacimiento}
                    onChange={(e) => cambiarCampo("nacimiento", e.target.value)}
                  />
                </div>

                <div className="campo">
                  <label htmlFor="curso">Curso</label>
                  <select
                    id="curso"
                    className="entrada"
                    value={form.curso}
                    onChange={(e) => cambiarCampo("curso", e.target.value)}
                  >
                    <option value="">Seleccionar curso</option>
                    {datos.cursos.map((curso, index) => (
                      <option key={curso.id || index} value={curso.nombre}>
                        {curso.nombre}
                      </option>
                    ))}
                  </select>
                </div>

              </div>


              <div className="titulo-seccion separado">
                <h2>Datos del tutor</h2>
              </div>

              <div className="campo">
                <label htmlFor="tutor-nombre">Nombre completo del tutor</label>
                <input
                  id="tutor-nombre"
                  type="text"
                  className="entrada"
                  value={form.tutorNombre}
                  onChange={(e) => cambiarCampo("tutorNombre", e.target.value)}
                />
              </div>

              <div className="fila">

                <div className="campo">
                  <label htmlFor="tutor-email">Correo electrónico</label>
                  <input
                    id="tutor-email"
                    type="email"
                    className="entrada"
                    value={form.tutorEmail}
                    onChange={(e) => cambiarCampo("tutorEmail", e.target.value)}
                  />
                </div>

                <div className="campo">
                  <label htmlFor="tutor-telefono">Teléfono</label>
                  <input
                    id="tutor-telefono"
                    type="tel"
                    className="entrada"
                    value={form.tutorTelefono}
                    onChange={(e) => cambiarCampo("tutorTelefono", e.target.value)}
                  />
                </div>

              </div>


              <div className="botones">

                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => setForm(formularioVacio)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="boton-primario"
                  disabled={!altaLista}
                >
                  + Guardar alumno
                </button>

              </div>

            </form>


            {/* RESUMEN */}

            <aside className="tarjeta resumen">

              <div className="titulo-seccion">
                <h2>Resumen</h2>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">♙</div>
                <div>
                  <span>Alumno:</span>
                  <strong>
                    {form.nombre || form.apellido
                      ? `${form.nombre} ${form.apellido}`
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">🎓</div>
                <div>
                  <span>Curso:</span>
                  <strong>{form.curso || "—"}</strong>
                </div>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">👥</div>
                <div>
                  <span>Tutor:</span>
                  <strong>{form.tutorNombre || "—"}</strong>
                </div>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">✉</div>
                <div>
                  <span>Estado:</span>
                  <span className={`estado-etiqueta ${altaLista ? "listo" : "incompleto"}`}>
                    {altaLista ? "Listo para registrar" : "Faltan datos"}
                  </span>
                </div>
              </div>

              <div className="aviso">
                <span className="aviso-icono">i</span>
                <p>
                  Al guardar, el alumno quedará registrado y su tutor podrá
                  recibir las comunicaciones del cuaderno digital.
                </p>
              </div>

            </aside>

          </section>

        )}


        {/* =========================
            BAJA DE ALUMNO
        ========================= */}

        {pestana === "baja" && (

          <section className="tarjeta tabla-alumnos">

            <div className="filtros">

              <input
                type="search"
                className="buscador"
                placeholder="Buscar por nombre o DNI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

            </div>

            <div className="tabla-scroll">

              <table>

                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>DNI</th>
                    <th>Curso</th>
                    <th className="centrado">Acciones</th>
                  </tr>
                </thead>

                <tbody>

                  {alumnosFiltrados.length === 0 ? (

                    <tr>
                      <td colSpan={4} className="sin-datos">
                        No hay alumnos para mostrar
                      </td>
                    </tr>

                  ) : (

                    alumnosFiltrados.map((alumno, index) => (

                      <tr key={alumno.id || index}>

                        <td>
                          <div className="alumno">
                            <span className="avatar">
                              {alumno.foto
                                ? <img src={alumno.foto} alt={alumno.nombre} />
                                : iniciales(alumno.nombre)}
                            </span>
                            <strong>{alumno.nombre}</strong>
                          </div>
                        </td>

                        <td>{alumno.dni}</td>

                        <td>
                          <span className="etiqueta-curso">{alumno.curso}</span>
                        </td>

                        <td>
                          <div className="acciones-fila">
                            <button
                              className="boton-baja"
                              onClick={() => setAlumnoBaja(alumno)}
                            >
                              Dar de baja
                            </button>
                          </div>
                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </section>

        )}

      </main>


      {/* =========================
          CONFIRMAR BAJA
      ========================= */}

      {alumnoBaja && (

        <div className="fondo-modal" onClick={cerrarModal}>

          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <div className="modal-icono">!</div>

            <h2>Dar de baja alumno</h2>

            <p>
              Vas a dar de baja a <strong>{alumnoBaja.nombre}</strong>.
              Esta acción deja de enviar comunicaciones a su tutor.
            </p>

            <div className="campo">
              <label htmlFor="motivo">Motivo de la baja</label>
              <select
                id="motivo"
                className="entrada"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              >
                <option value="">Seleccionar motivo</option>
                <option value="cambio-escuela">Cambio de escuela</option>
                <option value="egreso">Egreso</option>
                <option value="abandono">Abandono</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="botones">

              <button className="boton-secundario" onClick={cerrarModal}>
                Cancelar
              </button>

              <button
                className="boton-peligro"
                disabled={motivo === ""}
                onClick={confirmarBaja}
              >
                Confirmar baja
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AltaBajaAlumnos;