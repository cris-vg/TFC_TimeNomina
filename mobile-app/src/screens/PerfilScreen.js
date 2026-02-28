// src/screens/PerfilScreen.js

/**
 * ==================================================
 * PerfilScreen - TimeNomina
 * --------------------------------------------------
 * Pantalla de perfil del empleado.
 *
 * Características:
 * - Cabecera con degradado corporativo
 * - Avatar con inicial
 * - Fade-in al cargar
 * - Cards premium flotantes
 * - Información organizada por bloques
 * - Botón cerrar sesión estilizado
 *
 * Diseño coherente con Home y Login.
 * ==================================================
 */

import React, { useContext, useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Animated,
    TouchableOpacity
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { obtenerPerfil } from '../services/odooService';

export default function PerfilScreen() {

    const { uid, password, empleadoId, nombreEmpleado, logout } = useContext(AuthContext);

    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const baseDatos = "attendance_app";

    useEffect(() => {
        cargarPerfil();
    }, []);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    /**
     * Carga datos del perfil desde Odoo.
     */
    const cargarPerfil = async () => {

        const resultado = await obtenerPerfil(
            baseDatos,
            uid,
            password,
            empleadoId
        );

        if (resultado.exito) {
            setPerfil(resultado.datos);
        }

        setCargando(false);
    };

    /**
     * Devuelve inicial para avatar.
     */
    const obtenerInicial = () => {
        if (!nombreEmpleado) return "";
        return nombreEmpleado.charAt(0).toUpperCase();
    };

    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" color="#556A9E" />
            </View>
        );
    }

    if (!perfil) {
        return (
            <View style={styles.cargando}>
                <Text>Error cargando perfil</Text>
            </View>
        );
    }

    return (
        <Animated.View style={[styles.contenedor, { opacity: fadeAnim }]}>

            {/* CABECERA */}
            <LinearGradient
                colors={["#3A4A6A", "#556A9E"]}
                style={styles.cabecera}
            >
                <View style={styles.avatar}>
                    <Text style={styles.inicial}>
                        {obtenerInicial()}
                    </Text>
                </View>

                <View>
                    <Text style={styles.nombre}>
                        {perfil.nombre}
                    </Text>
                    <Text style={styles.subtitulo}>
                        Información personal
                    </Text>
                </View>
            </LinearGradient>

            {/* CONTENIDO */}
            <ScrollView contentContainerStyle={styles.contenido}>

                <View style={styles.card}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.valor}>{perfil.email}</Text>

                    <Text style={styles.label}>Teléfono</Text>
                    <Text style={styles.valor}>{perfil.telefono}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Puesto</Text>
                    <Text style={styles.valor}>{perfil.puesto}</Text>

                    <Text style={styles.label}>Departamento</Text>
                    <Text style={styles.valor}>{perfil.departamento}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Horario teórico</Text>
                    <Text style={styles.valor}>
                        Entrada: {perfil.hora_entrada || "-"}
                    </Text>
                    <Text style={styles.valor}>
                        Salida: {perfil.hora_salida || "-"}
                    </Text>

                    <Text style={styles.label}>Margen permitido</Text>
                    <Text style={styles.valor}>
                        {perfil.margen_minutos} minutos
                    </Text>
                </View>
                {/* =====================================================
                    📌 BLOQUE INFORMATIVO LEGAL
                     Informa al empleado sobre el uso de geolocalización.
                     Refuerza transparencia y cumplimiento RGPD.
                ===================================================== */}

                <View style={styles.bloqueLegal}>
                    <Text style={styles.tituloLegal}>
                        Información sobre geolocalización
                    </Text>

                    <Text style={styles.textoLegal}>
                        El fichaje registra la ubicación únicamente en el momento del registro.
                        No se realiza seguimiento continuo ni monitorización fuera del horario laboral.
                    </Text>
                </View>

                {/* BOTÓN CERRAR SESIÓN */}
                <TouchableOpacity
                    style={styles.botonLogout}
                    onPress={logout}
                >
                    <Text style={styles.textoLogout}>
                        Cerrar sesión
                    </Text>
                </TouchableOpacity>

            </ScrollView>

        </Animated.View>
    );
}

const styles = StyleSheet.create({

    contenedor: {
        flex: 1,
        backgroundColor: "#F4F6FA"
    },

    cabecera: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
    },

    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15
    },

    inicial: {
        color: "#1F2A44",
        fontSize: 24,
        fontWeight: "bold"
    },

    nombre: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold"
    },

    subtitulo: {
        color: "#E0E0E0",
        fontSize: 14
    },

    contenido: {
        padding: 20
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 12,
        elevation: 8
    },

    label: {
        fontSize: 13,
        color: "#556A9E",
        marginTop: 10,
        fontWeight: "600"
    },

    valor: {
        fontSize: 15,
        color: "#1F2A44",
        marginTop: 4
    },

    botonLogout: {
        marginTop: 20,
        backgroundColor: "#1F2A44",
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    textoLogout: {
        color: "#FFFFFF",
        fontWeight: "600"
    },

    cargando: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    bloqueLegal: {
        marginTop: 30,
        padding: 15,
        backgroundColor: "#F4F6FA",
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#2F5D9F"
    },

    tituloLegal: {
        fontWeight: "600",
        marginBottom: 8,
        color: "#2F5D9F"
    },

    textoLegal: {
        fontSize: 13,
        color: "#555",
        lineHeight: 18
    }
});