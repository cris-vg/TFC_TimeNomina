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

    useEffect(() => {
        cargarJustificaciones();
    }, []);

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

    const onRefresh = () => {
        setRefreshing(true);
        cargarJustificaciones();
    };

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

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const obtenerEstiloEstado = (estado) => {
        if (estado === "aprobado") {
            return { color: "#2ecc71", label: "🟢 Aprobada" };
        }
        if (estado === "rechazado") {
            return { color: "#e74c3c", label: "🔴 Rechazada" };
        }
        return { color: "#f39c12", label: "🟡 Pendiente" };
    };

    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <FlatList
            data={justificaciones}
            keyExtractor={(item, index) => index.toString()}
            alwaysBounceVertical={true}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
            contentContainerStyle={{ padding: 15 }}
            renderItem={({ item }) => {

                const estadoInfo = obtenerEstiloEstado(item.estado);

                return (
                    <View style={styles.card}>

                        <Text style={styles.fecha}>
                            📅 {formatearFecha(item.fecha)}
                        </Text>

                        <Text style={styles.tipo}>
                            🕒 {traducirTipo(item.tipo)}
                        </Text>

                        <Text style={styles.descripcion}>
                            {item.descripcion}
                        </Text>

                        <Text style={[styles.estado, { color: estadoInfo.color }]}>
                            {estadoInfo.label}
                        </Text>

                        {item.comentario_rrhh && (
                            <View style={styles.comentarioBox}>
                                <Text style={styles.comentarioTitulo}>
                                    💬 Comentario RRHH
                                </Text>
                                <Text style={styles.comentarioTexto}>
                                    {item.comentario_rrhh}
                                </Text>
                            </View>
                        )}

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
        backgroundColor: "#ffffff",
        padding: 18,
        borderRadius: 12,
        marginBottom: 18,
        elevation: 4
    },

    fecha: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6
    },

    tipo: {
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 6
    },

    descripcion: {
        fontSize: 14,
        marginBottom: 10
    },

    estado: {
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 10
    },

    comentarioBox: {
        backgroundColor: "#f4f6f7",
        padding: 10,
        borderRadius: 8
    },

    comentarioTitulo: {
        fontWeight: "bold",
        marginBottom: 3
    },

    comentarioTexto: {
        fontStyle: "italic"
    }

});