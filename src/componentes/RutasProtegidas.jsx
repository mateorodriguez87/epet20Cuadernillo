
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";

// Componente para proteger las rutas según el rol del usuario.
function RutaProtegida({ children, rolesPermitidos = [] }) {

  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  // Esperamos a que Firebase compruebe la sesión.
  if (cargando) {
    return (
      <div className="ruta-cargando" role="status">
        <span className="ruta-spinner" aria-hidden="true" />
        <span>Cargando...</span>
      </div>
    );
  }

  // Si no inició sesión, redirigimos al login.
  if (!usuario) {
    return (
      <Navigate
        to="/login"
        state={{ desde: ubicacion }}
        replace
      />
    );
  }

  // Comprobamos si el rol tiene permiso para entrar.
  if (
    rolesPermitidos.length > 0 &&
    !rolesPermitidos.includes(usuario.rol)
  ) {

    // Redirigimos al usuario a su página correspondiente.
    const rutasPorRol = {
      administrador: "/administrador",
      preceptor: "/preceptor",
      tutor: "/iniciotutor"
    };

    return (
      <Navigate
        to={rutasPorRol[usuario.rol] || "/login"}
        replace
      />
    );
  }

  // Si cumple los requisitos, mostramos la página.
  return children;
}

export default RutaProtegida;
