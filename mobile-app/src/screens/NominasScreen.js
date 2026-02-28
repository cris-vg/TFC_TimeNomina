// ======================================================
// 📌 NominasScreen
// Pantalla que muestra el listado de nóminas del empleado.
// - Consulta las nóminas desde Odoo
// - Muestra cada nómina en formato tarjeta
// - Permite navegar al detalle de la nómina
// ======================================================

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
import { obtenerNominas } from '../services/odooService';
import { Ionicons } from '@expo/vector-icons';

export default function NominasScreen({ navigation }) {

    // 🔐 Datos de autenticación del empleado
    const { uid, password, empleadoId } = useContext(AuthContext);

    // 📦 Estados locales
    const [nominas, setNominas] = useState([]);
    const [cargando, setCargando] = useState(true);

    const baseDatos = "attendance_app";

    /**
     * =====================================================
     * 🔄 CARGAR NÓMINAS AL ENTRAR EN LA PANTALLA
     * =====================================================
     * Se ejecuta una sola vez al montar el componente.
     */
    useEffect(() => {
        cargarNominas();
    }, []);

    /**
     * =====================================================
     * 📡 CONSULTA DE NÓMINAS AL BACKEND
     * =====================================================
     * Llama al servicio Odoo para obtener las nóminas
     * asociadas al empleado autenticado.
     */
    const cargarNominas = async () => {

        const resultado = await obtenerNominas(
            baseDatos,
            uid,
            password,
            empleadoId
        );

        if (resultado.success) {
            setNominas(resultado.nominas);
        }

        setCargando(false);
    };

    /**
     * =====================================================
     * 📅 FORMATEAR NÚMERO DE MES A TEXTO
     * =====================================================
     * Convierte el número de mes recibido desde backend
     * a nombre legible en español.
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
     * 🧾 RENDER DE CADA TARJETA DE NÓMINA
     * =====================================================
     */
    const renderItem = ({ item }) => (

        <TouchableOpacity
            style={styles.tarjeta}
            onPress={() =>
                navigation.navigate("DetalleNomina", { nomina: item })
            }
        >

            <Text style={styles.titulo}>
                {formatearMes(item.mes)} {item.anio}
            </Text>

            <View style={styles.filaTotal}>
                <Ionicons name="cash-outline" size={18} color="#2F5D9F" />
                <Text style={styles.total}>
                    {item.total_bruto?.toFixed(2)} €
                </Text>
            </View>

            <Text style={styles.detalle}>
                Ver detalle →
            </Text>

        </TouchableOpacity>
    );

    /**
     * =====================================================
     * ⏳ ESTADO DE CARGA
     * =====================================================
     */
    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" color="#2F5D9F" />
            </View>
        );
    }

    /**
     * =====================================================
     * 📭 SIN NÓMINAS
     * =====================================================
     */
    if (nominas.length === 0) {
        return (
            <View style={styles.cargando}>
                <Text style={styles.vacio}>
                    No tienes nóminas registradas.
                </Text>
            </View>
        );
    }

    /**
     * =====================================================
     * 📋 LISTADO PRINCIPAL
     * =====================================================
     */
    return (
        <FlatList
            data={nominas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.lista}
        />
    );
}

const styles = StyleSheet.create({

    lista: {
        padding: 20
    },

    tarjeta: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 14,
        marginBottom: 18,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }
    },

    titulo: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2F5D9F",
        marginBottom: 8
    },

    total: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 6
    },

    detalle: {
        fontSize: 13,
        color: "#777"
    },

    cargando: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    vacio: {
        fontSize: 16,
        color: "#777"
    },
    filaTotal: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6
    }

});