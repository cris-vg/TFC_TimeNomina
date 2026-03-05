// src/services/odooService.js

const URL_ODOO = "https://nonconceptually-phyllodial-magan.ngrok-free.dev/jsonrpc";


/**
 *  LOGIN
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
 *  OBTENER EMPLEADO VINCULADO
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
 *  FICHAR DESDE APP
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
 *  FICHAJE MANUAL
 */
export async function fichajeManual(
    baseDatos,
    uid,
    password,
    empleadoId,
    fechaHoraISO,
    tipo,
    motivo
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
                        "fichaje_manual_desde_app",
                        [empleadoId, fechaHoraISO, tipo, motivo]
                    ]
                },
                id: 10,
            }),
        });

        const data = await response.json();

        if (data.result && data.result.success) {
            return { exito: true };
        }

        return { exito: false, mensaje: data.result?.message || "Error enviando fichaje manual" };

    } catch (error) {
        return { exito: false, mensaje: "Error de conexión" };
    }
}

/**
 *  ACEPTAR MODIFICACIÓN
 */
export async function aceptarModificacion(
    baseDatos,
    uid,
    password,
    attendanceId
) {
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
                    "aceptar_modificacion_desde_app",
                    [[attendanceId]]
                ]
            },
            id: 11,
        }),
    });

    const data = await response.json();

    console.log("RAW aceptar:", data);

    if (data.result) {
        return data.result;
    }

    if (data.error) {
        return {
            success: false,
            message: data.error.data?.message || "Error servidor"
        };
    }

    return {
        success: false,
        message: "Respuesta inválida"
    };
}


/**
 *  RECHAZAR MODIFICACIÓN
 */
export async function rechazarModificacion(
    baseDatos,
    uid,
    password,
    attendanceId,
    motivo
) {
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
                    "rechazar_modificacion_desde_app",
                    [[attendanceId], motivo]
                ]
            },
            id: 12,
        }),
    });

    const data = await response.json();

    console.log("RAW rechazar:", data);

    if (data.result) {
        return data.result;
    }

    if (data.error) {
        return {
            success: false,
            message: data.error.data?.message || "Error servidor"
        };
    }

    return {
        success: false,
        message: "Respuesta inválida"
    };
}


/**
 *  OBTENER HISTORIAL DE FICHAJES
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
                                "id",
                                "check_in",
                                "check_out",
                                "worked_hours",
                                "in_latitude",
                                "in_longitude",
                                "es_anomalia",
                                "requiere_revision",
                                "pendiente_confirmacion"
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
 *  CREAR JUSTIFICACIÓN (con documento)
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
 *  OBTENER MIS JUSTIFICACIONES
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

export async function obtenerNominas(baseDatos, uid, password, empleadoId) {
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
                    "obtener_nominas_app",
                    [empleadoId]
                ]
            },
            id: 8,
        }),
    });

    const data = await response.json();
    return data.result;
}

export async function descargarNominaPDF(baseDatos, uid, password, nominaId) {

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
                    "nomina.nomina",
                    "descargar_pdf_app",
                    [nominaId]
                ]
            },
            id: 9,
        }),
    });

    const data = await response.json();
    console.log("Respuesta cruda JSONRPC PDF:", data);

    return data.result;
}

/**
 *  OBTENER PERFIL EMPLEADO
 */
export async function obtenerPerfil(baseDatos, uid, password, empleadoId) {
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
                        "obtener_perfil_app",
                        [empleadoId]
                    ]
                },
                id: 20,
            }),
        });

        const data = await response.json();
        console.log("RAW perfil:", data);

        if (data.result && data.result.success) {
            return { exito: true, datos: data.result.perfil };
        }

        return { exito: false, mensaje: data.result?.message || "Error obteniendo perfil" };

    } catch (error) {
        return { exito: false, mensaje: "Error de conexión" };
    }
}

// =====================================================
// OBTENER ESTADO JORNADA
// =====================================================

export async function obtenerEstadoJornada(baseDatos, uid, password, empleadoId) {

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
                    "obtener_estado_jornada_app",
                    [[empleadoId]]
                ]
            },
            id: 99
        })
    });

    const data = await response.json();

    if (data.result?.success) {
        return { exito: true, datos: data.result };
    } else {
        return { exito: false, mensaje: data.result?.message };
    }
}