"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function useAuth() {
   return useContext(AuthContext);
}

export function AuthProvider({ children }) {
   const [user, setUser] = useState(null);
   const [token, setToken] = useState(null);
   const [loading, setLoading] = useState(true);
   const router = useRouter();

   useEffect(() => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
         try {
            const payload = JSON.parse(atob(storedToken.split(".")[1]));
            setUser({
               id: payload.sub,
               email: payload.email,
               role: payload.role,
               firstName: payload.firstName,
               lastName: payload.lastName,
            });
            setToken(storedToken);
         } catch (err) {
            console.error("Error decoding token:", err);
            localStorage.removeItem("token");
         }
      }
      setLoading(false);
   }, []);

   const login = (token) => {
      localStorage.setItem("token", token);
      try {
         const payload = JSON.parse(atob(token.split(".")[1]));
         setUser({
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            firstName: payload.firstName,
            lastName: payload.lastName,
         });
         setToken(token);
         router.push("/dashboard");
      } catch (err) {
         console.error("Error decoding token:", err);
      }
   };

   const logout = () => {
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      router.push("/login");
   };

   const value = {
      user,
      token,
      login,
      logout,
      loading,
   };

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
