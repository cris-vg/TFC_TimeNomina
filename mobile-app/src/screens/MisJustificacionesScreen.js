// ======================================================
// 📌 MisJustificacionesScreen
// Pantalla que muestra el listado de justificaciones
// enviadas por el empleado.
// - Permite refrescar con pull-to-refresh
// - Muestra estado visual (pendiente / aprobada / rechazada)
// - Muestra comentario de RRHH si existe
// ======================================================

import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { obtenerJustificaciones } from '../services/odooService';

export default function MisJustificacionesScreen() {

    const { uid, password, empleadoId } = useContext(AuthContext);

    const [justificaciones, setJustificaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const baseDatos = "attendance_app";

    /**
     * =====================================================
     * 🔄 CARGA INICIAL
     * =====================================================
     */
    useEffect(() => {
        cargarJustificaciones();
    }, []);

    /**
     * =====================================================
     * 📥 OBTENER JUSTIFICACIONES DESDE BACKEND
     * =====================================================
     */
    const cargarJustificaciones = async () => {

        const resultado = await obtenerJustificaciones(
            baseDatos,
            uid,
            password,
            empleadoId
        );

        if (resultado.exito) {
            setJustificaciones(resultado.datos);
        }

        setCargando(false);
        setRefreshing(false);
    };

    /**
     * =====================================================
     * 🔄 REFRESH MANUAL (PULL DOWN)
     * =====================================================
     */
    const onRefresh = () => {
        setRefreshing(true);
        cargarJustificaciones();
    };

    /**
     * =====================================================
     * 🔤 TRADUCIR TIPO DE JUSTIFICACIÓN
     * =====================================================
     */
    const traducirTipo = (tipo) => {

        const mapa = {
            retraso: "Retraso",
            olvido: "Olvido de fichaje",
            salida_anticipada: "Salida anticipada",
            ausencia_parcial: "Ausencia parcial",
            otro: "Otro"
        };

        return mapa[tipo] || tipo;
    };

    /**
     * =====================================================
     * 📅 FORMATEAR FECHA
     * =====================================================
     */
    const formatearFecha = (fecha) => {

        return new Date(fecha + "Z").toLocaleString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    /**
     * =====================================================
     * 🎨 ESTILO VISUAL SEGÚN ESTADO
     * =====================================================
     */
    const obtenerColorEstado = (estado) => {

        if (estado === "aprobado") return "#2ecc71";
        if (estado === "rechazado") return "#e74c3c";
        return "#f39c12"; // pendiente
    };

    // ================= LOADING =================
    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" color="#2F5D9F" />
            </View>
        );
    }

    // ================= EMPTY STATE =================
    if (justificaciones.length === 0) {
        return (
            <View style={styles.cargando}>
                <Text style={{ color: "#777" }}>
                    No tienes justificaciones registradas.
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={justificaciones}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#2F5D9F"]}
                />
            }
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => {

                const colorEstado = obtenerColorEstado(item.estado);

                return (
                    <View style={styles.card}>

                        {/* Línea lateral de estado */}
                        <View style={[styles.estadoLinea, { backgroundColor: colorEstado }]} />

                        <View style={styles.contenido}>

                            <Text style={styles.fecha}>
                                {formatearFecha(item.fecha)}
                            </Text>

                            <Text style={styles.tipo}>
                                {traducirTipo(item.tipo)}
                            </Text>

                            <Text style={styles.descripcion}>
                                {item.descripcion}
                            </Text>

                            <Text style={[styles.estadoTexto, { color: colorEstado }]}>
                                {item.estado.toUpperCase()}
                            </Text>

                            {item.comentario_rrhh && (
                                <View style={styles.comentarioBox}>
                                    <Text style={styles.comentarioTitulo}>
                                        Comentario RRHH
                                    </Text>
                                    <Text style={styles.comentarioTexto}>
                                        {item.comentario_rrhh}
                                    </Text>
                                </View>
                            )}

                        </View>

                    </View>
                );
            }}
        />
    );
}

const styles = StyleSheet.create({

    cargando: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        marginBottom: 18,
        flexDirection: "row",
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }
    },

    estadoLinea: {
        width: 6,
        borderTopLeftRadius: 14,
        borderBottomLeftRadius: 14
    },

    contenido: {
        flex: 1,
        padding: 16
    },

    fecha: {
        fontSize: 13,
        color: "#777",
        marginBottom: 6
    },

    tipo: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 6,
        color: "#2F5D9F"
    },

    descripcion: {
        fontSize: 14,
        marginBottom: 10,
        color: "#444"
    },

    estadoTexto: {
        fontWeight: "bold",
        marginBottom: 8
    },

    comentarioBox: {
        backgroundColor: "#F4F6FA",
        padding: 10,
        borderRadius: 8
    },

    comentarioTitulo: {
        fontWeight: "600",
        marginBottom: 4,
        fontSize: 13
    },

    comentarioTexto: {
        fontStyle: "italic",
        fontSize: 13,
        color: "#555"
    }

});