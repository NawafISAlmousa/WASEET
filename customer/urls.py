"""
URL configuration for waseet project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path,include
from . import views

app_name = "customer"

urlpatterns = [
    path('register-customer/', views.registerCustomer, name='register-customer'),
    path('<int:customer_id>/',views.mainPage,name='mainPage'),
    path('<int:customer_id>/view-provider/<int:location_id>/', views.viewProviderPage, name='viewProviderPage'),
    path('<int:customerid>/<int:locationid>/add-bookmark/', views.add_bookmark, name='add_bookmark'),
    path('location/<int:location_id>/reviews/', views.get_location_reviews, name='get_location_reviews'),
    path('location/<int:location_id>/submit-review/', views.submit_review, name='submit_review'),
    path('<int:customer_id>/manage-profile/', views.manage_profile, name='manage-profile'),
    path('<int:customer_id>/update-profile/', views.update_profile, name='update-profile'),
    path('<int:customer_id>/favorites/', views.favorites_page, name='favorites'),
    path('favorites/<int:customer_id>/<int:location_id>/remove/', views.remove_favorite, name='remove-favorite'),
    path('api/<int:customer_id>/favorites/', views.get_favorites, name='get_favorites'),
    path('report/<int:customer_id>/<str:reportee_type>/<int:reportee_id>/<str:reported_type>/<int:reported_id>/', 
         views.report_page, 
         name='report'),
]
