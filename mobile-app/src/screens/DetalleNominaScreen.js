import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Button,
    Alert
} from 'react-native';

import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

import { descargarNominaPDF } from '../services/odooService';
import { AuthContext } from '../context/AuthContext';

export default function DetalleNominaScreen({ route }) {

    const { nomina } = route.params;
    const { uid, password } = useContext(AuthContext);

    const baseDatos = "attendance_app";

    const formatearMes = (mes) => {
        const meses = {
            "1": "Enero",
            "2": "Febrero",
            "3": "Marzo",
            "4": "Abril",
            "5": "Mayo",
            "6": "Junio",
            "7": "Julio",
            "8": "Agosto",
            "9": "Septiembre",
            "10": "Octubre",
            "11": "Noviembre",
            "12": "Diciembre"
        };
        return meses[mes] || mes;
    };

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

            <Text style={styles.titulo}>
                Nómina {formatearMes(nomina.mes)} {nomina.anio}
            </Text>

            <View style={styles.tarjeta}>

                <Text>
                    Salario base: {nomina.salario_base?.toFixed(2)} €
                </Text>

                <Text>
                    Horas extra: {nomina.horas_extra}
                </Text>

                <Text>
                    Precio hora extra: {nomina.precio_hora_extra?.toFixed(2)} €
                </Text>

                <Text>
                    Complementos: {nomina.complementos?.toFixed(2)} €
                </Text>

                <Text style={styles.total}>
                    Total bruto: {nomina.total_bruto?.toFixed(2)} €
                </Text>

                <View style={{ marginTop: 15 }}>
                    <Button
                        title="Descargar PDF"
                        onPress={descargarPDF}
                    />
                </View>

            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20
    },
    titulo: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15
    },
    tarjeta: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10
    },
    total: {
        marginTop: 10,
        fontWeight: "bold",
        fontSize: 16
    }
});