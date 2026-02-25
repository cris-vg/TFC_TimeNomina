import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
    ScrollView
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';

import { AuthContext } from '../context/AuthContext';
import { crearJustificacion } from '../services/odooService';

export default function JustificacionScreen({ navigation }) {

    const { uid, password, empleadoId } = useContext(AuthContext);

    const [tipo, setTipo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [archivoBase64, setArchivoBase64] = useState(null);
    const [nombreArchivo, setNombreArchivo] = useState('');
    const [cargando, setCargando] = useState(false);

    const baseDatos = "attendance_app";

    const TIPOS_JUSTIFICACION = [
        { label: "Retraso", value: "retraso" },
        { label: "Olvido de fichaje", value: "olvido" },
        { label: "Salida anticipada", value: "salida_anticipada" },
        { label: "Ausencia parcial", value: "ausencia_parcial" },
        { label: "Otro", value: "otro" },
    ];

    // 📎 Seleccionar documento
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

    // 📤 Enviar justificación
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
        <ScrollView contentContainerStyle={styles.contenedor}>

            <Text style={styles.titulo}>
                Nueva Justificación
            </Text>

            {/* Selector de tipo */}
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

            {/* Descripción */}
            <TextInput
                style={styles.textArea}
                placeholder="Describe el motivo..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
            />

            {/* Adjuntar documento */}
            <View style={{ marginBottom: 15 }}>
                <Button
                    title="Adjuntar documento"
                    onPress={seleccionarDocumento}
                />

                {nombreArchivo !== "" && (
                    <Text style={{ marginTop: 10 }}>
                        📎 {nombreArchivo}
                    </Text>
                )}
            </View>

            <Button
                title={cargando ? "Enviando..." : "Enviar Justificación"}
                onPress={manejarEnvio}
            />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    picker: {
        marginBottom: 15
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        height: 120,
        textAlignVertical: 'top'
    }
});