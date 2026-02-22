# -*- coding: utf-8 -*-
from odoo import models, fields


class AttendanceJustification(models.Model):
    _name = 'attendance.justification'
    _description = 'Justificación de Fichaje'
    _order = 'fecha desc'

    # 👤 Empleado que crea la justificación
    employee_id = fields.Many2one(
        'hr.employee',
        string="Empleado",
        required=True,
        ondelete='cascade'
    )

    # 🕒 Fichaje relacionado (opcional)
    attendance_id = fields.Many2one(
        'hr.attendance',
        string="Fichaje relacionado"
    )

    # 📅 Fecha de la incidencia
    fecha = fields.Datetime(
        string="Fecha",
        required=True,
        default=fields.Datetime.now
    )

    # 🏷 Tipo de justificación
    tipo = fields.Selection(
        [
            ('retraso', 'Retraso'),
            ('olvido', 'Olvido de fichaje'),
            ('salida_anticipada', 'Salida anticipada'),
            ('ausencia_parcial', 'Ausencia parcial'),
            ('otro', 'Otro')
        ],
        string="Tipo",
        required=True
    )

    # 📝 Descripción del empleado
    descripcion = fields.Text(
        string="Descripción",
        required=True
    )

    # 📎 Documento adjunto
    documento = fields.Binary(
        string="Documento adjunto"
    )

    nombre_documento = fields.Char(
        string="Nombre del archivo"
    )

    # 🔄 Estado de validación
    estado = fields.Selection(
        [
            ('pendiente', 'Pendiente'),
            ('aprobado', 'Aprobado'),
            ('rechazado', 'Rechazado')
        ],
        string="Estado",
        default='pendiente'
    )

    # 💬 Comentario de RRHH
    comentario_rrhh = fields.Text(
        string="Comentario RRHH"
    )