// src/screens/MapaScreen.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapaScreen({ route }) {

    // Recibimos coordenadas desde navegación
    const { latitud, longitud } = route.params;

    return (
        <View style={styles.contenedor}>
            <MapView
                style={styles.mapa}
                initialRegion={{
                    latitude: latitud,
                    longitude: longitud,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker
                    coordinate={{
                        latitude: latitud,
                        longitude: longitud
                    }}
                    title="Ubicación de fichaje"
                />
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
    },
    mapa: {
        flex: 1,
    },
});