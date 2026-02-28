from odoo import models, fields, api

class HrAttendance(models.Model):
    _inherit = 'hr.attendance'

    es_anomalia = fields.Boolean(
        string="Es anomalía",
        default=False
    )

    requiere_revision = fields.Boolean(
        string="Requiere revisión",
        default=False
    )
     # 🆕 NUEVOS CAMPOS
    modificado_por_rrhh = fields.Boolean(default=False)
    pendiente_confirmacion = fields.Boolean(default=False)

    estado_confirmacion = fields.Selection(
        [
            ('pendiente', 'Pendiente'),
            ('aceptado', 'Aceptado'),
            ('rechazado', 'Rechazado')
        ],
        default='pendiente'
    )
    def write(self, vals):

        # Guardamos valores antiguos antes de modificar
        campos_control = ['check_in', 'check_out']

        cambios_detectados = any(campo in vals for campo in campos_control)

        for record in self:

            # Solo si se modifican horas
            if cambios_detectados:

                # Si quien modifica NO es el propio empleado
                if record.employee_id.user_id != self.env.user:

                    vals.update({
                        'modificado_por_rrhh': True,
                        'pendiente_confirmacion': True,
                        'estado_confirmacion': 'pendiente'
                    })

        result = super().write(vals)

        # Después de guardar, enviamos mensaje
        if cambios_detectados:
            for record in self:
                if record.employee_id.user_id:
                    record.message_post(
                        body=(
                            "⚠ Tu fichaje ha sido modificado por RRHH.<br/>"
                            "Por favor revisa la modificación."
                        ),
                        partner_ids=[record.employee_id.user_id.partner_id.id]
                    )

        return result
    
        # =====================================================
    # CONFIRMACIÓN EMPLEADO DESDE APP
    # =====================================================

    def aceptar_modificacion_desde_app(self):
        self.ensure_one()

        employee = self.employee_id.sudo()

        if employee.user_id != self.env.user:
            return {"success": False, "message": "No autorizado"}

        if not self.pendiente_confirmacion:
            return {"success": False, "message": "No hay modificación pendiente"}

        self.sudo().write({
        'estado_confirmacion': 'aceptado',
        'pendiente_confirmacion': False,
        'es_anomalia': False,
        'requiere_revision': False
    })

        return {"success": True}

    def rechazar_modificacion_desde_app(self, motivo):
        self.ensure_one()

        employee = self.employee_id.sudo()

        if employee.user_id != self.env.user:
            return {"success": False, "message": "No autorizado"}

        if not motivo:
            return {"success": False, "message": "Debe indicar un motivo"}

        if not self.pendiente_confirmacion:
            return {"success": False, "message": "No hay modificación pendiente"}

        self.sudo().write({
        'estado_confirmacion': 'rechazado',
        'pendiente_confirmacion': False
    })

        self.message_post(
        body=f"❌ El empleado ha rechazado la modificación.<br/>Motivo: {motivo}"
    )

        return {"success": True}