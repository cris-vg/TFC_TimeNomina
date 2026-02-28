// src/screens/HistorialScreen.js

/**
 * ==================================================
 * HistorialScreen - TimeNomina
 * --------------------------------------------------
 * Muestra listado de fichajes del empleado.
 *
 * Características:
 * - Cabecera corporativa degradada
 * - Fade-in al cargar
 * - Tarjetas premium flotantes
 * - Microdetalle lateral azul
 * - Estados visuales claros (anomalía / pendiente)
 * - Modal estilizado coherente con identidad
 * ==================================================
 */

import React, { useContext, useEffect, useState, useRef } from 'react';
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
    Animated
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import {
    obtenerHistorial,
    aceptarModificacion,
    rechazarModificacion
} from '../services/odooService';

export default function HistorialScreen({ navigation }) {

    const { uid, password, empleadoId, nombreEmpleado } = useContext(AuthContext);

    const [registros, setRegistros] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState("");
    const [attendanceSeleccionado, setAttendanceSeleccionado] = useState(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const baseDatos = "attendance_app";

    useEffect(() => {
        cargarHistorial();
    }, []);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
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

            <View style={styles.barraLateral} />

            <Text style={styles.titulo}>
                {formatearFecha(item.check_in)}
            </Text>

            <Text style={styles.texto}>
                Salida: {formatearFecha(item.check_out)}
            </Text>

            <Text style={styles.texto}>
                Horas: {item.worked_hours?.toFixed(2) || "0"}
            </Text>

            {item.es_anomalia && (
                <View style={styles.estadoWarning}>
                    <MaterialIcons name="warning" size={18} color="#d9534f" />
                    <Text style={styles.textoWarning}>
                        Fichaje irregular - revisión RRHH
                    </Text>
                </View>
            )}

            {item.pendiente_confirmacion && (
                <View style={{ marginTop: 10 }}>

                    <Text style={styles.textoPendiente}>
                        RRHH ha modificado este fichaje
                    </Text>

                    <TouchableOpacity
                        style={styles.botonPrimario}
                        onPress={() => manejarAceptar(item.id)}
                    >
                        <Text style={styles.textoBoton}>
                            Aceptar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.botonSecundario}
                        onPress={() => abrirModalRechazo(item.id)}
                    >
                        <Text style={styles.textoBotonSecundario}>
                            Rechazar
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {item.in_latitude !== null &&
                item.in_latitude !== undefined &&
                item.in_latitude !== 0 && (
                    <TouchableOpacity
                        style={styles.botonUbicacion}
                        onPress={() =>
                            navigation.navigate("Mapa", {
                                latitud: item.in_latitude,
                                longitud: item.in_longitude
                            })
                        }
                    >
                        <MaterialIcons name="place" size={18} color="#556A9E" />
                        <Text style={styles.textoUbicacion}>
                            Ver ubicación
                        </Text>
                    </TouchableOpacity>
                )}

        </View>
    );

    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" color="#556A9E" />
            </View>
        );
    }

    return (
        <Animated.View style={[styles.contenedor, { opacity: fadeAnim }]}>

            <LinearGradient
                colors={["#3A4A6A", "#556A9E"]}
                style={styles.cabecera}
            >
                <Text style={styles.tituloCabecera}>
                    Historial de fichajes
                </Text>
            </LinearGradient>

            <FlatList
                data={registros}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
            />

            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContenido}>
                        <Text style={styles.modalTitulo}>
                            Motivo del rechazo
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={motivoRechazo}
                            onChangeText={setMotivoRechazo}
                            placeholder="Escribe el motivo..."
                            multiline
                        />

                        <TouchableOpacity
                            style={styles.botonPrimario}
                            onPress={confirmarRechazo}
                        >
                            <Text style={styles.textoBoton}>
                                Confirmar
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.botonSecundario}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.textoBotonSecundario}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
    },

    tituloCabecera: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold"
    },

    tarjeta: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        position: "relative",

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 12,
        elevation: 8
    },

    barraLateral: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 5,
        backgroundColor: "#556A9E",
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20
    },

    titulo: {
        fontWeight: "bold",
        color: "#1F2A44",
        marginBottom: 5
    },

    texto: {
        color: "#333",
        marginTop: 4
    },

    estadoWarning: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10
    },

    textoWarning: {
        color: "#d9534f",
        marginLeft: 6
    },

    textoPendiente: {
        color: "#d9534f",
        marginBottom: 10
    },

    botonPrimario: {
        backgroundColor: "#1F2A44",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 5
    },

    botonSecundario: {
        borderWidth: 1,
        borderColor: "#1F2A44",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8
    },

    textoBoton: {
        color: "#FFFFFF",
        fontWeight: "600"
    },

    textoBotonSecundario: {
        color: "#1F2A44",
        fontWeight: "600"
    },

    botonUbicacion: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12
    },

    textoUbicacion: {
        marginLeft: 6,
        color: "#556A9E",
        fontWeight: "600"
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
        borderRadius: 20
    },

    modalTitulo: {
        fontWeight: "bold",
        marginBottom: 10,
        fontSize: 16
    },

    input: {
        backgroundColor: "#F4F6FA",
        borderRadius: 12,
        padding: 12,
        height: 100,
        marginBottom: 10,
        textAlignVertical: "top"
    }
});