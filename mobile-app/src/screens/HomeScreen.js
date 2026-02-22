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