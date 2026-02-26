from odoo import models, fields, api
import base64


class Nomina(models.Model):
    _name = 'nomina.nomina'
    _description = 'Nomina mensual del empleado'

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