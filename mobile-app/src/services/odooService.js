// src/services/odooService.js

const URL_ODOO = "https://nonconceptually-phyllodial-magan.ngrok-free.dev/jsonrpc";


/**
 * 🔐 LOGIN
 */
export async function loginOdoo(baseDatos, usuario, password) {
    try {
        console.log("Enviando login a: ", URL_ODOO);
        const response = await fetch(URL_ODOO, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true" //para evitar la advertencia de ngrok
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "common",
                    method: "login",
                    args: [baseDatos, usuario, password],
                },
                id: 1,
            }),
        });

        console.log("Status: ", response.status);

        const text = await response.text();
        console.log("Response text: ", text);

        const data = JSON.parse(text);

        if (data.result) {
            return { exito: true, uid: data.result };
        }

        return { exito: false, mensaje: "Credenciales incorrectas" };

    } catch (error) {
        return { exito: false, mensaje: "Error de conexión con el servidor" };
    }
}


/**
 * 👤 OBTENER EMPLEADO VINCULADO
 */
export async function obtenerEmpleado(baseDatos, uid, password) {
    try {
        const response = await fetch(URL_ODOO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [
                        baseDatos,
                        uid,
                        password,
                        "hr.employee",
                        "search_read",
                        [
                            [["user_id", "=", uid]]
                        ],
                        { fields: ["id", "name"] }
                    ]
                },
                id: 2,
            }),
        });

        const data = await response.json();

        if (data.result && data.result.length > 0) {
            return { exito: true, empleado: data.result[0] };
        }

        return { exito: false, mensaje: "Empleado no encontrado" };

    } catch (error) {
        return { exito: false, mensaje: "Error obteniendo empleado" };
    }
}


/**
 * 🕒 FICHAR DESDE APP
 */
export async function ficharDesdeApp(
    baseDatos,
    uid,
    password,
    empleadoId,
    latitud,
    longitud
) {
    try {
        const response = await fetch(URL_ODOO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [
                        baseDatos,
                        uid,
                        password,
                        "hr.employee",
                        "fichar_desde_app",
                        [empleadoId],
                        {
                            latitude: latitud,
                            longitude: longitud
                        }
                    ]
                },
                id: 3,
            }),
        });

        const data = await response.json();

        if (data.result && data.result.success) {
            return { exito: true, datos: data.result };
        }

        return { exito: false, mensaje: data.result?.message || "Error fichando" };

    } catch (error) {
        return { exito: false, mensaje: "Error de conexión" };
    }
}


/**
 * 📜 OBTENER HISTORIAL DE FICHAJES
 */
export async function obtenerHistorial(baseDatos, uid, password, empleadoId) {
    try {
        const response = await fetch(URL_ODOO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [
                        baseDatos,
                        uid,
                        password,
                        "hr.attendance",
                        "search_read",
                        [
                            [["employee_id", "=", empleadoId]]
                        ],
                        {
                            fields: [
                                "check_in",
                                "check_out",
                                "worked_hours",
                                "in_latitude",
                                "in_longitude"
                            ],
                            order: "check_in desc"
                        }
                    ]
                },
                id: 4,
            }),
        });

        const data = await response.json();
        console.log("Historial response: ", data);
        console.log("Resultado:", data.result);

        if (data.result) {
            return { exito: true, datos: data.result };
        }

        return { exito: false, mensaje: "Error obteniendo historial" };

    } catch (error) {
        return { exito: false, mensaje: "Error de conexión" };
    }
}


/**
 * 📝 CREAR JUSTIFICACIÓN (con documento)
 */
export async function crearJustificacion(
    baseDatos,
    uid,
    password,
    empleadoId,
    tipo,
    descripcion,
    archivoBase64 = null,
    nombreArchivo = null
) {
    try {
        const response = await fetch(URL_ODOO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [
                        baseDatos,
                        uid,
                        password,
                        "attendance.justification",
                        "create",
                        [{
                            employee_id: empleadoId,
                            tipo: tipo,
                            descripcion: descripcion,
                            documento: archivoBase64,
                            nombre_documento: nombreArchivo
                        }]
                    ]
                },
                id: 5,
            }),
        });

        const data = await response.json();

        if (data.result) {
            return { exito: true };
        }

        return { exito: false, mensaje: "Error al crear justificación" };

    } catch (error) {
        return { exito: false, mensaje: "Error de conexión" };
    }
}


/**
 * 📂 OBTENER MIS JUSTIFICACIONES
 */
export async function obtenerJustificaciones(baseDatos, uid, password, empleadoId) {
    try {
        const response = await fetch(URL_ODOO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [
                        baseDatos,
                        uid,
                        password,
                        "attendance.justification",
                        "search_read",
                        [
                            [["employee_id", "=", empleadoId]]
                        ],
                        {
                            fields: [
                                "fecha",
                                "tipo",
                                "descripcion",
                                "estado",
                                "comentario_rrhh",
                                "nombre_documento"
                            ],
                            order: "fecha desc"
                        }
                    ]
                },
                id: 6,
            }),
        });

        const data = await response.json();

        if (data.result) {
            return { exito: true, datos: data.result };
        }

        return { exito: false, mensaje: "Error obteniendo justificaciones" };

    } catch (error) {
        return { exito: false, mensaje: "Error de conexión" };
    }
}