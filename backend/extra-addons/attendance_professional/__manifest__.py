{
    "name": "Attendance Professional",
    "version": "1.0",
    "author": "Cristina",
    "category": "Human Resources",
    "depends": ["hr", "hr_attendance"],
    "data": [
        "security/nomina_groups.xml",  
        "security/ir.model.access.csv",
        "security/nomina_security.xml",
        "views/nomina_wizard_views.xml",
        "views/nomina_views.xml",
        "views/justificacion_views.xml",
        "reports/nomina_report.xml",
        "views/hr_employee_views.xml",
        
    ],
    "installable": True,
    "application": False,
}