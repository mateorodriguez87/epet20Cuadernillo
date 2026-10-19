import { useState } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
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

import { BrowserRouter, Route, Routes } from "react-router-dom";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta para la página principal/raíz */}
        <Route path="/" element={<Bienvenida />} />

        {/* Rutas adicionales de tu app */}
        <Route path="/bienvenida" element={<Bienvenida />} />
        <Route path="/login" element={<Login />} />
        <Route path="/preceptor" element={<InicioPreceptor />} />
        <Route path="/cursospreceptor" element={<CursosPreceptor />} />
        <Route path="/alumnospreceptor" element={<AlumnosPreceptor />} />
        <Route
          path="/notificacionpreceptor"
          element={<NotificacionPreceptor />}
        />
        <Route path="/historialpreceptor" element={<HistorialPreceptor />} />
        <Route path="/iniciotutor" element={<InicioTutor />} />
        <Route
          path="/notificacionesrecibidas"
          element={<NotificacionesRecibidasTutor />}
        />
        <Route path="/datosalumno" element={<DatosAlumno />} />
        <Route path="/registro" element={<Registro />} />
                <Route path="/altabajaalumnos" element={<AltaBajaAlumnos />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
