from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Employee, AccessLog


class RFIDAccessView(APIView):

    def get(self, request):

        uid = request.GET.get("uid")

        empleado = Employee.objects.filter(
            uid_rfid=uid,
            activo=True
        ).first()

        if empleado:

            AccessLog.objects.create(
                empleado=empleado,
                uid_rfid=uid,
                acceso_permitido=True
            )

            return Response({
                "authorized": True,
                "name": empleado.nombre
            })

        AccessLog.objects.create(
            uid_rfid=uid,
            acceso_permitido=False
        )

        return Response({
            "authorized": False
        })