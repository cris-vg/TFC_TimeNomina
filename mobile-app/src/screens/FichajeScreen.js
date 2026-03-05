// ======================================================
// 📌 FichajeScreen
// Pantalla principal de fichaje.
// - Detecta si el empleado está trabajando
// - Cambia botón dinámicamente (entrada / salida)
// - Mantiene opciones de fichaje manual y justificación
// ======================================================

import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';

import { AuthContext } from '../context/AuthContext';
import {
    ficharDesdeApp,
    obtenerEstadoJornada
} from '../services/odooService';
import { useFocusEffect } from '@react-navigation/native';


export default function FichajeScreen({ navigation }) {

    const { uid, password, empleadoId, nombreEmpleado } = useContext(AuthContext);

    const [cargando, setCargando] = useState(false);
    const [trabajando, setTrabajando] = useState(false);
    const [horaEntrada, setHoraEntrada] = useState(null);
    const [tiempoTrabajado, setTiempoTrabajado] = useState("00:00:00");

    const baseDatos = "attendance_app";

    /**
     * =====================================================
     * 🔍 CONSULTAR ESTADO ACTUAL DE JORNADA
     * =====================================================
     * Se ejecuta al entrar en la pantalla.
     * Consulta si existe fichaje abierto.
     */
    useFocusEffect(
        useCallback(() => {
            consultarEstado();
        }, [])
    );

    const consultarEstado = async () => {



        const resultado = await obtenerEstadoJornada(
            baseDatos,
            uid,
            password,
            empleadoId
        );



        if (resultado.exito) {
            setTrabajando(resultado.datos.trabajando);
            setHoraEntrada(resultado.datos.hora_entrada);
        }
    };

    /**
 * =====================================================
 * ⏱ CONTADOR EN TIEMPO REAL
 * =====================================================
 * Se activa cuando el empleado está trabajando.
 * Calcula la diferencia entre horaEntrada y hora actual.
 */
    useEffect(() => {

        let intervalo;

        if (trabajando && horaEntrada) {

            const inicio = new Date(horaEntrada + "Z"); // Convertir a objeto Date (asumiendo UTC)

            intervalo = setInterval(() => {

                const ahora = new Date();
                const diferencia = ahora.getTime() - inicio.getTime();

                const horas = Math.floor(diferencia / 3600000);
                const minutos = Math.floor((diferencia % 3600000) / 60000);
                const segundos = Math.floor((diferencia % 60000) / 1000);

                const formateado =
                    String(horas).padStart(2, '0') + ":" +
                    String(minutos).padStart(2, '0') + ":" +
                    String(segundos).padStart(2, '0');

                setTiempoTrabajado(formateado);

            }, 1000);
        }

        return () => {
            if (intervalo) clearInterval(intervalo);
        };

    }, [trabajando, horaEntrada]);

    /**
     * =====================================================
     * 📍 OBTENER UBICACIÓN GPS
     * =====================================================
     */
    const obtenerUbicacion = async () => {

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert("Ubicación necesaria");
            return null;
        }

        const ubicacion = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
        });

        return {
            latitud: ubicacion.coords.latitude,
            longitud: ubicacion.coords.longitude
        };
    };

    /**
     * =====================================================
     * 🕒 MANEJAR FICHAJE
     * =====================================================
     * Ejecuta entrada o salida dependiendo del estado actual.
     * Actualiza inmediatamente el botón según respuesta backend.
     */
    const manejarFichaje = async () => {

        setCargando(true);

        const coordenadas = await obtenerUbicacion();

        if (!coordenadas) {
            setCargando(false);
            return;
        }

        const direccion = await Location.reverseGeocodeAsync({
            latitude: coordenadas.latitud,
            longitude: coordenadas.longitud
        });

        let direccionTexto = "";
        if (direccion.length > 0) {

            direccionTexto =
                (direccion[0].street || "") + " " +
                (direccion[0].name || "") + " " +
                (direccion[0].city || "") + " " +
                (direccion[0].country || "");
        }

        const resultado = await ficharDesdeApp(
            baseDatos,
            uid,
            password,
            empleadoId,
            coordenadas.latitud,
            coordenadas.longitud,
            direccionTexto
        );

        if (resultado.exito) {

            // 🔥 Actualizamos estado usando respuesta directa del backend
            if (resultado.datos.estado === "entrada") {
                setTrabajando(true);
                setHoraEntrada(resultado.datos.timestamp);
            } else {
                setTrabajando(false);
                setHoraEntrada(null);
            }

            Alert.alert(
                "Fichaje correcto",
                resultado.datos.estado === "entrada"
                    ? "Jornada iniciada correctamente"
                    : "Jornada finalizada correctamente"
            );

        } else {
            Alert.alert("Error", resultado.mensaje);
        }

        setCargando(false);
    };

    return (
        <View style={styles.contenedor}>

            <Text style={styles.titulo}>
                {trabajando
                    ? "🟢 Estás trabajando"
                    : "⚪ No estás trabajando"}
            </Text>

            {trabajando && horaEntrada && (
                <Text style={styles.subtitulo}>
                    Jornada iniciada a las {new Date(horaEntrada + "Z").toLocaleTimeString()}
                </Text>
            )}

            {trabajando && (
                <Text style={styles.contador}>
                    Tiempo trabajado: {tiempoTrabajado}
                </Text>
            )}

            {/* Botón principal dinámico */}
            <TouchableOpacity
                style={[
                    styles.botonPrincipal,
                    trabajando ? styles.botonSalida : styles.botonEntrada
                ]}
                onPress={manejarFichaje}
                disabled={cargando}
            >
                {cargando ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.textoBotonPrincipal}>
                        {trabajando
                            ? "Finalizar jornada"
                            : "Iniciar jornada"}
                    </Text>
                )}
            </TouchableOpacity>

            <View style={{ height: 30 }} />

            {/* Botón Fichaje Manual */}
            <TouchableOpacity
                style={styles.botonSecundario}
                onPress={() => navigation.navigate("FichajeManual")}
            >
                <Text style={styles.textoBotonSecundario}>
                    Fichaje manual
                </Text>
            </TouchableOpacity>

            <View style={{ height: 15 }} />

            {/* Botón Nueva Justificación */}
            <TouchableOpacity
                style={styles.botonSecundario}
                onPress={() => navigation.navigate("Justificacion")}
            >
                <Text style={styles.textoBotonSecundario}>
                    Nueva justificación
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    contenedor: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },

    titulo: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 10
    },

    subtitulo: {
        marginBottom: 20,
        color: "#555"
    },

    botonPrincipal: {
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 12,
        minWidth: 250,
        alignItems: "center"
    },

    botonEntrada: {
        backgroundColor: "#2F5D9F"
    },

    botonSalida: {
        backgroundColor: "#C0392B"
    },

    textoBotonPrincipal: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600"
    },

    botonSecundario: {
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#2F5D9F",
        minWidth: 220,
        alignItems: "center"
    },

    textoBotonSecundario: {
        color: "#2F5D9F",
        fontWeight: "600"
    },

    contador: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 20,
        color: "#2F5D9F"
    },

});