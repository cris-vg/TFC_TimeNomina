// src/screens/HomeScreen.js

/**
 * ==================================================
 * HomeScreen - TimeNomina
 * --------------------------------------------------
 * Pantalla principal con identidad visual oficial.
 *
 * Características:
 * - Cabecera con degradado corporativo (igual que Login)
 * - Avatar circular con inicial del empleado
 * - Saludo dinámico según hora del día
 * - Fade-in suave al cargar
 * - Tarjetas premium flotantes
 * - Microdetalle lateral azul
 * - Animación de escala al pulsar
 *
 * Diseño coherente con identidad TimeNomina
 * ==================================================
 */

import React, { useContext, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    FlatList,
    Animated
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {

    const { nombreEmpleado } = useContext(AuthContext);

    // Animación fade-in al cargar pantalla
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    /**
     * Devuelve saludo según hora del día.
     */
    const obtenerSaludo = () => {
        const hora = new Date().getHours();
        if (hora >= 6 && hora < 14) return "Buenos días";
        if (hora >= 14 && hora < 21) return "Buenas tardes";
        return "Buenas noches";
    };

    /**
     * Devuelve inicial del empleado para avatar.
     */
    const obtenerInicial = () => {
        if (!nombreEmpleado) return "";
        return nombreEmpleado.charAt(0).toUpperCase();
    };

    /**
     * Opciones principales del menú.
     */
    const opciones = [
        { id: "1", titulo: "Fichar", pantalla: "Fichaje", icono: "fingerprint" },
        { id: "2", titulo: "Historial", pantalla: "Historial", icono: "history" },
        { id: "3", titulo: "Justificaciones", pantalla: "MisJustificaciones", icono: "description" },
        { id: "4", titulo: "Nóminas", pantalla: "Nominas", icono: "payments" },
        { id: "5", titulo: "Mi Perfil", pantalla: "Perfil", icono: "person" }
    ];

    /**
     * Componente Tarjeta con animación de escala.
     */
    const Tarjeta = ({ item }) => {

        const scale = useRef(new Animated.Value(1)).current;

        const onPressIn = () => {
            Animated.spring(scale, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const onPressOut = () => {
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        return (
            <TouchableWithoutFeedback
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() => navigation.navigate(item.pantalla)}
            >
                <Animated.View
                    style={[
                        styles.tarjeta,
                        { transform: [{ scale }] }
                    ]}
                >
                    {/* Microdetalle lateral */}
                    <View style={styles.barraLateral} />

                    <MaterialIcons
                        name={item.icono}
                        size={32}
                        color="#556A9E"
                        style={{ marginBottom: 10 }}
                    />

                    <Text style={styles.textoTarjeta}>
                        {item.titulo}
                    </Text>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <Animated.View style={[styles.contenedor, { opacity: fadeAnim }]}>

            {/* CABECERA CORPORATIVA */}
            <LinearGradient
                colors={["#3A4A6A", "#556A9E"]}
                style={styles.cabecera}
            >
                <View style={styles.avatar}>
                    <Text style={styles.inicial}>
                        {obtenerInicial()}
                    </Text>
                </View>

                <View>
                    <Text style={styles.saludo}>
                        {obtenerSaludo()}, {nombreEmpleado}
                    </Text>
                    <Text style={styles.subtitulo}>
                        Panel principal
                    </Text>
                </View>
            </LinearGradient>

            {/* GRID TARJETAS */}
            <View style={styles.contenido}>
                <FlatList
                    data={opciones}
                    renderItem={({ item }) => <Tarjeta item={item} />}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    contentContainerStyle={{ paddingTop: 20 }}
                />
            </View>

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
        paddingBottom: 30,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
    },

    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15
    },

    inicial: {
        color: "#1F2A44",
        fontSize: 24,
        fontWeight: "bold"
    },

    saludo: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold"
    },

    subtitulo: {
        color: "#E0E0E0",
        fontSize: 14
    },

    contenido: {
        flex: 1,
        padding: 20
    },

    tarjeta: {
        width: "48%",
        height: 130,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
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

    textoTarjeta: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1F2A44"
    }
});