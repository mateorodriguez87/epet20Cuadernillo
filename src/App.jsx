import { useState } from 'react';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
import Login from './paginas/inicarSesion.jsx';
import Bienvenida from './paginas/bienvenida.jsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta para la página principal/raíz */}
        <Route path="/" element={<Bienvenida />} />
        
        {/* Rutas adicionales de tu app */}
        <Route path="/bienvenida" element={<Bienvenida />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;