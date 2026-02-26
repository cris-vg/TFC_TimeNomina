// src/screens/HistorialScreen.js

import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { obtenerHistorial } from '../services/odooService';

export default function HistorialScreen({ navigation }) {

    const { uid, password, empleadoId } = useContext(AuthContext);

    const [registros, setRegistros] = useState([]);
    const [cargando, setCargando] = useState(true);

    const baseDatos = "attendance_app";

    useEffect(() => {
        cargarHistorial();
    }, []);

    const cargarHistorial = async () => {

        const resultado = await obtenerHistorial(
            baseDatos,
            uid,
            password,
            empleadoId
        );

        if (resultado.exito) {
            setRegistros(resultado.datos);
        }

        setCargando(false);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "—";

        const date = new Date(fecha + "Z");
        return date.toLocaleString();
    };

    const renderItem = ({ item }) => (
        <View style={styles.tarjeta}>

            <Text style={styles.titulo}>
                Entrada: {formatearFecha(item.check_in)}
            </Text>

            <Text>
                Salida: {formatearFecha(item.check_out)}
            </Text>

            <Text>
                Horas trabajadas: {item.worked_hours?.toFixed(2) || "0"}
            </Text>
            {item.es_anomalia && (
                <Text style={{ color: "red", marginTop: 5 }}>
                    ⚠ Fichaje irregular - pendiente revisión RRHH
                </Text>
            )}
            {item.pendiente_confirmacion && (
                <Text style={{ color: "#d9534f", marginTop: 5 }}>
                    ⚠ Este fichaje fue modificado por RRHH.
                    Nos pondremos en contacto contigo para solucionarlo.
                </Text>
            )}

            {item.in_latitude !== null &&
                item.in_latitude !== undefined &&
                item.in_latitude !== 0 && (

                    <TouchableOpacity
                        style={styles.botonMapa}
                        onPress={() =>
                            navigation.navigate("Mapa", {
                                latitud: item.in_latitude,
                                longitud: item.in_longitude
                            })
                        }
                    >
                        <Text style={styles.textoBoton}>Ver ubicación</Text>
                    </TouchableOpacity>

                )}

        </View>
    );

    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <FlatList
            data={registros}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 15 }}
        />
    );
}

const styles = StyleSheet.create({
    tarjeta: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    titulo: {
        fontWeight: "bold",
        marginBottom: 5,
    },
    botonMapa: {
        marginTop: 10,
        backgroundColor: "#007bff",
        padding: 8,
        borderRadius: 5,
        alignItems: "center"
    },
    textoBoton: {
        color: "white"
    },
    cargando: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});