from django.shortcuts import render,redirect
from django.http import JsonResponse
from main.models import Provider, Location, ProviderRatings
import time,os
from django.db.models import Subquery, OuterRef
from django.conf import settings


# Create your views here.


def registerProvider(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        name = request.POST.get('provider-name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        phonenumber = request.POST.get('provider-number')
        description = request.POST.get('description')
        # tags = request.POST.get("tags")
        image = request.FILES.get('upload-logo')

        provider_folder = os.path.join(settings.MEDIA_ROOT, username)
        os.makedirs(provider_folder, exist_ok=True)

        # original_extension = os.path.splitext(image.name)[1]

        # Save the image inside the provider's folder
        image_path = os.path.join(provider_folder, 'logo.png')
        with open(image_path, 'wb+') as destination:
            for chunk in image.chunks():
                destination.write(chunk)

        # Save provider info in the database (without storing image path)
        provider = Provider(name = name, email = email, password = password,description=description,username=username)
        provider.save()
        
        return redirect('main:login')
    
    return render(request , 'provider/register-provider.html')




def providerPage(request):
    return render(request,'provider/provider-page.html')




def fetchProvider(request):

    providers_with_location_and_ratings = Provider.objects.annotate(
    providerrating=Subquery(
        ProviderRatings.objects.filter(providerid=OuterRef('providerid')).values('providerrating')[:1]
    )
    ).prefetch_related('location').values('username',
    'name', 'description', 'location__coordinates', 'location__phonenumber', 'providerrating'
    )
    
    
    data = list(providers_with_location_and_ratings)
    
    return JsonResponse(data,safe=False)
    pass