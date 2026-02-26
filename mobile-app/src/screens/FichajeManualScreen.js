import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

import { AuthContext } from '../context/AuthContext';
import { fichajeManual } from '../services/odooService';

export default function FichajeManualScreen({ navigation }) {

    const { uid, password, empleadoId } = useContext(AuthContext);

    const baseDatos = "attendance_app";

    const [tipo, setTipo] = useState("entrada");
    const [fecha, setFecha] = useState(new Date());
    const [modoPicker, setModoPicker] = useState(null);// 'date' o 'time'
    const [motivo, setMotivo] = useState("");
    const [cargando, setCargando] = useState(false);

    const manejarEnvio = async () => {

        if (!motivo.trim()) {
            Alert.alert("Error", "El motivo es obligatorio");
            return;
        }

        setCargando(true);

        const fechaHoraISO = fecha.toISOString().replace('T', ' ').split('.')[0];

        const resultado = await fichajeManual(
            baseDatos,
            uid,
            password,
            empleadoId,
            fechaHoraISO,
            tipo,
            motivo
        );

        setCargando(false);

        if (resultado.exito) {
            Alert.alert("Correcto", "Fichaje manual enviado a revisión", [
                {
                    text: "Aceptar",
                    onPress: () => navigation.goBack()
                }
            ]);
        } else {
            Alert.alert("Error", resultado.mensaje);
        }
    };

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Fichaje Manual</Text>

            <Text>Tipo:</Text>
            <Picker
                selectedValue={tipo}
                onValueChange={(itemValue) => setTipo(itemValue)}
            >
                <Picker.Item label="Entrada" value="entrada" />
                <Picker.Item label="Salida" value="salida" />
            </Picker>

            <Button
                title="Seleccionar Fecha"
                onPress={() => setModoPicker('date')}
            />

            <Button
                title="Seleccionar Hora"
                onPress={() => setModoPicker('time')}
            />

            {modoPicker && (
                <DateTimePicker
                    value={fecha}
                    mode={modoPicker}
                    display="default"
                    onChange={(event, selectedDate) => {
                        setModoPicker(null);
                        if (selectedDate) {
                            setFecha(selectedDate);
                        }
                    }}
                />
            )}

            <Text style={{ marginTop: 10 }}>
                Fecha seleccionada: {fecha.toLocaleString()}
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Motivo..."
                value={motivo}
                onChangeText={setMotivo}
                multiline
            />

            <Button
                title={cargando ? "Enviando..." : "Enviar"}
                onPress={manejarEnvio}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginVertical: 15,
        height: 100,
        textAlignVertical: 'top'
    }
});