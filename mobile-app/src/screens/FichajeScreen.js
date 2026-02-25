// src/screens/FichajeScreen.js

import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';

import { AuthContext } from '../context/AuthContext';
import { ficharDesdeApp } from '../services/odooService';

export default function FichajeScreen({ navigation }) {

    const { uid, password, empleadoId, nombreEmpleado } = useContext(AuthContext);
    const [cargando, setCargando] = useState(false);

    const baseDatos = "attendance_app";

    /**
     * 📍 Obtener ubicación GPS real
     */
    const obtenerUbicacion = async () => {

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert("Permiso denegado", "No se puede acceder a la ubicación");
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
     * 🏠 Convertir coordenadas en dirección real
     */
    const obtenerDireccion = async (latitud, longitud) => {

        try {
            const resultado = await Location.reverseGeocodeAsync({
                latitude: latitud,
                longitude: longitud,
            });

            if (resultado.length > 0) {

                const direccion = resultado[0];

                return `
${direccion.street || ""} ${direccion.name || ""}
${direccion.city || ""}
${direccion.region || ""}
${direccion.country || ""}
                `;
            }

            return "Dirección no encontrada";

        } catch (error) {
            return "Error obteniendo dirección";
        }
    };

    /**
     * 🕒 Ejecutar fichaje
     */
    const manejarFichaje = async () => {

        if (!empleadoId) {
            Alert.alert("Error", "No hay empleado vinculado");
            return;
        }

        setCargando(true);

        const coordenadas = await obtenerUbicacion();

        if (!coordenadas) {
            setCargando(false);
            return;
        }

        const resultado = await ficharDesdeApp(
            baseDatos,
            uid,
            password,
            empleadoId,
            coordenadas.latitud,
            coordenadas.longitud
        );

        if (resultado.exito) {

            const direccion = await obtenerDireccion(
                coordenadas.latitud,
                coordenadas.longitud
            );

            setCargando(false);

            Alert.alert(
                "Fichaje correcto",
                "Empleado: " + nombreEmpleado +
                "\nEstado: " + resultado.datos.estado +
                "\n\nDirección:\n" + direccion,
                [
                    {
                        text: "Ver ubicación",
                        onPress: () => navigation.navigate("Mapa", {
                            latitud: coordenadas.latitud,
                            longitud: coordenadas.longitud
                        })
                    }
                ]
            );

        } else {
            setCargando(false);
            Alert.alert("Error", resultado.mensaje);
        }
    };

    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>
                Empleado: {nombreEmpleado}
            </Text>

            <Button
                title={cargando ? "Fichando..." : "Fichar con GPS"}
                onPress={manejarFichaje}
            />
            {/* Espacio visual */}
            <View style={{ height: 20 }} />

            {/* Botón nueva justificación */}
            <Button
                title="Nueva Justificación"
                onPress={() => navigation.navigate("Justificacion")}
            />
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
        marginBottom: 20,
        textAlign: "center"
    },
});