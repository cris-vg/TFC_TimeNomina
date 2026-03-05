from odoo import models, fields, api
from odoo.exceptions import UserError
from datetime import datetime
import calendar


class GenerarNominaWizard(models.TransientModel):
    _name = 'generar.nomina.wizard'
    _description = 'Wizard para generar nómina mensual'

    empleado_id = fields.Many2one(
        'hr.employee',
        string="Empleado",
        required=True
    )

    mes = fields.Selection(
        [(str(i), str(i)) for i in range(1, 13)],
        string="Mes",
        required=True
    )

    anio = fields.Integer(
        string="Año",
        required=True,
        default=lambda self: fields.Date.today().year
    )

    def action_generar_nomina(self):
        self.ensure_one()

        mes = int(self.mes)
        anio = self.anio

        ultimo_dia = calendar.monthrange(anio, mes)[1]
        inicio_mes = datetime(anio, mes, 1)
        fin_mes = datetime(anio, mes, ultimo_dia, 23, 59, 59)

        Attendance = self.env['hr.attendance']
        Nomina = self.env['nomina.nomina']

        # Evitar duplicados
        existe = Nomina.search([
            ('empleado_id', '=', self.empleado_id.id),
            ('mes', '=', str(mes)),
            ('anio', '=', anio)
        ], limit=1)

        if existe:
            raise UserError("Ya existe una nómina para ese mes.")

        #  Comprobar anomalías pendientes
        anomalias = Attendance.search([
            ('employee_id', '=', self.empleado_id.id),
            ('check_in', '>=', inicio_mes),
            ('check_in', '<=', fin_mes),
            '|',
            ('requiere_revision', '=', True),
            ('estado_confirmacion', '=', 'pendiente')
        ])

        if anomalias:
            raise UserError("Existen fichajes con anomalías pendientes.")

        #  Calcular horas trabajadas
        attendances = Attendance.search([
            ('employee_id', '=', self.empleado_id.id),
            ('check_in', '>=', inicio_mes),
            ('check_in', '<=', fin_mes),
            ('check_out', '!=', False)
        ])

        horas_trabajadas = sum(attendances.mapped('worked_hours'))

        horas_extra = max(
            0,
            horas_trabajadas - self.empleado_id.horas_mensuales
        )

        Nomina.create({
            'empleado_id': self.empleado_id.id,
            'mes': str(mes),
            'anio': anio,
            'salario_base': self.empleado_id.salario_base,
            'horas_extra': horas_extra,
            'precio_hora_extra': self.empleado_id.precio_hora_extra,
            'complementos': 0.0
        })

        return {'type': 'ir.actions.act_window_close'}