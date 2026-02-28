# -*- coding: utf-8 -*-
from odoo import models, fields, api


class HrEmployee(models.Model):

    _inherit = 'hr.employee'

    salario_base = fields.Float(string="Salario Base Mensual")
    precio_hora_extra = fields.Float(string="Precio Hora Extra")

    # =====================================================
    # HORARIO TEÓRICO
    # =====================================================

    hora_entrada_teorica = fields.Float(
        string="Hora entrada teórica (ej: 8.0 = 08:00)"
    )

    hora_salida_teorica = fields.Float(
        string="Hora salida teórica (ej: 16.5 = 16:30)"
    )

    margen_minutos = fields.Integer(
        string="Margen permitido (minutos)",
        default=10
    )

    # =====================================================
    # FICHAJE DESDE APP
    # =====================================================

    def fichar_desde_app(self, latitude=None, longitude=None):

        self.ensure_one()

        # 🔐 Verificar usuario vinculado
        if not self.env.user.employee_id:
            return {
                "success": False,
                "error_code": "NO_EMPLOYEE_LINKED",
                "message": "Usuario no vinculado a ningún empleado"
            }

        # 🔐 Verificar que ficha su propio empleado
        if self.env.user.employee_id.id != self.id:
            return {
                "success": False,
                "error_code": "FORBIDDEN",
                "message": "No puedes fichar por otro empleado"
            }

        Attendance = self.env['hr.attendance'].sudo()

        ultimo_fichaje = Attendance.search([
            ('employee_id', '=', self.id),
            ('check_out', '=', False)
        ], limit=1)

        ahora = fields.Datetime.now()

        # Convertir hora actual a float (ej: 8:30 = 8.5)
        hora_actual = ahora.hour + (ahora.minute / 60.0)

        fuera_de_rango = False

        # =====================================================
        # ENTRADA
        # =====================================================
        if not ultimo_fichaje:

            if self.hora_entrada_teorica and self.margen_minutos:

                margen_horas = self.margen_minutos / 60.0
                rango_min = self.hora_entrada_teorica - margen_horas
                rango_max = self.hora_entrada_teorica + margen_horas

                if hora_actual < rango_min or hora_actual > rango_max:
                    fuera_de_rango = True

            Attendance.create({
                'employee_id': self.id,
                'check_in': ahora,
                'in_latitude': latitude,
                'in_longitude': longitude,
                'es_anomalia': fuera_de_rango,
                'requiere_revision': fuera_de_rango
            })

            return {
                "success": True,
                "estado": "entrada",
                "timestamp": ahora,
                "latitud": latitude,
                "longitud": longitude,
                "fuera_de_rango": fuera_de_rango
            }

        # =====================================================
        # SALIDA
        # =====================================================
        else:

            if self.hora_salida_teorica and self.margen_minutos:

                margen_horas = self.margen_minutos / 60.0
                rango_min = self.hora_salida_teorica - margen_horas
                rango_max = self.hora_salida_teorica + margen_horas

                if hora_actual < rango_min or hora_actual > rango_max:
                    fuera_de_rango = True

            ultimo_fichaje.write({
                'check_out': ahora,
                'out_latitude': latitude,
                'out_longitude': longitude,
                'es_anomalia': fuera_de_rango,
                'requiere_revision': fuera_de_rango
            })

            # 🧮 Calcular diferencia en horas
            if ultimo_fichaje.check_in and ultimo_fichaje.check_out:
                diferencia = ultimo_fichaje.check_out - ultimo_fichaje.check_in
                horas_trabajadas = diferencia.total_seconds() / 3600

                # 🚨 Límite máximo 12 horas
                if horas_trabajadas > 12:
                    ultimo_fichaje.write({
                        'es_anomalia': True,
                        'requiere_revision': True
                    })

            return {
                "success": True,
                "estado": "salida",
                "timestamp": ahora,
                "latitud": latitude,
                "longitud": longitude,
                "fuera_de_rango": fuera_de_rango
            }
        
     # =====================================================
    # FICHAJE MANUAL DESDE APP
    # =====================================================

    def fichaje_manual_desde_app(self, fecha_hora, tipo, motivo):

        self.ensure_one()

        # 🔐 Seguridad: empleado vinculado
        if not self.env.user.employee_id:
            return {
                "success": False,
                "message": "Usuario no vinculado a ningún empleado"
            }

        if self.env.user.employee_id.id != self.id:
            return {
                "success": False,
                "message": "No autorizado"
            }

        if not motivo:
            return {
                "success": False,
                "message": "El motivo es obligatorio"
            }

        Attendance = self.env['hr.attendance'].sudo()
        Justification = self.env['attendance.justification'].sudo()

        # Convertir string a datetime
        try:
            fecha_dt = fields.Datetime.from_string(fecha_hora)
        except Exception:
            return {
                "success": False,
                "message": "Formato de fecha incorrecto"
            }

        # =====================================================
        # ENTRADA MANUAL
        # =====================================================
        if tipo == "entrada":

            # Verificar que no haya fichaje abierto
            abierto = Attendance.search([
                ('employee_id', '=', self.id),
                ('check_out', '=', False)
            ], limit=1)

            if abierto:
                return {
                    "success": False,
                    "message": "Ya existe una entrada sin salida"
                }

            nuevo = Attendance.create({
                'employee_id': self.id,
                'check_in': fecha_dt,
                'es_anomalia': True,
                'requiere_revision': True
            })

        # =====================================================
        # SALIDA MANUAL
        # =====================================================
        elif tipo == "salida":

            abierto = Attendance.search([
                ('employee_id', '=', self.id),
                ('check_out', '=', False)
            ], limit=1)

            if not abierto:
                return {
                    "success": False,
                    "message": "No existe una entrada abierta para cerrar"
                }

            abierto.write({
                'check_out': fecha_dt,
                'es_anomalia': True,
                'requiere_revision': True
            })

            nuevo = abierto

        else:
            return {
                "success": False,
                "message": "Tipo inválido"
            }

        # =====================================================
        # CREAR JUSTIFICACIÓN AUTOMÁTICA
        # =====================================================

        Justification.create({
            'employee_id': self.id,
            'attendance_id': nuevo.id,
            'tipo': 'olvido',
            'descripcion': motivo,
            'estado': 'pendiente'
        })

        return {
            "success": True,
            "message": "Fichaje manual enviado a revisión"
        }

    # =====================================================
    # OBTENER NÓMINAS PARA APP
    # =====================================================

    def obtener_nominas_app(self):

        self.ensure_one()

        if self.env.user.employee_id.id != self.id:
            return {
                "success": False,
                "message": "No autorizado"
            }

        Nomina = self.env['nomina.nomina'].sudo()

        nominas = Nomina.search_read(
            [('empleado_id', '=', self.id)],
            [
                'id',
                'mes',
                'anio',
                'salario_base',
                'horas_extra',
                'precio_hora_extra',
                'complementos',
                'total_bruto'
            ],
            order='anio desc, mes desc'
        )

        return {
            "success": True,
            "nominas": nominas
        }
    
    # =====================================================
    # OBTENER PERFIL EMPLEADO PARA APP
    # =====================================================

    def obtener_perfil_app(self):

        self.ensure_one()

        # 🔐 Seguridad
        if not self.env.user.employee_id or self.env.user.employee_id.id != self.id:
            return {
                "success": False,
                "message": "No autorizado"
            }
        empleado = self.sudo()

        # Función interna para convertir float a HH:MM
        def formatear_hora(hora_float):
            if not hora_float:
                return None
            horas = int(hora_float)
            minutos = int(round((hora_float - horas) * 60))
            return f"{horas:02d}:{minutos:02d}"

        perfil = {
            "nombre": empleado.name,
            "email": empleado.work_email or "",
            "telefono": empleado.work_phone or "",
            "puesto": empleado.job_id.name if empleado.job_id else "",
            "departamento": empleado.department_id.name if empleado.department_id else "",
            "hora_entrada": formatear_hora(empleado.hora_entrada_teorica),
            "hora_salida": formatear_hora(empleado.hora_salida_teorica),
            "margen_minutos": empleado.margen_minutos or 0
    }

        return {
        "success": True,
        "perfil": perfil
    }