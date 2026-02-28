// src/screens/HistorialScreen.js

import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    Button
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import {
    obtenerHistorial,
    aceptarModificacion,
    rechazarModificacion
} from '../services/odooService';

export default function HistorialScreen({ navigation }) {

    const { uid, password, empleadoId } = useContext(AuthContext);

    const [registros, setRegistros] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState("");
    const [attendanceSeleccionado, setAttendanceSeleccionado] = useState(null);

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

    const manejarAceptar = async (attendanceId) => {

        const resultado = await aceptarModificacion(
            baseDatos,
            uid,
            password,
            attendanceId
        );

        console.log("Respuesta aceptar:", resultado);

        if (resultado?.success) {
            Alert.alert("Correcto", "Modificación aceptada");
            cargarHistorial();
        } else {
            Alert.alert("Error", resultado?.message || "Error");
        }
    };

    const abrirModalRechazo = (attendanceId) => {
        setAttendanceSeleccionado(attendanceId);
        setModalVisible(true);
    };

    const confirmarRechazo = async () => {

        if (!motivoRechazo.trim()) {
            Alert.alert("Error", "Debes indicar un motivo");
            return;
        }

        const resultado = await rechazarModificacion(
            baseDatos,
            uid,
            password,
            attendanceSeleccionado,
            motivoRechazo
        );

        console.log("Respuesta rechazar:", resultado);

        if (resultado?.success) {
            Alert.alert("Correcto", "Modificación rechazada");
            setModalVisible(false);
            setMotivoRechazo("");
            cargarHistorial();
        } else {
            Alert.alert("Error", resultado?.message || "Error");
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.tarjeta}>
            <Text>ID: {item.id}</Text>
            <Text>Pendiente: {item.pendiente_confirmacion ? "Sí" : "No"}</Text>

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
                <View style={{ marginTop: 10 }}>

                    <Text style={{ color: "#d9534f", marginBottom: 5 }}>
                        ⚠ RRHH ha modificado este fichaje.
                    </Text>

                    <TouchableOpacity
                        style={[styles.botonAccion, { backgroundColor: "green" }]}
                        onPress={() => manejarAceptar(item.id)}
                    >
                        <Text style={styles.textoBoton}>Aceptar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.botonAccion, { backgroundColor: "red", marginTop: 5 }]}
                        onPress={() => abrirModalRechazo(item.id)}
                    >
                        <Text style={styles.textoBoton}>Rechazar</Text>
                    </TouchableOpacity>

                </View>
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
        <View style={{ flex: 1 }}>

            <FlatList
                data={registros}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 15 }}
            />

            {/* Modal rechazo */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContenido}>
                        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                            Motivo del rechazo
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={motivoRechazo}
                            onChangeText={setMotivoRechazo}
                            placeholder="Escribe el motivo..."
                            multiline
                        />

                        <Button title="Confirmar" onPress={confirmarRechazo} />
                        <Button title="Cancelar" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>

        </View>
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
    botonAccion: {
        padding: 8,
        borderRadius: 5,
        alignItems: "center"
    },
    cargando: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 20
    },
    modalContenido: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        height: 100,
        marginBottom: 10,
        textAlignVertical: "top"
    }
});