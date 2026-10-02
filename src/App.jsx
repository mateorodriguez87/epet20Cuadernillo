import { useState } from 'react';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
import Login from './paginas/inicarSesion.jsx';
import Bienvenida from './paginas/bienvenida.jsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import Login from "./components/Login";


function App() {
  return (
      <BrowserRouter>

      <Routes>

      <Route
      path="/bienvenida"
      element={<Bienvenida />}
      />

      <Route
      path="/login"
      element={<Login />}
      />

      </Routes>


      </BrowserRouter>
  );
}

export default App;