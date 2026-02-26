# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import UserError
from datetime import datetime


class HrEmployee(models.Model):
    
    _inherit = 'hr.employee'

    salario_base = fields.Float(string="Salario Base Mensual")
    precio_hora_extra = fields.Float(string="Precio Hora Extra")

    def fichar_desde_app(self, latitude=None, longitude=None):

        self.ensure_one()

        # 🔐 Verificar que el usuario logueado tenga empleado vinculado
        if not self.env.user.employee_id:
            return {
                "success": False,
                "error_code": "NO_EMPLOYEE_LINKED",
                "message": "Usuario no vinculado a ningún empleado"
            }

        # 🔐 Verificar que el empleado es el suyo
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

        if not ultimo_fichaje:
            Attendance.create({
                'employee_id': self.id,
                'check_in': ahora,
                'in_latitude': latitude,
                'in_longitude': longitude,
            })

            return {
                "success": True,
                "estado": "entrada",
                "timestamp": ahora,
                "latitud": latitude,
                "longitud": longitude
            }
        else:
            ultimo_fichaje.write({
                'check_out': ahora,
                'out_latitude': latitude,
                'out_longitude': longitude,
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
                "longitud": longitude
            }
    def obtener_nominas_app(self):
            self.ensure_one()

    # 🔐 Seguridad: solo puede ver sus propias nóminas
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