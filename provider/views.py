from django.shortcuts import render,redirect
from django.urls import reverse
from django.http import JsonResponse, HttpResponseRedirect
from main.models import Provider, Location, ProviderRatings, Tags, ProvidersTags, Item, Event
import time,os
from django.db.models import Subquery, OuterRef
from django.conf import settings
import json


# Create your views here.

def registerProvider(request):
    if request.method == 'POST':
        print(request.POST)  # Debugging print

        # Collect form data
        username = request.POST.get('username')
        name = request.POST.get('provider-name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        phonenumber = request.POST.get('provider-number')
        description = request.POST.get('description')

        # Convert the tags string into a list
        tags = json.loads(request.POST.get("tags"))  # Ensure tags is a list
        print(tags)  # Debugging print

        # Handle image upload
        image = request.FILES.get('upload-logo')
        provider_folder = os.path.join(settings.MEDIA_ROOT, username)
        os.makedirs(provider_folder, exist_ok=True)

        # Save the uploaded image
        image_path = os.path.join(provider_folder, 'logo.png')
        if image:
            with open(image_path, 'wb+') as destination:
                for chunk in image.chunks():
                    destination.write(chunk)

        # Save provider info in the database
        provider = Provider(
            name=name, email=email, password=password,
            description=description, username=username, phonenumber=phonenumber
        )
        provider.save()

        # Link tags to the provider
        for tag_name in tags:
            tag = Tags.objects.filter(name=tag_name).first()
            if tag:  # Only create a link if the tag exists
                link = ProvidersTags(tagid=tag, providerid=provider)
                link.save()
            else:
                print(f"Tag '{tag_name}' not found.")  # Debugging print

        return redirect('main:login')

    return render(request, 'provider/register-provider.html')




def providerPage(request, provider_id):
    if request.session.get('user_type') != 'provider' or request.session.get('user_id') != provider_id:
        request.session.flush()
        return redirect('main:login')  # Redirect unauthorized access to login
    
    if request.method == 'POST':
        username = request.POST.get('username')
        name = request.POST.get('provider-name')
        phonenumber = request.POST.get('provider-number')
        description = request.POST.get('description')
        
        tags = json.loads(request.POST.get("tags"))  # Ensure tags is a list
        print(tags)  # Debugging print


        # Handle image upload only if a new logo file is provided
        image = request.FILES.get('upload-logo')
        if image:
            provider_folder = os.path.join(settings.MEDIA_ROOT, username)
            os.makedirs(provider_folder, exist_ok=True)
    
            # Save the uploaded image
            image_path = os.path.join(provider_folder, 'logo.png')
            with open(image_path, 'wb+') as destination:
                for chunk in image.chunks():
                    destination.write(chunk)

        provider = Provider.objects.get(providerid=provider_id)

        provider.name = name
        provider.description = description
        provider.phonenumber = phonenumber

        provider.save()

        ProvidersTags.objects.filter(providerid=provider).delete()

        for tag_name in tags:
            tag = Tags.objects.filter(name=tag_name).first()
            if tag:  # Only create a link if the tag exists
                link = ProvidersTags(tagid=tag, providerid=provider)
                link.save()
            else:
                print(f"Tag '{tag_name}' not found.")  # Debugging print

        return JsonResponse({'success': True})



    # If authorized, render the provider's page
    provider = Provider.objects.get(providerid=provider_id)
    locations = Location.objects.filter(providerid=provider_id)
    items = Item.objects.filter(providerid=provider_id)
    selectedtags = ProvidersTags.objects.filter(providerid=provider_id)
    # unselectedtags = Tags.objects.exclude(tagid__in=ProvidersTags.objects.values('tagid'))

    events = []

    for location in locations:
        temp_events = Event.objects.filter(locationid=location.locationid)
        for event in temp_events:
            events.append(event)



    return render(request,'provider/provider-page.html', {
        'provider': provider,
    })




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



def tags_list(request):
    tags = Tags.objects.all().values('name')
    return JsonResponse(list(tags), safe=False)

def fetchData(request,providerid):
    # locations = Location.objects.filter(providerid=providerid).values()
    # items = Item.objects.filter(providerid=providerid).values()
    # events = [event for location in locations for event in Event.objects.filter(locationid=location.id).values()]
    tagids = ProvidersTags.objects.filter(providerid=providerid).values('tagid')

    selectedtags = [tagname for id in list(tagids) for tagname in Tags.objects.filter(tagid=id['tagid']).values('name')]
    
    data = list(selectedtags)
    # print(data) #Debugging

    return JsonResponse(data,safe=False)



def addItem(request):
    if request.method == "POST":
        itemName = request.POST.get('add-item-name')
        itemPrice = request.POST.get('add-item-price')
        itemDescription = request.POST.get('add-item-description')
        providerid = Provider.objects.get(providerid=request.POST.get('providerid'))


        item = Item(name = itemName, price = itemPrice, description = itemDescription, providerid= providerid)

        item.save()


        itemID = item.itemid

        username = Provider.objects.filter(providerid = providerid.providerid).values('username')[0]['username']

        itemImage = request.FILES.get('add-item-logo-input')
        provider_folder = os.path.join(settings.MEDIA_ROOT, username) # waseet/media/username
        item_folder = os.path.join(provider_folder, 'items')
        os.makedirs(item_folder, exist_ok=True)

        # Save the uploaded image
        image_path = os.path.join(item_folder, f'item{itemID}.png')
        if itemImage:
            with open(image_path, 'wb+') as destination:
                for chunk in itemImage.chunks():
                    destination.write(chunk)
        return redirect('provider:providerPage', provider_id = providerid.providerid)
    pass 




def fetchItems(request, provider_id):
    # Retrieve items for the given provider
    items = Item.objects.filter(providerid=provider_id).values('itemid', 'name', 'price', 'description')
    
    # Convert the queryset to a list of dictionaries
    items_list = list(items)
    
    return JsonResponse(items_list, safe=False)


def fetchItemDetails(request, item_id):
    # Retrieve items for the given provider
    item = Item.objects.filter(itemid=item_id).values('itemid', 'name', 'price', 'description')
    
    # Convert the queryset to a list of dictionaries
    fetcheditem = list(item)[0]
    
    return JsonResponse(fetcheditem, safe=False)


def editItem(request):
    if request.method == "POST":
        itemName = request.POST.get('item-name')
        itemPrice = request.POST.get('item-price')
        itemDescription = request.POST.get('item-description')
        providerid = Provider.objects.get(providerid=request.POST.get('providerid'))
        itemid = request.POST.get('itemid')
        print(itemid, type(itemid))

        item = Item.objects.get(itemid=itemid)


        item.name = itemName
        item.price = itemPrice
        item.description = itemDescription

        item.save()


        itemID = itemid

        username = Provider.objects.filter(providerid = providerid.providerid).values('username')[0]['username']

        itemImage = request.FILES.get('add-item-logo-input')
        provider_folder = os.path.join(settings.MEDIA_ROOT, username) # waseet/media/username
        item_folder = os.path.join(provider_folder, 'items')
        os.makedirs(item_folder, exist_ok=True)

        # Save the uploaded image
        image_path = os.path.join(item_folder, f'item{itemID}.png')
        if itemImage:
            with open(image_path, 'wb+') as destination:
                for chunk in itemImage.chunks():
                    destination.write(chunk)
        return redirect('provider:providerPage', provider_id = providerid.providerid)
    pass 