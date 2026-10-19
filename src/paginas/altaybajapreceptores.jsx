import { useState } from "react";
import "../estilos/altaybajapreceptores.css";

function AltaBajaPreceptores() {

  const datos = {
    nombre: "",
    rol: "",
    iniciales: "",
    fecha: "",
    dia: "",
    cursos: [],
    preceptores: []
  };

  /* Pestaña activa: "alta" | "baja" */
  const [pestana, setPestana] = useState("alta");

  /* Formulario de alta */
  const formularioVacio = {
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    turno: "",
    cursos: []
  };

  const [form, setForm] = useState(formularioVacio);

  const cambiarCampo = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const alternarCurso = (nombreCurso) => {
    const yaEsta = form.cursos.includes(nombreCurso);

    setForm({
      ...form,
      cursos: yaEsta
        ? form.cursos.filter((c) => c !== nombreCurso)
        : [...form.cursos, nombreCurso]
    });
  };

  const altaLista =
    form.nombre.trim() !== "" &&
    form.apellido.trim() !== "" &&
    form.dni.trim() !== "" &&
    form.email.trim() !== "";

  const guardarPreceptor = (e) => {
    e.preventDefault();
    if (!altaLista) return;

    // Acá se conecta con la base de datos (alta)
    // const nuevoPreceptor = { ...form };

    setForm(formularioVacio);
  };

  /* Baja de preceptores */
  const [busqueda, setBusqueda] = useState("");
  const [preceptorBaja, setPreceptorBaja] = useState(null);
  const [motivo, setMotivo] = useState("");

  const preceptoresFiltrados = datos.preceptores.filter((preceptor) =>
    (preceptor.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (preceptor.dni || "").includes(busqueda)
  );

  const cerrarModal = () => {
    setPreceptorBaja(null);
    setMotivo("");
  };

  const confirmarBaja = () => {
    if (!preceptorBaja || motivo === "") return;

    // Acá se conecta con la base de datos (baja)
    // const baja = { preceptorId: preceptorBaja.id, motivo };

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

          <a href="#" className="menu-item">
            <span className="menu-icon">♙</span>
            <span>Alumnos</span>
          </a>

          <a href="#" className="menu-item activo">
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
            <h1>Preceptores</h1>
            <p>Inicio &gt; Preceptores &gt; Alta y baja</p>
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
          Registrar nuevos preceptores o dar de baja preceptores existentes.
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
            ALTA DE PRECEPTOR
        ========================= */}

        {pestana === "alta" && (

          <section className="zona-formulario">

            <form className="tarjeta formulario" onSubmit={guardarPreceptor}>

              <div className="titulo-seccion">
                <h2>Datos del preceptor</h2>
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
                    <option value="ambos">Ambos</option>
                  </select>
                </div>

              </div>

              <div className="fila">

                <div className="campo">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    className="entrada"
                    value={form.email}
                    onChange={(e) => cambiarCampo("email", e.target.value)}
                  />
                </div>

                <div className="campo">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    id="telefono"
                    type="tel"
                    className="entrada"
                    value={form.telefono}
                    onChange={(e) => cambiarCampo("telefono", e.target.value)}
                  />
                </div>

              </div>


              <div className="titulo-seccion separado">
                <h2>Cursos a cargo</h2>
              </div>

              {datos.cursos.length === 0 ? (

                <div className="sin-cursos">
                  No hay cursos cargados
                </div>

              ) : (

                <div className="lista-cursos">

                  {datos.cursos.map((curso, index) => (

                    <label
                      className={`curso-opcion ${form.cursos.includes(curso.nombre) ? "marcado" : ""}`}
                      key={curso.id || index}
                    >
                      <input
                        type="checkbox"
                        checked={form.cursos.includes(curso.nombre)}
                        onChange={() => alternarCurso(curso.nombre)}
                      />
                      <span>{curso.nombre}</span>
                    </label>

                  ))}

                </div>

              )}


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
                  + Guardar preceptor
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
                  <span>Preceptor:</span>
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
                  <span>Cursos a cargo:</span>
                  <strong>
                    {form.cursos.length > 0 ? form.cursos.join(", ") : "—"}
                  </strong>
                </div>
              </div>

              <div className="resumen-item">
                <div className="icono-card azul">✉</div>
                <div>
                  <span>Correo:</span>
                  <strong>{form.email || "—"}</strong>
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
                  Al guardar, el preceptor podrá ingresar al cuaderno digital
                  y enviar comunicaciones a los tutores de sus cursos.
                </p>
              </div>

            </aside>

          </section>

        )}


        {/* =========================
            BAJA DE PRECEPTOR
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
                    <th>Preceptor</th>
                    <th>DNI</th>
                    <th>Cursos a cargo</th>
                    <th className="centrado">Acciones</th>
                  </tr>
                </thead>

                <tbody>

                  {preceptoresFiltrados.length === 0 ? (

                    <tr>
                      <td colSpan={4} className="sin-datos">
                        No hay preceptores para mostrar
                      </td>
                    </tr>

                  ) : (

                    preceptoresFiltrados.map((preceptor, index) => (

                      <tr key={preceptor.id || index}>

                        <td>
                          <div className="alumno">
                            <span className="avatar">
                              {preceptor.foto
                                ? <img src={preceptor.foto} alt={preceptor.nombre} />
                                : iniciales(preceptor.nombre)}
                            </span>
                            <strong>{preceptor.nombre}</strong>
                          </div>
                        </td>

                        <td>{preceptor.dni}</td>

                        <td>
                          {(preceptor.cursos || []).map((curso, i) => (
                            <span className="etiqueta-curso" key={i}>{curso}</span>
                          ))}
                        </td>

                        <td>
                          <div className="acciones-fila">
                            <button
                              className="boton-baja"
                              onClick={() => setPreceptorBaja(preceptor)}
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

      {preceptorBaja && (

        <div className="fondo-modal" onClick={cerrarModal}>

          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <div className="modal-icono">!</div>

            <h2>Dar de baja preceptor</h2>

            <p>
              Vas a dar de baja a <strong>{preceptorBaja.nombre}</strong>.
              Dejará de tener acceso al cuaderno digital y sus cursos
              quedarán sin preceptor a cargo.
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
                <option value="renuncia">Renuncia</option>
                <option value="licencia">Licencia</option>
                <option value="traslado">Traslado</option>
                <option value="jubilacion">Jubilación</option>
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

export default AltaBajaPreceptores;