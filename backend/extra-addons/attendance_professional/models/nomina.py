from odoo import models, fields, api
import base64
from datetime import date


class Nomina(models.Model):
    _name = 'nomina.nomina'
    _description = 'Nomina mensual del empleado'
    _inherit = ['mail.thread']

    # =====================================================
    # DATOS GENERALES
    # =====================================================

    empleado_id = fields.Many2one(
        'hr.employee',
        string='Empleado',
        required=True
    )

    mes = fields.Selection(
        [(str(i), str(i)) for i in range(1, 13)],
        string='Mes',
        required=True
    )

    anio = fields.Integer(
        string='Año',
        required=True,
        default=lambda self: fields.Date.today().year
    )

    # =====================================================
    # DATOS ECONÓMICOS
    # =====================================================

    salario_base = fields.Float(string='Salario base')
    horas_extra = fields.Float(string='Horas extra')
    precio_hora_extra = fields.Float(string='Precio por hora extra')
    complementos = fields.Float(string='Complementos')

    total_bruto = fields.Float(
        string='Total bruto',
        compute='_calcular_total_bruto',
        store=True
    )

    # =====================================================
    # MÉTODO CÁLCULO TOTAL
    # =====================================================

    @api.depends('salario_base', 'horas_extra', 'precio_hora_extra', 'complementos')
    def _calcular_total_bruto(self):
        for registro in self:
            salario = registro.salario_base or 0.0
            horas = registro.horas_extra or 0.0
            precio = registro.precio_hora_extra or 0.0
            complementos = registro.complementos or 0.0

            registro.total_bruto = salario + (horas * precio) + complementos

    # =====================================================
    # GENERACIÓN AUTOMÁTICA DE NÓMINAS (NUEVO)
    # =====================================================

    @api.model
    def generar_nominas_mes(self, mes, anio):

        empleados = self.env['hr.employee'].search([])

        for empleado in empleados:

            # Saltar empleados sin salario definido
            if not empleado.salario_base:
                continue

            # Evitar duplicados
            existe = self.search([
                ('empleado_id', '=', empleado.id),
                ('mes', '=', str(mes)),
                ('anio', '=', anio)
            ], limit=1)

            if existe:
                continue

            # Calcular rango del mes
            fecha_inicio = date(anio, mes, 1)

            if mes == 12:
                fecha_fin = date(anio + 1, 1, 1)
            else:
                fecha_fin = date(anio, mes + 1, 1)

            attendances = self.env['hr.attendance'].search([
                ('employee_id', '=', empleado.id),
                ('check_in', '>=', fecha_inicio),
                ('check_in', '<', fecha_fin)
            ])

            horas_trabajadas = sum(att.worked_hours for att in attendances)

            # Regla simple mensual
            HORAS_TEORICAS = 160

            horas_extra = max(0, horas_trabajadas - HORAS_TEORICAS)

            self.create({
                'empleado_id': empleado.id,
                'mes': str(mes),
                'anio': anio,
                'salario_base': empleado.salario_base,
                'horas_extra': horas_extra,
                'precio_hora_extra': empleado.precio_hora_extra,
                'complementos': 0.0,
            })

     # =====================================================
    # MÉTODO PARA CRON AUTOMÁTICO
    # =====================================================

    @api.model
    def generar_nominas_automaticas(self):

        hoy = fields.Date.today()

        if hoy.month == 1:
            mes = 12
            anio = hoy.year - 1
        else:
            mes = hoy.month - 1
            anio = hoy.year

        contador_antes = self.search_count([
            ('mes', '=', str(mes)),
            ('anio', '=', anio)
        ])

        self.generar_nominas_mes(mes, anio)

        contador_despues = self.search_count([
            ('mes', '=', str(mes)),
            ('anio', '=', anio)
        ])

        creadas = contador_despues - contador_antes

        # Registrar mensaje en chatter del modelo (solo si creó algo)
        if creadas > 0:
            self.env['mail.message'].create({
                'model': 'nomina.nomina',
                'body': f"El cron automático generó {creadas} nóminas para {mes}/{anio}.",
                'message_type': 'notification',
            })

    # =====================================================
    # MÉTODO DESCARGA PDF
    # =====================================================

    def descargar_pdf_app(self):
        self.ensure_one()

        if not self.env.user.employee_id or self.env.user.employee_id.id != self.empleado_id.id:
            return {"success": False}

        report_service = self.env['ir.actions.report']

        pdf_content, _ = report_service._render_qweb_pdf(
            'attendance_professional.report_nomina_pdf',
            res_ids=[self.id]
        )

        return {
            "success": True,
            "pdf_base64": base64.b64encode(pdf_content).decode('utf-8'),
            "filename": f"Nomina_{self.mes}_{self.anio}.pdf"
        }