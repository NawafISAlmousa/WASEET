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

from django.urls import path
from . import views

app_name = "provider"

urlpatterns = [
    path('registerProvider/', views.registerProvider, name='registerProvider'),
    path('providers/<int:customer_id>', views.fetchProvider, name='fetchProviders'),
    path('tags/', views.tags_list, name='tags_list'),
    path('<int:provider_id>/', views.providerPage, name='providerPage'),
    path('fetchItems/<str:provider_id>/', views.fetchItems, name='fetchItems'),
    path('fetchData/<str:providerid>/', views.fetchData, name='fetchData'),
    path('fetchItemDetails/<str:item_id>/', views.fetchItemDetails, name='fetchItemDetails'),
    path('addItem/',views.addItem , name= 'addItem'),
    path('editItem/',views.editItem , name= 'editItem'),
    path('deleteItem/' , views.deleteItem ,name = 'deleteItem'),
    path('addLocation/',views.addLocation, name= 'addLocation'),
    path('deleteLocation/' , views.deleteLocation ,name = 'deleteLocation'),
    path('fetchLocations/<str:provider_id>/', views.fetchLocations, name='fetchLocations'),
    path('fetchLocationDetails/<str:LocationID>/', views.fetchLocationDetails, name='fetchLocationDetails'),
    path('editLocation/',views.editLocation , name= 'editLocation'),
    path('addEvent/',views.addEvent , name= 'addEvent'),
    path("fetchEvents/<str:provider_id>/",views.fetchProviderEvents,name='fetchEvents'),
    path('deleteEvent/', views.deleteEvent, name = 'deleteEvent'),
    path('fetchEventDetails/<str:event_id>/', views.fetchEventDetails, name='fetchEventDetails'),
    path('editEvent/',views.editEvent , name= 'editEvent'),
    path('events/<int:customer_id>', views.fetchEvents, name='fetchEvents'),
    path('reviews/<int:provider_id>/', views.providerReviews, name='providerReviews'),
    path('api/reviews/<int:provider_id>/', views.fetchProviderReviews, name='fetchProviderReviews'),
    path('api/review-response/', views.submitReviewResponse, name='submitReviewResponse'),
    path('report/<int:provider_id>/<str:reportee_type>/<int:reportee_id>/<str:reported_type>/<int:reported_id>/', 
         views.report_page, 
         name='report'),
    path('analytics/<int:provider_id>/', views.analytics, name='analytics'),
]
