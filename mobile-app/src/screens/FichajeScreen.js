// src/screens/FichajeScreen.js

import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';

import { AuthContext } from '../context/AuthContext';
import { ficharDesdeApp } from '../services/odooService';

export default function FichajeScreen() {

    const { uid, password, empleadoId, nombreEmpleado } = useContext(AuthContext);
    const [cargando, setCargando] = useState(false);

    const baseDatos = "attendance_app";

    const obtenerUbicacion = async () => {

        // 1️⃣ Pedir permisos
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert("Permiso denegado", "No se puede acceder a la ubicación");
            return null;
        }

        // 2️⃣ Obtener posición actual
        const ubicacion = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
        });

        return {
            latitud: ubicacion.coords.latitude,
            longitud: ubicacion.coords.longitude
        };
    };

    const manejarFichaje = async () => {

        if (!empleadoId) {
            Alert.alert("Error", "No hay empleado vinculado");
            return;
        }

        setCargando(true);

        // 🔎 Obtener GPS real
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

        setCargando(false);

        if (resultado.exito) {
            Alert.alert(
                "Fichaje correcto",
                "Empleado: " + nombreEmpleado +
                "\nEstado: " + resultado.datos.estado +
                "\nLat: " + coordenadas.latitud.toFixed(5) +
                "\nLng: " + coordenadas.longitud.toFixed(5)
            );
        } else {
            Alert.alert("Error", resultado.mensaje);
        }
    };

    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>Empleado: {nombreEmpleado}</Text>

            <Button
                title={cargando ? "Fichando..." : "Fichar con GPS"}
                onPress={manejarFichaje}
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
    },
});