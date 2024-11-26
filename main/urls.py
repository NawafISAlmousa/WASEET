from django.urls import path, include
from . import views


app_name = "main"

urlpatterns = [
    path('', views.index, name='index'),
    path('Login/',views.login,name='login'),
    path('logout/', views.logout, name='logout'),
    path('support/', views.support_view, name='support'),
]
