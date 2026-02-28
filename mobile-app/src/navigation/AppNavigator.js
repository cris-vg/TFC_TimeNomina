import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import FichajeScreen from '../screens/FichajeScreen';
import MapaScreen from '../screens/MapaScreen';
import HistorialScreen from '../screens/HistorialScreen';
import JustificacionScreen from '../screens/JustificacionScreen';
import MisJustificacionesScreen from '../screens/MisJustificacionesScreen';
import NominasScreen from '../screens/NominasScreen';
import DetalleNominaScreen from '../screens/DetalleNominaScreen';
import FichajeManualScreen from '../screens/FichajeManualScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: "Inicio" }}
                />
                <Stack.Screen
                    name="Fichaje"
                    component={FichajeScreen}
                    options={{ title: "Fichar" }}
                />
                <Stack.Screen
                    name="FichajeManual"
                    component={FichajeManualScreen}
                    options={{ title: "Fichaje Manual" }}
                />
                <Stack.Screen
                    name="Mapa"
                    component={MapaScreen}
                    options={{ title: "Ubicación de fichaje" }}
                />
                <Stack.Screen
                    name="Historial"
                    component={HistorialScreen}
                    options={{ title: "Historial de fichajes" }}
                />
                <Stack.Screen
                    name="Justificacion"
                    component={JustificacionScreen}
                    options={{ title: "Justificación" }}
                />
                <Stack.Screen
                    name="MisJustificaciones"
                    component={MisJustificacionesScreen}
                    options={{ title: "Mis Justificaciones" }}
                />
                <Stack.Screen
                    name="Nominas"
                    component={NominasScreen}
                    options={{ title: "Mis Nóminas" }}
                />
                <Stack.Screen
                    name="DetalleNomina"
                    component={DetalleNominaScreen}
                    options={{ title: "Detalle Nómina" }}
                />
                <Stack.Screen
                    name="Perfil"
                    component={PerfilScreen}
                    options={{ title: "Mi Perfil" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}