from django.urls import path
from .views import (
    RFIDAccessView,
    employee_list,
    employee_detail,
    access_log_list,
    access_log_detail,
)

urlpatterns = [
    path(
        "rfid/",
        RFIDAccessView.as_view(),
        name="rfid-access"
    ),

    # Employee
    path(
        "employees/",
        employee_list,
        name="employee-list"
    ),

    path(
        "employees/<int:pk>/",
        employee_detail,
        name="employee-detail"
    ),

    # Access Logs
    path(
        "access-logs/",
        access_log_list,
        name="access-log-list"
    ),

    path(
        "access-logs/<int:pk>/",
        access_log_detail,
        name="access-log-detail"
    ),
]