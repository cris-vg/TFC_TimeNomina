// ======================================================
// 📌 DetalleNominaScreen
// Pantalla de detalle de una nómina concreta.
// - Muestra desglose salarial
// - Permite descargar el PDF generado en Odoo
// - Mantiene coherencia visual con la app
// ======================================================

import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    Platform
} from 'react-native';

import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

import { descargarNominaPDF } from '../services/odooService';
import { AuthContext } from '../context/AuthContext';

export default function DetalleNominaScreen({ route }) {

    const { nomina } = route.params;
    const { uid, password } = useContext(AuthContext);

    const baseDatos = "attendance_app";

    /**
     * =====================================================
     * 📅 FORMATEAR MES
     * =====================================================
     * Convierte número de mes a texto en español.
     */
    const formatearMes = (mes) => {

        const meses = {
            1: "Enero",
            2: "Febrero",
            3: "Marzo",
            4: "Abril",
            5: "Mayo",
            6: "Junio",
            7: "Julio",
            8: "Agosto",
            9: "Septiembre",
            10: "Octubre",
            11: "Noviembre",
            12: "Diciembre"
        };

        return meses[Number(mes)] || mes;
    };

    /**
     * =====================================================
     * 📄 DESCARGAR PDF DE NÓMINA
     * =====================================================
     * Solicita el PDF en base64 al backend,
     * lo guarda en el dispositivo y lo abre.
     */
    const descargarPDF = async () => {

        try {

            const resultado = await descargarNominaPDF(
                baseDatos,
                uid,
                password,
                nomina.id
            );

            if (!resultado || !resultado.success) {
                Alert.alert("Error", "No se pudo descargar la nómina.");
                return;
            }

            const uri = FileSystem.documentDirectory + resultado.filename;

            await FileSystem.writeAsStringAsync(
                uri,
                resultado.pdf_base64,
                { encoding: "base64" }
            );

            if (Platform.OS === "android") {

                const contentUri = await FileSystem.getContentUriAsync(uri);

                await IntentLauncher.startActivityAsync(
                    "android.intent.action.VIEW",
                    {
                        data: contentUri,
                        flags: 1,
                        type: "application/pdf",
                    }
                );

            } else {
                await Sharing.shareAsync(uri);
            }

        } catch (error) {

            console.error("Error descargando PDF:", error);
            Alert.alert("Error", "Ocurrió un problema al abrir el PDF.");
        }
    };

    return (

        <ScrollView contentContainerStyle={styles.container}>

            {/* =====================================================
               📌 CABECERA
            ===================================================== */}
            <Text style={styles.titulo}>
                {formatearMes(nomina.mes)} {nomina.anio}
            </Text>

            {/* =====================================================
               🧾 TARJETA RESUMEN SALARIAL
            ===================================================== */}
            <View style={styles.tarjeta}>

                <View style={styles.fila}>
                    <Text style={styles.label}>Salario base</Text>
                    <Text style={styles.valor}>
                        {nomina.salario_base?.toFixed(2)} €
                    </Text>
                </View>

                <View style={styles.fila}>
                    <Text style={styles.label}>Horas extra</Text>
                    <Text style={styles.valor}>
                        {nomina.horas_extra}
                    </Text>
                </View>

                <View style={styles.fila}>
                    <Text style={styles.label}>Precio hora extra</Text>
                    <Text style={styles.valor}>
                        {nomina.precio_hora_extra?.toFixed(2)} €
                    </Text>
                </View>

                <View style={styles.fila}>
                    <Text style={styles.label}>Complementos</Text>
                    <Text style={styles.valor}>
                        {nomina.complementos?.toFixed(2)} €
                    </Text>
                </View>

                {/* Separador */}
                <View style={styles.divisor} />

                <View style={styles.fila}>
                    <Text style={styles.totalLabel}>Total bruto</Text>
                    <Text style={styles.totalValor}>
                        {nomina.total_bruto?.toFixed(2)} €
                    </Text>
                </View>

            </View>

            {/* =====================================================
               ⬇ BOTÓN DESCARGA PDF
            ===================================================== */}
            <TouchableOpacity
                style={styles.botonDescarga}
                onPress={descargarPDF}
            >
                <Ionicons
                    name="download-outline"
                    size={18}
                    color="#FFFFFF"
                />
                <Text style={styles.textoBoton}>
                    Descargar PDF
                </Text>
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

    tarjeta: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 14,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }
    },

    fila: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12
    },

    label: {
        color: "#555"
    },

    valor: {
        fontWeight: "500"
    },

    divisor: {
        height: 1,
        backgroundColor: "#E5E5E5",
        marginVertical: 15
    },

    totalLabel: {
        fontWeight: "600",
        fontSize: 16
    },

    totalValor: {
        fontWeight: "700",
        fontSize: 18,
        color: "#2F5D9F"
    },

    botonDescarga: {
        marginTop: 25,
        backgroundColor: "#2F5D9F",
        paddingVertical: 15,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8
    },

    textoBoton: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 15
    }

});