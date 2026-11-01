// Hook de React para guardar los datos de la pantalla
import { useState } from "react";
// Estilos de esta pantalla
import "../estilos/altaybajacursos.css";

// Pantalla de alta y baja de cursos
function AltaBajaCurso() {

  // Datos de la pantalla: por ahora vacíos, se completan con la base de datos
  // Tiene el usuario del encabezado y las listas de preceptores y cursos
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
  // Formulario en blanco: se usa al empezar y para limpiarlo
  const formularioVacio = {
    anio: "",
    division: "",
    turno: "",
    ciclo: "",
    preceptor: ""
  };

  // Lo que se va escribiendo en el formulario
  const [form, setForm] = useState(formularioVacio);

  // Cambia un solo campo y conserva el resto (por eso el form)
  const cambiarCampo = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  // Arma el nombre del curso para el resumen, ej: "3° A"
  // Queda vacío si todavía no se escribió ni año ni división
  const nombreCurso =
    form.anio.trim() !== "" || form.division.trim() !== ""
      ? `${form.anio.trim()}° ${form.division.trim()}`
      : "";

  // Es true cuando están los datos obligatorios (año, división, turno y ciclo)
  // Habilita el botón Guardar. El preceptor es opcional
  const altaLista =
    form.anio.trim() !== "" &&
    form.division.trim() !== "" &&
    form.turno !== "" &&
    form.ciclo.trim() !== "";

  // Busca el preceptor elegido en el select (se compara como texto porque el value del select siempre es string)
  const preceptorElegido = datos.preceptores.find(
    (preceptor) => String(preceptor.id) === String(form.preceptor)
  );

  // Se ejecuta al enviar el formulario
  const guardarCurso = (e) => {
    e.preventDefault();
    // Si falta algún dato obligatorio, no hace nada
    if (!altaLista) return;

    // Acá se conecta con la base de datos (alta)
    // const nuevoCurso = { form, nombre: nombreCurso };

    // Limpia el formulario después de guardar
    setForm(formularioVacio);
  };

  /* Baja de cursos */
  // Estados de la baja: busqueda (texto del buscador), cursoBaja (curso elegido; si hay uno se abre el modal) y motivo
  const [busqueda, setBusqueda] = useState("");
  const [cursoBaja, setCursoBaja] = useState(null);
  const [motivo, setMotivo] = useState("");

  // Filtra la tabla por lo que se escriba en el buscador (todo en minúsculas)
  const cursosFiltrados = datos.cursos.filter((curso) =>
    (curso.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cierra el modal y borra lo que se había elegido
  const cerrarModal = () => {
    setCursoBaja(null);
    setMotivo("");
  };

  // Se ejecuta al apretar "Confirmar baja"
  const confirmarBaja = () => {
    // Sin curso o sin motivo, no hace nada
    if (!cursoBaja || motivo === "") return;

    // Acá se conecta con la base de datos (baja)
    // const baja = { cursoId: cursoBaja.id, motivo };

    cerrarModal();
  };

  // Traduce el valor guardado del turno al texto que se muestra (manana pasa a Mañana)
  const turnos = {
    manana: "Mañana",
    tarde: "Tarde",
    noche: "Noche"
  };

  // Desde acá empieza lo que se dibuja en pantalla
  return (
    <div className="panel">

      {/* =========================
          BARRA LATERAL
      ========================= */}

      <aside className="sidebar">

        {/* Logo del sistema */}
        <div className="logo">
          <h2>CUADERNO DE</h2>
          <h2>COMUNICACIONES</h2>
          <span>DIGITAL</span>
        </div>

        {/* Menú de navegación: la clase "activo" marca la pantalla actual (Cursos) */}
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

        {/* Cerrar sesión (por ahora solo es el botón visual) */}
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

        {/* Título a la izquierda, fecha y usuario a la derecha */}
        <header className="encabezado encabezado-alumnos">

          <div>
            <h1>Cursos</h1>
            <p>Inicio &gt; Cursos &gt; Alta y baja</p>
          </div>

          <div className="encabezado-derecha">

            {/* Fecha y día de la semana (vienen de datos) */}
            <div className="fecha">
              <strong>{datos.fecha || ""}</strong>
              <span>{datos.dia || ""}</span>
            </div>

            {/* Usuario logueado (viene de datos) */}
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

        {/* El estado pestana decide qué sección se ve y cuál botón queda marcado como activo */}
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

            {/* Formulario de alta: al enviarlo se ejecuta guardarCurso */}
            <form className="tarjeta formulario" onSubmit={guardarCurso}>

              <div className="titulo-seccion">
                <h2>Datos del curso</h2>
              </div>

              {/* Año y división (juntos forman el nombre del curso, por ejemplo 3° A) */}
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

              {/* Turno y ciclo lectivo */}
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


              {/* Preceptor a cargo (opcional) */}
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
                  {/* Las opciones salen de la lista de preceptores: se guarda el id y se muestra el nombre */}
                  {datos.preceptores.map((preceptor, index) => (
                    <option key={preceptor.id || index} value={preceptor.id}>
                      {preceptor.nombre}
                    </option>
                  ))}
                </select>
              </div>


              {/* Cancelar limpia el formulario; Guardar se habilita cuando altaLista es true */}
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

              {/* El resumen se va actualizando mientras se completa el formulario */}
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

              {/* Aviso informativo */}
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

            {/* Buscador de cursos */}
            <div className="filtros">

              <input
                type="search"
                className="buscador"
                placeholder="Buscar curso..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

            </div>

            {/* Tabla de cursos */}
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

                {/* Dos casos: lista vacía o una fila por cada curso */}
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

      {/* El modal solo se muestra si hay un curso elegido (cursoBaja) */}
      {cursoBaja && (

        <div className="fondo-modal" onClick={cerrarModal}>

          <div className="modal" onClick={(e) => e.stopPropagation()}>

            {/* Ícono de advertencia */}
            <div className="modal-icono">!</div>

            <h2>Dar de baja curso</h2>

            <p>
              Vas a dar de baja el curso <strong>{cursoBaja.nombre}</strong>.
            </p>

            {/* Si el curso tiene alumnos, avisa que hay que reasignarlos antes de seguir */}
            {/* Es solo un aviso: no bloquea el botón de confirmar */}
            {Number(cursoBaja.alumnos) > 0 && (
              <div className="aviso-peligro">
                Este curso tiene {cursoBaja.alumnos} alumnos. Recordá
                reasignarlos a otro curso antes de continuar.
              </div>
            )}

            {/* Motivo de la baja: sin elegirlo, el botón rojo queda deshabilitado */}
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

            {/* Cancelar cierra el modal; Confirmar baja ejecuta confirmarBaja */}
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