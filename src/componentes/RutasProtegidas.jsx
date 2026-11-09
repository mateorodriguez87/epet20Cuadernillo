import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";

// Envuelve a una pantalla que queremos proteger:
// si hay un usuario con la sesión iniciada, la muestra; si no, redirige al login
function RutaProtegida({ children }) {
  // usuario: el que inició sesión (o null) / cargando: true mientras Firebase revisa si hay sesión
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  // Mientras Firebase responde no se sabe si hay usuario, así que se muestra un indicador.
  // Si se redirigiera ya, alguien con la sesión iniciada rebotaría al login al recargar la página
  if (cargando) {
    return (
      <div className="ruta-cargando" role="status">
        <span className="ruta-spinner" aria-hidden="true" />
        <span>Cargando...</span>
      </div>
    );
  }

  if (!usuario) {
    // Guardamos a dónde quería ir, para volver ahí después del login.
    // replace evita que el botón "Atrás" vuelva a la pantalla protegida
    return <Navigate to="/login" state={{ desde: ubicacion }} replace />;
  }

  // Hay usuario: se muestra la pantalla protegida
  return children;
}

export default RutaProtegida;