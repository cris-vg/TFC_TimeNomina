// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [usuario, setUsuario] = useState(null);
    const [uid, setUid] = useState(null);
    const [password, setPassword] = useState(null);
    const [empleadoId, setEmpleadoId] = useState(null);
    const [nombreEmpleado, setNombreEmpleado] = useState(null);

    const [loading, setLoading] = useState(true);

    // 🔄 Cargar sesión guardada al iniciar app
    useEffect(() => {
        cargarSesion();
    }, []);

    const cargarSesion = async () => {
        try {
            const usuarioGuardado = await SecureStore.getItemAsync("usuario");
            const uidGuardado = await SecureStore.getItemAsync("uid");
            const passwordGuardado = await SecureStore.getItemAsync("password");
            const empleadoIdGuardado = await SecureStore.getItemAsync("empleadoId");
            const nombreGuardado = await SecureStore.getItemAsync("nombreEmpleado");

            if (uidGuardado) {
                setUsuario(usuarioGuardado);
                setUid(parseInt(uidGuardado));
                setPassword(passwordGuardado);
                setEmpleadoId(parseInt(empleadoIdGuardado));
                setNombreEmpleado(nombreGuardado);
            }

        } catch (error) {
            console.log("Error cargando sesión:", error);
        }

        setLoading(false);
    };

    // 🔐 Login con guardado seguro
    const login = async (usuarioLogin, uidLogin, passwordLogin, empleadoIdLogin, nombreEmpleadoLogin) => {

        setUsuario(usuarioLogin);
        setUid(uidLogin);
        setPassword(passwordLogin);
        setEmpleadoId(empleadoIdLogin);
        setNombreEmpleado(nombreEmpleadoLogin);

        await SecureStore.setItemAsync("usuario", usuarioLogin);
        await SecureStore.setItemAsync("uid", uidLogin.toString());
        await SecureStore.setItemAsync("password", passwordLogin);
        await SecureStore.setItemAsync("empleadoId", empleadoIdLogin.toString());
        await SecureStore.setItemAsync("nombreEmpleado", nombreEmpleadoLogin);
    };

    // 🚪 Logout
    const logout = async () => {

        setUsuario(null);
        setUid(null);
        setPassword(null);
        setEmpleadoId(null);
        setNombreEmpleado(null);

        await SecureStore.deleteItemAsync("usuario");
        await SecureStore.deleteItemAsync("uid");
        await SecureStore.deleteItemAsync("password");
        await SecureStore.deleteItemAsync("empleadoId");
        await SecureStore.deleteItemAsync("nombreEmpleado");
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                uid,
                password,
                empleadoId,
                nombreEmpleado,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};