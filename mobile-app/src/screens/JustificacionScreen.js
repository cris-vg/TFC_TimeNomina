// ======================================================
// 📌 JustificacionScreen
// Pantalla para crear una nueva justificación.
// - Permite seleccionar tipo
// - Introducir descripción
// - Adjuntar documento opcional
// - Enviar al backend Odoo
// ======================================================

import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import { crearJustificacion } from '../services/odooService';

export default function JustificacionScreen({ navigation }) {

    const { uid, password, empleadoId } = useContext(AuthContext);

    // 📦 Estados locales
    const [tipo, setTipo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [archivoBase64, setArchivoBase64] = useState(null);
    const [nombreArchivo, setNombreArchivo] = useState('');
    const [cargando, setCargando] = useState(false);

    const baseDatos = "attendance_app";

    /**
     * =====================================================
     * 📑 TIPOS DISPONIBLES DE JUSTIFICACIÓN
     * =====================================================
     */
    const TIPOS_JUSTIFICACION = [
        { label: "Retraso", value: "retraso" },
        { label: "Olvido de fichaje", value: "olvido" },
        { label: "Salida anticipada", value: "salida_anticipada" },
        { label: "Ausencia parcial", value: "ausencia_parcial" },
        { label: "Otro", value: "otro" },
    ];

    /**
     * =====================================================
     * 📎 SELECCIONAR DOCUMENTO
     * =====================================================
     * Permite adjuntar imagen o PDF como evidencia.
     */
    const seleccionarDocumento = async () => {

        const resultado = await DocumentPicker.getDocumentAsync({
            type: ["image/*", "application/pdf"],
            copyToCacheDirectory: true
        });

        if (resultado.canceled) return;

        const archivo = resultado.assets[0];

        try {
            const response = await fetch(archivo.uri);
            const blob = await response.blob();

            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = () => {
                const base64data = reader.result.split(',')[1];
                setArchivoBase64(base64data);
                setNombreArchivo(archivo.name);
            };

        } catch (error) {
            Alert.alert("Error", "No se pudo procesar el archivo");
        }
    };

    /**
     * =====================================================
     * 📤 ENVIAR JUSTIFICACIÓN
     * =====================================================
     * Valida campos y envía datos al backend.
     */
    const manejarEnvio = async () => {

        if (!tipo) {
            Alert.alert("Error", "Selecciona un tipo");
            return;
        }

        if (!descripcion.trim()) {
            Alert.alert("Error", "Escribe una descripción");
            return;
        }

        if (!empleadoId) {
            Alert.alert("Error", "No hay empleado vinculado");
            return;
        }

        setCargando(true);

        const resultado = await crearJustificacion(
            baseDatos,
            uid,
            password,
            empleadoId,
            tipo,
            descripcion,
            archivoBase64,
            nombreArchivo
        );

        setCargando(false);

        if (resultado.exito) {
            Alert.alert("Correcto", "Justificación enviada", [
                { text: "Aceptar", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Error", resultado.mensaje);
        }
    };

    return (

        <ScrollView contentContainerStyle={styles.container}>

            <Text style={styles.titulo}>
                Nueva Justificación
            </Text>

            {/* =====================================================
               🧩 SELECTOR DE TIPO
            ===================================================== */}
            <View style={styles.card}>
                <Text style={styles.label}>Tipo</Text>

                <Picker
                    selectedValue={tipo}
                    onValueChange={(itemValue) => setTipo(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Selecciona tipo..." value="" />
                    {TIPOS_JUSTIFICACION.map((item) => (
                        <Picker.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                        />
                    ))}
                </Picker>
            </View>

            {/* =====================================================
               ✏ DESCRIPCIÓN
            ===================================================== */}
            <View style={styles.card}>
                <Text style={styles.label}>Descripción</Text>

                <TextInput
                    style={styles.textArea}
                    placeholder="Describe el motivo..."
                    value={descripcion}
                    onChangeText={setDescripcion}
                    multiline
                />
            </View>

            {/* =====================================================
               📎 ADJUNTAR DOCUMENTO
            ===================================================== */}
            <TouchableOpacity
                style={styles.botonSecundario}
                onPress={seleccionarDocumento}
            >
                <Ionicons name="attach-outline" size={18} color="#2F5D9F" />
                <Text style={styles.textoSecundario}>
                    Adjuntar documento
                </Text>
            </TouchableOpacity>

            {nombreArchivo !== "" && (
                <Text style={styles.archivoSeleccionado}>
                    📎 {nombreArchivo}
                </Text>
            )}

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
                        Enviar Justificación
                    </Text>
                )}
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({

    container: {
        padding: 20
    },

    titulo: {
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

    picker: {
        marginTop: -8
    },

    textArea: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 12,
        height: 120,
        textAlignVertical: "top"
    },

    botonPrincipal: {
        marginTop: 20,
        backgroundColor: "#2F5D9F",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center"
    },

    textoBoton: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16
    },

    botonSecundario: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10
    },

    textoSecundario: {
        color: "#2F5D9F",
        fontWeight: "600"
    },

    archivoSeleccionado: {
        fontSize: 13,
        marginBottom: 15,
        color: "#555"
    }

});