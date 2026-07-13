from rest_framework import serializers

from .models import (
    Employee,
    AccessLog
)


# =====================================================
# EMPLOYEE
# =====================================================

class EmployeeSerializer(serializers.ModelSerializer):

    class Meta:

        model = Employee

        fields = [
            'id',
            'nombre',
            'uid_rfid',
            'activo',
            'fecha_creacion'
        ]

        read_only_fields = [
            'id',
            'fecha_creacion'
        ]


# =====================================================
# ACCESS LOG
# =====================================================

class AccessLogSerializer(serializers.ModelSerializer):

    empleado_nombre = serializers.CharField(
        source='empleado.nombre',
        read_only=True
    )

    class Meta:

        model = AccessLog

        fields = [
            'id',
            'empleado',
            'empleado_nombre',
            'uid_rfid',
            'acceso_permitido',
            'fecha_hora'
        ]

        read_only_fields = [
            'id',
            'fecha_hora',
            'empleado_nombre'
        ]