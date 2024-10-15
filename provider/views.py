from django.shortcuts import render
from django.http import JsonResponse
from main.models import Provider, Location, ProviderRatings
import time
from django.db.models import Subquery, OuterRef

# Create your views here.


def registerProvider(request):
    return render(request , 'provider/register-provider.html')


def fetchProvider(request):

    providers_with_location_and_ratings = Provider.objects.annotate(
    providerrating=Subquery(
        ProviderRatings.objects.filter(providerid=OuterRef('providerid')).values('providerrating')[:1]
    )
    ).prefetch_related('location').values(
    'name', 'description', 'location__coordinates', 'location__phonenumber', 'providerrating'
    )

    data = list(providers_with_location_and_ratings)
    
    return JsonResponse(data,safe=False)