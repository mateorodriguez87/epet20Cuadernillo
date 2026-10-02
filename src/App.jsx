import { useState } from 'react';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
import Login from './paginas/inicarSesion.jsx';
import Bienvenida from './paginas/bienvenida.jsx';
// import Login from "./components/Login";

function App() {
  return (
    <Bienvenida />
  );
}

function App(){
  return ( 
  <Login/>
  );
}

export default App;