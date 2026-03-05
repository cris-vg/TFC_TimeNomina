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
    const [busqueda, setBusqueda] = useState("");

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

    const formatearHora = (fecha) => {
        if (!fecha) return "—";
        const date = new Date(fecha + "Z");
        return date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Madrid"
        });
    };


    const formatearFecha = (fecha) => {
        if (!fecha) return "—";
        const date = new Date(fecha + "Z");
        return date.toLocaleDateString("es-ES", {
            timeZone: "Europe/Madrid",
        });
    };

    const formatearHorasNaturales = (horas) => {

        if (!horas) return "0h";

        const totalMinutos = Math.round(horas * 60);
        const h = Math.floor(totalMinutos / 60);
        const m = totalMinutos % 60;

        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    };
    const registrosFiltrados = registros.filter((item) => {
        const texto = busqueda.toLowerCase();

        const fecha = formatearFecha(item.check_in).toLowerCase();
        const horas = (item.worked_hours?.toFixed(2) || "0").toLowerCase();

        return (
            fecha.includes(texto) || horas.includes(texto)
        );
    });

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

    const renderItem = ({ item }) => {
        const entrada = item.check_in ? new Date(item.check_in + "Z") : null;
        const salida = item.check_out ? new Date(item.check_out + "Z") : null;

        const mismoDia =
            entrada &&
            salida &&
            entrada.toDateString() === salida.toDateString();
        return (
            <View style={styles.tarjeta}>

                <View style={styles.barraLateral} />
                <Text style={styles.titulo}>
                    {formatearFecha(item.check_in)}
                </Text>

                {/*ENTRADA*/}

                <View style={styles.lineaFila}>
                    <MaterialIcons name="login" size={18} color="#2e7d32" />
                    <Text style={styles.textoFila}>
                        Entrada: {formatearHora(item.check_in)}
                    </Text>
                </View>

                {/*SALIDA*/}

                <View style={styles.lineaFila}>
                    <MaterialIcons name="logout" size={18} color="#d9534f" />

                    <Text style={styles.textoFila}>
                        Salida: {
                            !salida
                                ? "-"
                                : mismoDia
                                    ? formatearHora(item.check_out)
                                    : formatearFecha(item.check_out) + " " + formatearHora(item.check_out)}
                    </Text>
                </View>

                {/*HORAS TRABAJADAS*/}

                <View style={styles.lineaFila}>
                    <MaterialIcons name="schedule" size={18} color="#556A9E" />
                    <Text style={styles.textoFila}>
                        Horas trabajadas: {formatearHorasNaturales(item.worked_hours)}
                    </Text>
                </View>

                {/*ESTADO*/}

                {!item.es_anomalia && !item.pendiente_confirmacion && (
                    <Text style={styles.estadoCorrecto}>
                        🟢 Correcto
                    </Text>
                )}
                {item.pendiente_confirmacion && (
                    <>
                        <Text style={styles.estadoPendiente}>
                            🟠 Pendiente revisión
                        </Text>
                        <Text style={styles.textoPendiente}>
                            RRHH ha modificado este fichaje
                        </Text>
                    </>
                )}
                {item.es_anomalia && (
                    <Text style={styles.estadoIrregular}>
                        🔴 Irregular
                    </Text>
                )}

                {/*UBICACIÓN ENTRADA*/}

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
                                Ver ubicación de entrada
                            </Text>
                        </TouchableOpacity>
                    )}

                {/*UBICACION SALIDA*/}

                {item.out_latitude !== null &&
                    item.out_latitude !== undefined &&
                    item.out_latitude !== 0 && (
                        <TouchableOpacity
                            style={styles.botonUbicacion}
                            onPress={() =>
                                navigation.navigate("Mapa", {
                                    latitud: item.out_latitude,
                                    longitud: item.out_longitude
                                })
                            }
                        >
                            <MaterialIcons name="place" size={18} color="#556A9E" />
                            <Text style={styles.textoUbicacion}>
                                Ver ubicación de salida
                            </Text>
                        </TouchableOpacity>
                    )}

                {item.pendiente_confirmacion && (
                    <View style={{ marginTop: 10 }}>
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
            </View>

        );
    };

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
            <View style={styles.buscadorContainer}>
                <MaterialIcons name="search" size={20} color="#556A9E" />
                <TextInput
                    style={styles.buscadorInput}
                    placeholder="Buscar fichaje..."
                    value={busqueda}
                    onChangeText={setBusqueda}
                />
            </View>

            <FlatList
                data={registrosFiltrados}
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

    lineaFila: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4
    },

    textoFila: {
        marginLeft: 6,
        color: "#333"
    },

    estadoCorrecto: {
        color: "#2e7d32",
        marginTop: 6,
        fontWeight: "600"
    },

    estadoPendiente: {
        color: "#f0ad4e",
        marginTop: 6,
        fontWeight: "600"
    },

    estadoIrregular: {
        color: "#d9534f",
        marginTop: 6,
        fontWeight: "600"
    },

    textoPendiente: {
        color: "#d9534f",
        marginTop: 4,
        fontSize: 13
    },

    botonUbicacion: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10
    },

    textoUbicacion: {
        marginLeft: 6,
        color: "#556A9E",
        fontWeight: "600"
    },

    buscadorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginTop: 15,
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 45,

        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 3
    },

    buscadorInput: {
        flex: 1,
        marginLeft: 8
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
    }
});