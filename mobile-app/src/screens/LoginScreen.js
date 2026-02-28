// src/screens/LoginScreen.js

import React, { useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { loginOdoo, obtenerEmpleado } from '../services/odooService';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {

    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);

    const { login } = useContext(AuthContext);

    const manejarLogin = async () => {

        if (!usuario || !password) {
            Alert.alert("Error", "Debes introducir usuario y contraseña");
            return;
        }

        setCargando(true);

        const baseDatos = "attendance_app";

        const resultadoLogin = await loginOdoo(baseDatos, usuario, password);

        if (!resultadoLogin.exito) {
            setCargando(false);
            Alert.alert("Error", resultadoLogin.mensaje);
            return;
        }

        const uid = resultadoLogin.uid;

        const resultadoEmpleado = await obtenerEmpleado(baseDatos, uid, password);

        setCargando(false);

        if (!resultadoEmpleado.exito) {
            Alert.alert("Error", resultadoEmpleado.mensaje);
            return;
        }


        login(
            usuario,
            uid,
            password,
            resultadoEmpleado.empleado.id,
            resultadoEmpleado.empleado.name
        );


    };

    return (
        <LinearGradient
            colors={["#3A4A6A", "#556A9E"]}
            style={{ flex: 1 }}
        >
            <StatusBar style="light" />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.contenedor}>

                    <Image
                        source={require('../../assets/Logo.png')}
                        style={styles.logo}
                    />

                    <View style={styles.card}>

                        <Text style={styles.titulo}>Bienvenido</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Usuario"
                            placeholderTextColor="#6B7280"
                            value={usuario}
                            onChangeText={setUsuario}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            placeholderTextColor="#6B7280"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <TouchableOpacity
                            style={styles.boton}
                            onPress={manejarLogin}
                            disabled={cargando}
                        >
                            {cargando ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.botonTexto}>
                                    INICIAR SESIÓN
                                </Text>
                            )}
                        </TouchableOpacity>

                    </View>

                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    logo: {
        width: 180,
        height: 180,
        alignSelf: 'center',
        marginBottom: 30,
        resizeMode: 'contain'
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        elevation: 8
    },
    titulo: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1A1A1A'
    },
    input: {
        backgroundColor: '#F4F6FA',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        fontSize: 16
    },
    boton: {
        backgroundColor: '#1F2A44',
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
        alignItems: 'center'
    },
    botonTexto: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16
    }
});