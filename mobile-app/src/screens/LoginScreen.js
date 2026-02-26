// src/screens/LoginScreen.js

import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

import { loginOdoo, obtenerEmpleado } from '../services/odooService';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {

    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);

    const { login } = useContext(AuthContext);

    const manejarLogin = async () => {
        console.log("BOTON LOGIN PULSADO");

        if (!usuario || !password) {
            Alert.alert("Error", "Debes introducir usuario y contraseña");
            return;
        }

        setCargando(true);

        const baseDatos = "attendance_app";
        console.log("Voy a llamar a loginOdoo")

        // 🔐 1️⃣ Login
        const resultadoLogin = await loginOdoo(baseDatos, usuario, password);


        if (!resultadoLogin.exito) {
            setCargando(false);
            Alert.alert("Error", resultadoLogin.mensaje);
            return;
        }
        console.log("Login OK, voy a obtener empleado vinculado")

        const uid = resultadoLogin.uid;
        console.log("Llamando a obtenerEmpleado");

        // 👤 2️⃣ Obtener empleado vinculado
        const resultadoEmpleado = await obtenerEmpleado(baseDatos, uid, password);
        console.log("Empleado obtenido: ", resultadoEmpleado);

        setCargando(false);

        if (!resultadoEmpleado.exito) {
            Alert.alert("Error", resultadoEmpleado.mensaje);
            return;
        }

        // ✅ 3️⃣ Guardar todo en contexto
        login(
            usuario,
            uid,
            password,
            resultadoEmpleado.empleado.id,
            resultadoEmpleado.empleado.name
        );

        navigation.replace("Home");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.contenedor}>

                <Text style={styles.titulo}>TimeNomina</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Usuario"
                    value={usuario}
                    onChangeText={setUsuario}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <Button
                    title={cargando ? "Conectando..." : "Iniciar sesión"}
                    onPress={manejarLogin}
                />

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5
    }
});