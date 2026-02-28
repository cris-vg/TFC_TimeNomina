// ======================================================
// 📌 FichajeManualScreen
// Pantalla para registrar un fichaje manual.
// - Permite elegir tipo (entrada/salida)
// - Seleccionar fecha y hora
// - Introducir motivo obligatorio
// - Envía el fichaje a revisión en backend
// ======================================================

import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

import { AuthContext } from '../context/AuthContext';
import { fichajeManual } from '../services/odooService';

export default function FichajeManualScreen({ navigation }) {

    const { uid, password, empleadoId } = useContext(AuthContext);

    const baseDatos = "attendance_app";

    // ================= ESTADOS =================

    const [tipo, setTipo] = useState("entrada");
    const [fecha, setFecha] = useState(new Date());
    const [modoPicker, setModoPicker] = useState(null); // 'date' o 'time'
    const [motivo, setMotivo] = useState("");
    const [cargando, setCargando] = useState(false);

    /**
     * =====================================================
     * 📤 MANEJAR ENVÍO DE FICHAJE MANUAL
     * =====================================================
     * Valida motivo obligatorio y envía datos al backend.
     */
    const manejarEnvio = async () => {

        if (!motivo.trim()) {
            Alert.alert("Error", "El motivo es obligatorio");
            return;
        }

        setCargando(true);

        const fechaHoraISO = fecha
            .toISOString()
            .replace('T', ' ')
            .split('.')[0];

        const resultado = await fichajeManual(
            baseDatos,
            uid,
            password,
            empleadoId,
            fechaHoraISO,
            tipo,
            motivo
        );

        setCargando(false);

        if (resultado.exito) {
            Alert.alert("Correcto", "Fichaje manual enviado a revisión", [
                {
                    text: "Aceptar",
                    onPress: () => navigation.goBack()
                }
            ]);
        } else {
            Alert.alert("Error", resultado.mensaje);
        }
    };

    return (

        <View style={styles.container}>

            <Text style={styles.title}>
                Fichaje Manual
            </Text>

            {/* =====================================================
               🧩 TARJETA TIPO
            ===================================================== */}
            <View style={styles.card}>
                <Text style={styles.label}>Tipo de fichaje</Text>

                <Picker
                    selectedValue={tipo}
                    onValueChange={(itemValue) => setTipo(itemValue)}
                >
                    <Picker.Item label="Entrada" value="entrada" />
                    <Picker.Item label="Salida" value="salida" />
                </Picker>
            </View>

            {/* =====================================================
               📅 SELECCIÓN FECHA Y HORA
            ===================================================== */}
            <View style={styles.card}>
                <Text style={styles.label}>Fecha y hora</Text>

                <TouchableOpacity
                    style={styles.botonSecundario}
                    onPress={() => setModoPicker('date')}
                >
                    <Text style={styles.textoSecundario}>
                        Seleccionar fecha
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.botonSecundario}
                    onPress={() => setModoPicker('time')}
                >
                    <Text style={styles.textoSecundario}>
                        Seleccionar hora
                    </Text>
                </TouchableOpacity>

                <Text style={styles.fechaSeleccionada}>
                    {fecha.toLocaleString("es-ES")}
                </Text>
            </View>

            {modoPicker && (
                <DateTimePicker
                    value={fecha}
                    mode={modoPicker}
                    display="default"
                    onChange={(event, selectedDate) => {
                        setModoPicker(null);
                        if (selectedDate) {
                            setFecha(selectedDate);
                        }
                    }}
                />
            )}

            {/* =====================================================
               ✏ MOTIVO
            ===================================================== */}
            <View style={styles.card}>
                <Text style={styles.label}>Motivo</Text>

                <TextInput
                    style={styles.textArea}
                    placeholder="Describe el motivo..."
                    value={motivo}
                    onChangeText={setMotivo}
                    multiline
                />
            </View>

            {/* =====================================================
               📤 BOTÓN ENVIAR
            ===================================================== */}
            <TouchableOpacity
                style={styles.botonPrincipal}
                onPress={manejarEnvio}
                disabled={cargando}
            >
                {cargando ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.textoBoton}>
                        Enviar a revisión
                    </Text>
                )}
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 20
    },

    title: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 20,
        color: "#2F5D9F"
    },

    card: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 }
    },

    label: {
        fontWeight: "600",
        marginBottom: 8,
        color: "#555"
    },

    botonSecundario: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#2F5D9F",
        marginBottom: 8,
        alignItems: "center"
    },

    textoSecundario: {
        color: "#2F5D9F",
        fontWeight: "600"
    },

    fechaSeleccionada: {
        marginTop: 8,
        fontSize: 13,
        color: "#666"
    },

    textArea: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 12,
        height: 100,
        textAlignVertical: "top"
    },

    botonPrincipal: {
        marginTop: 10,
        backgroundColor: "#2F5D9F",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    textoBoton: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16
    }

});