
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// Creamos el contexto de autenticación.
const AuthContext = createContext(null);

// Proveedor que mantiene la sesión y el rol del usuario.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cancelarSuscripcion = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUsuario(null);
        setCargando(false);
        return;
      }
      try {
        // Buscamos los datos del usuario en Firestore.
        const usuarioRef = doc(db, "usuarios", user.uid);
        const usuarioDoc = await getDoc(usuarioRef);

        if (!usuarioDoc.exists()) {
          setUsuario(null);
          await signOut(auth);
          return;
        }

        const datosUsuario = usuarioDoc.data();

        // Comprobamos que tenga un rol válido.
        const rolesValidos = ["administrador", "preceptor", "tutor"];

        if (!rolesValidos.includes(datosUsuario.rol)) {
          setUsuario(null);
          await signOut(auth);
          return;
        }

        // Guardamos los datos del usuario autenticado.
        setUsuario({
          uid: user.uid,
          email: user.email,
          ...datosUsuario
        });

      } catch (error) {
        console.error("Error al verificar la sesión:", error);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    });

    return () => cancelarSuscripcion();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consultar la sesión desde otros componentes.
export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return contexto;
}
