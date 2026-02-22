// src/services/odooService.js

// 🔹 URL del servidor Odoo
// ⚠️ Asegúrate de que esta IP es la de tu ordenador en la misma red que el móvil
const URL_ODOO = "http://192.168.1.16:8070/jsonrpc";

/**
 * 🔐 Función para hacer login en Odoo
 */
export async function loginOdoo(baseDatos, usuario, password) {

    try {
        const respuesta = await fetch(URL_ODOO, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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

        const datos = await respuesta.json();

        console.log("Respuesta login:", datos);

        if (datos.result && datos.result > 0) {
            return { exito: true, uid: datos.result };
        }

        if (datos.result === false) {
            return { exito: false, mensaje: "Usuario o contraseña incorrectos" };
        }

        return { exito: false, mensaje: "Error inesperado en login" };

    } catch (error) {
        console.log("Error login:", error);
        return { exito: false, mensaje: "No hay conexión con el servidor" };
    }
}

/**
 * 👤 Obtiene el empleado vinculado al usuario logueado
 */
export async function obtenerEmpleadoPorUsuario(baseDatos, uid, password) {

    try {
        const respuesta = await fetch(URL_ODOO, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
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
                        {
                            fields: ["id", "name"]
                        }
                    ],
                },
                id: 2,
            }),
        });

        const datos = await respuesta.json();

        console.log("Empleado encontrado:", datos);

        if (datos.result && datos.result.length > 0) {
            return {
                exito: true,
                empleadoId: datos.result[0].id,
                nombre: datos.result[0].name
            };
        }

        return { exito: false, mensaje: "No hay empleado vinculado al usuario" };

    } catch (error) {
        console.log("Error empleado:", error);
        return { exito: false, mensaje: "Error obteniendo empleado" };
    }
}

/**
 * 🕒 Función para fichar entrada o salida
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
        const respuesta = await fetch(URL_ODOO, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
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
                    ],
                },
                id: 3,
            }),
        });

        const datos = await respuesta.json();

        console.log("Respuesta fichaje:", datos);

        if (datos.result && datos.result.success) {
            return { exito: true, datos: datos.result };
        }

        if (datos.error) {
            return { exito: false, mensaje: datos.error.data.message };
        }

        return { exito: false, mensaje: "Error al fichar" };

    } catch (error) {
        console.log("Error fichaje:", error);
        return { exito: false, mensaje: "Error de conexión con el servidor" };
    }
}