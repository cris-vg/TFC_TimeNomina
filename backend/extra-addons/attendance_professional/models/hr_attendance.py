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