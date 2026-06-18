from django.urls import path
from .views import RFIDAccessView

urlpatterns = [
    path(
        "rfid/",
        RFIDAccessView.as_view(),
        name="rfid-access"
    ),
]