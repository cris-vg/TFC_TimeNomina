import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { TouchableOpacity } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { obtenerNominas } from '../services/odooService';

export default function NominasScreen({ navigation }) {

    const { uid, password, empleadoId } = useContext(AuthContext);

    const [nominas, setNominas] = useState([]);
    const [cargando, setCargando] = useState(true);

    const baseDatos = "attendance_app";

    useEffect(() => {
        cargarNominas();
    }, []);

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

    const formatearMes = (mes) => {
        const meses = {
            "1": "Enero",
            "2": "Febrero",
            "3": "Marzo",
            "4": "Abril",
            "5": "Mayo",
            "6": "Junio",
            "7": "Julio",
            "8": "Agosto",
            "9": "Septiembre",
            "10": "Octubre",
            "11": "Noviembre",
            "12": "Diciembre"
        };

        return meses[mes] || mes;
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate("DetalleNomina", { nomina: item })}
        >
            <View style={styles.tarjeta}>

                <Text style={styles.titulo}>
                    {formatearMes(item.mes)} {item.anio}
                </Text>

                <Text style={styles.total}>
                    Total bruto: {item.total_bruto?.toFixed(2)} €
                </Text>

            </View>
        </TouchableOpacity>
    );
    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (nominas.length === 0) {
        return (
            <View style={styles.cargando}>
                <Text>No tienes nóminas registradas.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={nominas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 15 }}
        />
    );
}

const styles = StyleSheet.create({
    tarjeta: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    titulo: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 5,
    },
    total: {
        marginTop: 8,
        fontWeight: "bold",
        fontSize: 15,
    },
    cargando: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});