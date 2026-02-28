// src/screens/HomeScreen.js

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>Bienvenido/a a TimeNomina</Text>

            <Button
                title="Cerrar sesión"
                onPress={() => navigation.replace("Login")}
            />
            <Button
                title="Ir a fichaje"
                onPress={() => navigation.navigate("Fichaje")}
            />
            <Button
                title="Ver Historial"
                onPress={() => navigation.navigate("Historial")}
            />
            <Button
                title="Mis justificaciones"
                onPress={() => navigation.navigate("MisJustificaciones")}
            />
            <Button
                title="Ver Nóminas"
                onPress={() => navigation.navigate("Nominas")}
            />
            <Button
                title="Mi Perfil"
                onPress={() => navigation.navigate("Perfil")}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titulo: {
        fontSize: 22,
        marginBottom: 20,
    },
});