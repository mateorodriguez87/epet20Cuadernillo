import { useState } from "react";
import "../estilos/altaybajacursos.css";

function AltaBajaCurso() {

  const datos = {
    nombre: "",
    rol: "",
    iniciales: "",
    fecha: "",
    dia: "",
    preceptores: [],
    cursos: []
  };

  /* Pestaña activa: "alta" | "baja" */
  const [pestana, setPestana] = useState("alta");

  /* Formulario de alta */
  const formularioVacio = {
    anio: "",
    division: "",
    turno: "",
    ciclo: "",
    preceptor: ""
  };

  const [form, setForm] = useState(formularioVacio);

  const cambiarCampo = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const nombreCurso =
    form.anio.trim() !== "" || form.division.trim() !== ""
      ? `${form.anio.trim()}° ${form.division.trim()}`
      : "";

  const altaLista =
    form.anio.trim() !== "" &&
    form.division.trim() !== "" &&
    form.turno !== "" &&
    form.ciclo.trim() !== "";

  const preceptorElegido = datos.preceptores.find(
    (preceptor) => String(preceptor.id) === String(form.preceptor)
  );

  const guardarCurso = (e) => {
    e.preventDefault();
    if (!altaLista) return;

    // Acá se conecta con la base de datos (alta)
    // const nuevoCurso = { ...form, nombre: nombreCurso };

    setForm(formularioVacio);
  };

  /* Baja de cursos */
  const [busqueda, setBusqueda] = useState("");
  const [cursoBaja, setCursoBaja] = useState(null);
  const [motivo, setMotivo] = useState("");

  const cursosFiltrados = datos.cursos.filter((curso) =>
    (curso.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const cerrarModal = () => {
    setCursoBaja(null);
    setMotivo("");
  };

  const confirmarBaja = () => {
    if (!cursoBaja || motivo === "") return;

    // Acá se conecta con la base de datos (baja)
    // const baja = { cursoId: cursoBaja.id, motivo };

    cerrarModal();
  };

  const turnos = {
    manana: "Mañana",
    tarde: "Tarde",
    noche: "Noche"
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

          <a href="#" className="menu-item">
            <span className="menu-icon">⌂</span>
            <span>Inicio</span>
          </a>

          <a href="#" className="menu-item activo">
            <span className="menu-icon">♙</span>
            <span>Cursos</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">♙</span>
            <span>Alumnos</span>
          </a>

          <a href="#" className="menu-item">
            <span className="menu-icon">♙</span>
            <span>Preceptores</span>
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
            <h1>Cursos</h1>
            <p>Inicio &gt; Cursos &gt; Alta y baja</p>
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
          Crear nuevos cursos o dar de baja cursos existentes.
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
            ALTA DE CURSO
        ========================= */}

        {pestana === "alta" && (

          <section className="zona-formulario">

            <form className="tarjeta formulario" onSubmit={guardarCurso}>

              <div className="titulo-seccion">
                <h2>Datos del curso</h2>
              </div>

              <div className="fila">

                <div className="campo">
                  <label htmlFor="anio">Año</label>
                  <input
                    id="anio"
                    type="text"
                    className="entrada"
                    value={form.anio}
                    onChange={(e) => cambiarCampo("anio", e.target.value)}
                  />
                </div>

                <div className="campo">
                  <label htmlFor="division">División</label>
                  <input
                    id="division"
                    type="text"
                    className="entrada"
                    value={form.division}
                    onChange={(e) => cambiarCampo("division", e.target.value)}
                  />
                </div>

              </div>

              <div className="fila">

                <div className="campo">
                  <label htmlFor="turno">Turno</label>
                  <select
                    id="turno"
                    className="entrada"
                    value={form.turno}
                    onChange={(e) => cambiarCampo("turno", e.target.value)}
                  >
                    <option value="">Seleccionar turno</option>
                    <option value="manana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                  </select>
                </div>

                <div className="campo">
                  <label htmlFor="ciclo">Ciclo lectivo</label>
                  <input
                    id="ciclo"
                    type="number"
                    className="entrada"
                    value={form.ciclo}
                    onChange={(e) => cambiarCampo("ciclo", e.target.value)}
                  />
                </div>

              </div>


              <div className="titulo-seccion separado">
                <h2>Preceptor a cargo</h2>
              </div>

              <div className="campo">
                <label htmlFor="preceptor">Preceptor</label>
                <select
                  id="preceptor"
                  className="entrada"
                  value={form.preceptor}
                  onChange={(e) => cambiarCampo("preceptor", e.target.value)}
                >
                  <option value="">Sin asignar</option>
                  {datos.preceptores.map((preceptor, index) => (
                    <option key={preceptor.id || index} value={preceptor.id}>
                      {preceptor.nombre}
                    </option>
                  ))}
                </select>
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
                  + Guardar curso
                </button>

              </div>

            </form>


            {/* RESUMEN */}

            <aside className="tarjeta resumen">

              <div className="titulo-seccion">
                <h2>Resumen</h2>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">🎓</div>
                <div>
                  <span>Curso:</span>
                  <strong>{nombreCurso || "—"}</strong>
                </div>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">◷</div>
                <div>
                  <span>Turno:</span>
                  <strong>{turnos[form.turno] || "—"}</strong>
                </div>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">♙</div>
                <div>
                  <span>Preceptor:</span>
                  <strong>
                    {preceptorElegido ? preceptorElegido.nombre : "Sin asignar"}
                  </strong>
                </div>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">✔</div>
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
                  Al guardar, el curso quedará disponible para asignarle
                  alumnos y enviar comunicaciones a sus tutores.
                </p>
              </div>

            </aside>

          </section>

        )}


        {/* =========================
            BAJA DE CURSO
        ========================= */}

        {pestana === "baja" && (

          <section className="tarjeta tabla-alumnos">

            <div className="filtros">

              <input
                type="search"
                className="buscador"
                placeholder="Buscar curso..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

            </div>

            <div className="tabla-scroll">

              <table>

                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Turno</th>
                    <th>Preceptor</th>
                    <th>Alumnos</th>
                    <th className="centrado">Acciones</th>
                  </tr>
                </thead>

                <tbody>

                  {cursosFiltrados.length === 0 ? (

                    <tr>
                      <td colSpan={5} className="sin-datos">
                        No hay cursos para mostrar
                      </td>
                    </tr>

                  ) : (

                    cursosFiltrados.map((curso, index) => (

                      <tr key={curso.id || index}>

                        <td>
                          <span className="etiqueta-curso">{curso.nombre}</span>
                        </td>

                        <td>{turnos[curso.turno] || curso.turno}</td>

                        <td>{curso.preceptor || "Sin asignar"}</td>

                        <td>{curso.alumnos}</td>

                        <td>
                          <div className="acciones-fila">
                            <button
                              className="boton-baja"
                              onClick={() => setCursoBaja(curso)}
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

      {cursoBaja && (

        <div className="fondo-modal" onClick={cerrarModal}>

          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <div className="modal-icono">!</div>

            <h2>Dar de baja curso</h2>

            <p>
              Vas a dar de baja el curso <strong>{cursoBaja.nombre}</strong>.
            </p>

            {Number(cursoBaja.alumnos) > 0 && (
              <div className="aviso-peligro">
                Este curso tiene {cursoBaja.alumnos} alumnos. Recordá
                reasignarlos a otro curso antes de continuar.
              </div>
            )}

            <div className="campo">
              <label htmlFor="motivo">Motivo de la baja</label>
              <select
                id="motivo"
                className="entrada"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              >
                <option value="">Seleccionar motivo</option>
                <option value="cierre">Cierre de la división</option>
                <option value="fusion">Fusión con otro curso</option>
                <option value="error">Error de carga</option>
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

export default AltaBajaCurso;