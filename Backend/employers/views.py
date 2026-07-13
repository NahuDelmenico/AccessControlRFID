from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view

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
    
    from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import (
    Employee,
    AccessLog
)

from .serializers import (
    EmployeeSerializer,
    AccessLogSerializer
)


# =====================================================
# EMPLOYEE CRUD
# =====================================================

@api_view(['GET', 'POST'])
def employee_list(request):

    if request.method == 'GET':

        employees = Employee.objects.all()

        serializer = EmployeeSerializer(
            employees,
            many=True
        )

        return Response(serializer.data)

    elif request.method == 'POST':

        serializer = EmployeeSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET', 'PUT', 'DELETE'])
def employee_detail(request, pk):

    employee = get_object_or_404(
        Employee,
        pk=pk
    )

    if request.method == 'GET':

        serializer = EmployeeSerializer(employee)

        return Response(serializer.data)

    elif request.method == 'PUT':

        serializer = EmployeeSerializer(
            employee,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    elif request.method == 'DELETE':

        employee.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


# =====================================================
# ACCESS LOG CRUD
# =====================================================

@api_view(['GET', 'POST'])
def access_log_list(request):

    if request.method == 'GET':

        logs = AccessLog.objects.select_related(
            'empleado'
        ).all()

        serializer = AccessLogSerializer(
            logs,
            many=True
        )

        return Response(serializer.data)

    elif request.method == 'POST':

        serializer = AccessLogSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET', 'PUT', 'DELETE'])
def access_log_detail(request, pk):

    log = get_object_or_404(
        AccessLog.objects.select_related(
            'empleado'
        ),
        pk=pk
    )

    if request.method == 'GET':

        serializer = AccessLogSerializer(log)

        return Response(serializer.data)

    elif request.method == 'PUT':

        serializer = AccessLogSerializer(
            log,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    elif request.method == 'DELETE':

        log.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )