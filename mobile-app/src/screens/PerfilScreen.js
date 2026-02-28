import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { obtenerPerfil } from '../services/odooService';

export default function PerfilScreen() {

    const { uid, password, empleadoId } = useContext(AuthContext);
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);

    const baseDatos = "attendance_app";

    useEffect(() => {
        cargarPerfil();
    }, []);

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

    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" />
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
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titulo}>{perfil.nombre}</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Email:</Text>
                <Text>{perfil.email}</Text>

                <Text style={styles.label}>Teléfono:</Text>
                <Text>{perfil.telefono}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Puesto:</Text>
                <Text>{perfil.puesto}</Text>

                <Text style={styles.label}>Departamento:</Text>
                <Text>{perfil.departamento}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Hora entrada:</Text>
                <Text>{perfil.hora_entrada || "-"}</Text>

                <Text style={styles.label}>Hora salida:</Text>
                <Text>{perfil.hora_salida || "-"}</Text>

                <Text style={styles.label}>Margen permitido:</Text>
                <Text>{perfil.margen_minutos} minutos</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20
    },
    titulo: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center"
    },
    card: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15
    },
    label: {
        fontWeight: "bold",
        marginTop: 10
    },
    cargando: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});