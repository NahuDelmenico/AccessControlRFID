from django.db import models

# Create your models here.


#########################################################
####################   Employer    ######################
#########################################################

class Employee(models.Model):

    nombre = models.CharField(max_length=100)

    uid_rfid = models.CharField(
        max_length=20,
        unique=True
    )

    activo = models.BooleanField(
        default=True
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "empleados"

    def __str__(self):
        return self.nombre
    
#########################################################
######################    LOGS   ########################
#########################################################

class AccessLog(models.Model):

    empleado = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        null=True
    )

    uid_rfid = models.CharField(
        max_length=20
    )

    acceso_permitido = models.BooleanField()

    fecha_hora = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "registro_accesos"   