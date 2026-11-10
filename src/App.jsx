
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";

import Login from "./paginas/inicarSesion.jsx";
import Bienvenida from "./paginas/bienvenida.jsx";
import InicioPreceptor from "./paginas/inicioPreceptor.jsx";
import CursosPreceptor from "./paginas/cursospreceptor.jsx";
import AlumnosPreceptor from "./paginas/alumnospreceptor.jsx";
import NotificacionPreceptor from "./paginas/notificacionpreceptor.jsx";
import HistorialPreceptor from "./paginas/historialpreceptor.jsx";
import InicioTutor from "./paginas/iniciotutor.jsx";
import NotificacionesRecibidasTutor from "./paginas/notificacionestutor.jsx";
import DatosAlumno from "./paginas/datosalumno.jsx";
import Registro from "./paginas/registro.jsx";
import AltaBajaAlumnos from "./paginas/altaybajaalumnos.jsx";
import AltaBajaPreceptores from "./paginas/altaybajapreceptores.jsx";
import AltaBajaCurso from "./paginas/altaybajacursos.jsx";
import Ayuda from "./paginas/ayuda.jsx";
import Administrador from "./paginas/administrador.jsx";
import RutaProtegida from "./componentes/RutasProtegidas.jsx";
import { AuthProvider } from "./contexto/AuthContext.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Bienvenida />} />
          <Route path="/bienvenida" element={<Bienvenida />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* RUTAS DEL PRECEPTOR */}
          <Route
            path="/preceptor"
            element={
              <RutaProtegida rolesPermitidos={["preceptor"]}>
                <InicioPreceptor />
              </RutaProtegida>
            }
          />

          <Route
            path="/cursospreceptor"
            element={
              <RutaProtegida rolesPermitidos={["preceptor"]}>
                <CursosPreceptor />
              </RutaProtegida>
            }
          />

          <Route
            path="/alumnospreceptor"
            element={
              <RutaProtegida rolesPermitidos={["preceptor"]}>
                <AlumnosPreceptor />
              </RutaProtegida>
            }
          />

          <Route
            path="/notificacionpreceptor"
            element={
              <RutaProtegida rolesPermitidos={["preceptor"]}>
                <NotificacionPreceptor />
              </RutaProtegida>
            }
          />

          <Route
            path="/historialpreceptor"
            element={
              <RutaProtegida rolesPermitidos={["preceptor"]}>
                <HistorialPreceptor />
              </RutaProtegida>
            }
          />

          {/* RUTAS DEL TUTOR */}
          <Route
            path="/iniciotutor"
            element={
              <RutaProtegida rolesPermitidos={["tutor"]}>
                <InicioTutor />
              </RutaProtegida>
            }
          />

          <Route
            path="/notificacionesrecibidas"
            element={
              <RutaProtegida rolesPermitidos={["tutor"]}>
                <NotificacionesRecibidasTutor />
              </RutaProtegida>
            }
          />

          <Route
            path="/datosalumno"
            element={
              <RutaProtegida rolesPermitidos={["tutor"]}>
                <DatosAlumno />
              </RutaProtegida>
            }
          />

          {/* RUTAS DEL ADMINISTRADOR */}
          <Route
            path="/administrador"
            element={
              <RutaProtegida rolesPermitidos={["administrador"]}>
                <Administrador />
              </RutaProtegida>
            }
          />

          <Route
            path="/altabajaalumnos"
            element={
              <RutaProtegida rolesPermitidos={["administrador"]}>
                <AltaBajaAlumnos />
              </RutaProtegida>
            }
          />

          <Route
            path="/altabajapreceptores"
            element={
              <RutaProtegida rolesPermitidos={["administrador"]}>
                <AltaBajaPreceptores />
              </RutaProtegida>
            }
          />

          <Route
            path="/altabajacursos"
            element={
              <RutaProtegida rolesPermitidos={["administrador"]}>
                <AltaBajaCurso />
              </RutaProtegida>
            }
          />

          {/* AYUDA: pendiente de definir permisos */}
          <Route
            path="/ayuda"
            element={
              <RutaProtegida>
                <Ayuda />
              </RutaProtegida>
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
