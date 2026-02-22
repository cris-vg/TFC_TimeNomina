// src/context/AuthContext.js

import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [usuario, setUsuario] = useState(null);
    const [uid, setUid] = useState(null);
    const [password, setPassword] = useState(null);
    const [empleadoId, setEmpleadoId] = useState(null);
    const [nombreEmpleado, setNombreEmpleado] = useState(null);

    const login = (usuarioLogin, uidLogin, passwordLogin, empleadoIdLogin, nombreEmpleadoLogin) => {
        setUsuario(usuarioLogin);
        setUid(uidLogin);
        setPassword(passwordLogin);
        setEmpleadoId(empleadoIdLogin);
        setNombreEmpleado(nombreEmpleadoLogin);
    };

    const logout = () => {
        setUsuario(null);
        setUid(null);
        setPassword(null);
        setEmpleadoId(null);
        setNombreEmpleado(null);
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                uid,
                password,
                empleadoId,
                nombreEmpleado,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};