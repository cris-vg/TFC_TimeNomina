from odoo import models, fields, api


class Nomina(models.Model):
    _name = 'nomina.nomina'  # Nombre técnico del modelo en base de datos
    _description = 'Nomina mensual del empleado'


    # =====================================================
    # DATOS GENERALES
    # =====================================================

    empleado_id = fields.Many2one(
        'hr.employee',
        string='Empleado',
        required=True
    )
    # Relación con el empleado al que pertenece la nómina


    mes = fields.Selection(
        [(str(i), str(i)) for i in range(1, 13)],
        string='Mes',
        required=True
    )
    # Mes al que corresponde la nómina


    anio = fields.Integer(
        string='Año',
        required=True,
        default=lambda self: fields.Date.today().year
    )
    # Año de la nómina


    # =====================================================
    # DATOS ECONÓMICOS
    # =====================================================

    salario_base = fields.Float(
        string='Salario base'
    )
    # Salario fijo mensual del empleado


    horas_extra = fields.Float(
        string='Horas extra'
    )
    # Número de horas extra realizadas en el mes


    precio_hora_extra = fields.Float(
        string='Precio por hora extra'
    )
    # Importe que se paga por cada hora extra


    complementos = fields.Float(
        string='Complementos'
    )
    # Otros importes adicionales (transporte, productividad, etc.)


    total_bruto = fields.Float(
        string='Total bruto',
        compute='_calcular_total_bruto',
        store=True
    )
    # Total calculado automáticamente


    # =====================================================
    # MÉTODOS DE CÁLCULO
    # =====================================================

    @api.depends('salario_base', 'horas_extra', 'precio_hora_extra', 'complementos')
    def _calcular_total_bruto(self):
        """
        Método que calcula automáticamente el total bruto de la nómina.

        Fórmula:
        total = salario_base
                + (horas_extra * precio_hora_extra)
                + complementos
        """
        for registro in self:
            registro.total_bruto = (
                registro.salario_base +
                (registro.horas_extra * registro.precio_hora_extra) +
                registro.complementos
            )
