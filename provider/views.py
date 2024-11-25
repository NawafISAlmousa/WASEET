from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.http import JsonResponse, HttpResponseRedirect
from main.models import Provider, Location, ProviderRatings, Tags, ProvidersTags, Item, Event, LocationHasItem, Event, LocationRatings
import time,os
from django.db.models import Subquery, OuterRef
from django.conf import settings
import json
from django.contrib.auth.hashers import make_password


# Create your views here.

def registerProvider(request):
    if request.method == 'POST':
        # Collect form data
        username = request.POST.get('username')
        name = request.POST.get('provider-name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        phonenumber = request.POST.get('provider-number')
        description = request.POST.get('description')

        # Validation checks
        errors = {}
        if Provider.objects.filter(username=username).exists():
            errors['username'] = 'This username is already taken.'
        if Provider.objects.filter(email=email).exists():
            errors['email'] = 'This email is already registered.'

        # If there are errors, return them as JSON
        if errors:
            return JsonResponse({'status': 'error', 'errors': errors})

        # If no errors, continue with form processing
        tags = json.loads(request.POST.get("tags"))  # Convert tags string into a list
        image = request.FILES.get('upload-logo')
        provider_folder = os.path.join(settings.MEDIA_ROOT, username)
        os.makedirs(provider_folder, exist_ok=True)

        # Handle image upload, default if missing
        image_path = os.path.join(provider_folder, 'logo.png')
        if image:
            with open(image_path, 'wb+') as destination:
                for chunk in image.chunks():
                    destination.write(chunk)
        else:
            # Use default image if no file uploaded
            default_image_path = os.path.join(settings.STATIC_ROOT, 'main/assets/BigLogo.png')
            os.system(f'cp {default_image_path} {image_path}')

        # Save provider information
        provider = Provider(
            name=name, email=email, password=make_password(password),
            description=description, username=username, phonenumber=phonenumber
        )
        provider.save()

        # Link tags to the provider
        for tag_name in tags:
            tag = Tags.objects.filter(name=tag_name).first()
            if tag:
                link = ProvidersTags(tagid=tag, providerid=provider)
                link.save()
            else:
                print(f"Tag '{tag_name}' not found.")  # Debugging print

        # Return success response
        return JsonResponse({'status': 'success'})
    else:
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

    locations_with_provider_and_ratings = Location.objects.annotate(
        providerrating=Subquery(
                ProviderRatings.objects.filter(providerid=OuterRef('providerid')).values('providerrating')[:1]
        ),
        locationrating=Subquery(
            LocationRatings.objects.filter(locationid=OuterRef('locationid')).values('locationrating')[:1]
        )
    ).select_related('providerid').values(
        'name',
        'locationid',
        'coordinates', 
        'phonenumber', 
        'providerid__username', 
        'providerid__name', 
        'providerid__description', 
        'providerrating',
        'locationrating'
    )
    
    
    data = list(locations_with_provider_and_ratings)
    
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

        itemImage = request.FILES.get('item-logo-input')
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

def deleteItem(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        item_id = data.get("itemID")
        provider_id = data.get('providerID')
        
        # Retrieve the item and provider instances
        item = get_object_or_404(Item, itemid=item_id)
        provider = get_object_or_404(Provider, providerid=provider_id)
        
        # Construct the file path for the image
        username = provider.username  # Retrieve provider's username
        image_path = os.path.join(settings.MEDIA_ROOT, username, 'items', f'item{item_id}.png')
        
        # Delete the image file if it exists
        if os.path.isfile(image_path):
            os.remove(image_path)
        
        # Delete the item from the database
        item.delete()
        
    return redirect('provider:providerPage', provider_id=provider.providerid)


def addLocation(request):
    if request.method == "POST":
       
        locationName = request.POST.get('add-location-name')
        locationNumber = request.POST.get('add-location-number')
        locationlatitude = request.POST.get('add-location-latitude')
        locationlongitude = request.POST.get('add-location-longitude')
        locationCoord = f'{locationlatitude},{locationlongitude}'
        provider = Provider.objects.get(providerid=request.POST.get('providerid'))
        location = Location(name=locationName,phonenumber=locationNumber,coordinates=locationCoord,providerid=provider)

        location.save()

        
        if request.POST.get('checkedItems'): 
            itemIds = (request.POST.get('checkedItems').split(','))
            for itemid in itemIds:
                item = Item.objects.get(itemid=itemid)
                link = LocationHasItem(locationid=location,itemid=item)
                print(link,item)
                link.save()
    return redirect('provider:providerPage', provider_id = provider.providerid)


        
def fetchLocations(request, provider_id):
    # Retrieve items for the given provider
    locations = Location.objects.filter(providerid=provider_id).values('locationid', 'name', 'phonenumber', 'coordinates')
    
    # Convert the queryset to a list of dictionaries
    locations_list = list(locations)
    
    return JsonResponse(locations_list, safe=False)


def deleteLocation(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        location_id = data.get("locationID")
        provider_id = data.get('providerID')
        
        # Retrieve the item and provider instances
        location = get_object_or_404(Location, locationid=location_id)
        
        # Delete the item from the database
        location.delete()
        
    return redirect('provider:providerPage', provider_id=provider_id)

def fetchLocationDetails(request,LocationID):
    location = Location.objects.filter(locationid=LocationID).values('locationid', 'providerid', 'coordinates', 'phonenumber','name')
    locationItems = LocationHasItem.objects.filter(locationid = LocationID).values('itemid')
    print(locationItems)

    location_info = [list(location),list(locationItems)]
    print(location_info)
    return JsonResponse(location_info, safe=False)

def editLocation(request):
    if request.method == "POST":
        name = request.POST.get('edit-location-name')
        phoneNumber = request.POST.get('edit-location-number')
        providerID = request.POST.get('providerid')
        lat = request.POST.get('edit-location-latitude')
        lon = request.POST.get('edit-location-longitude')
        locId = request.POST.get('location-id')
        location = Location.objects.get(locationid = locId)

        location.name = name
        location.phonenumber = phoneNumber
        location.coordinates = f"{lat},{lon}"
        location.save()

        
        links = LocationHasItem.objects.filter(locationid=location).delete()

        if (request.POST.get('checkedItems')): 
            itemIds = (request.POST.get('checkedItems').split(','))
            for itemid in itemIds:
                item = Item.objects.get(itemid=itemid)
                link = LocationHasItem(locationid=location,itemid=item)
                print(link)
                link.save()
    return redirect('provider:providerPage', provider_id = providerID)




def addEvent(request):
    if request.method == "POST":
        eventName = request.POST.get('event-name')
        eventDesc = request.POST.get('event-description')
        startDate = request.POST.get('event-start-date')
        endDate = request.POST.get('event-end-date')
        startTime = request.POST.get('event-start-time')
        endTime = request.POST.get('event-end-time')

        provider = Provider.objects.get(providerid=request.POST.get('providerid'))

        location = Location.objects.get(locationid=request.POST.get('event-location'))

        event = Event(name=eventName, description=eventDesc, starttime=startTime, startdate=startDate, enddate=endDate, endtime=endTime, locationid=location)

        event.save()

        eventId = event.eventid


        username = Provider.objects.filter(providerid = provider.providerid).values('username')[0]['username']

        eventImage = request.FILES.get('add-event-upload-logo')
        provider_folder = os.path.join(settings.MEDIA_ROOT, username) # waseet/media/username
        event_folder = os.path.join(provider_folder, 'events')
        os.makedirs(event_folder, exist_ok=True)

        # Save the uploaded image
        image_path = os.path.join(event_folder, f'event{eventId}.png')
        if eventImage:
            with open(image_path, 'wb+') as destination:
                for chunk in eventImage.chunks():
                    destination.write(chunk)
        pass
    return redirect('provider:providerPage', provider_id = provider.providerid)

def fetchEvents(request,provider_id):
    provider = Provider.objects.get(providerid=provider_id)
    locations = Location.objects.filter(providerid=provider)
    eventslist = []
    for location in locations:
        events = list(Event.objects.filter(locationid = location).values('name','eventid','startdate','enddate','starttime','endtime','description'))
        eventslist+=(events)
        print(eventslist)
    
    return JsonResponse(eventslist, safe=False)



def deleteEvent(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        event_id = data.get("eventID")
        provider_id = data.get('providerID')
        
        # Retrieve the item and provider instances
        event = get_object_or_404(Event, eventid=event_id)
        provider = get_object_or_404(Provider, providerid=provider_id)
        
        # Construct the file path for the image
        username = provider.username  # Retrieve provider's username
        image_path = os.path.join(settings.MEDIA_ROOT, username, 'events', f'event{event_id}.png')
        
        # Delete the image file if it exists
        if os.path.isfile(image_path):
            os.remove(image_path)
        
        # Delete the item from the database
        event.delete()
        
    return redirect('provider:providerPage', provider_id=provider.providerid)




def fetchEventDetails(request, event_id):
    # Retrieve items for the given provider
    event = Event.objects.filter(eventid=event_id).values('eventid', 'name',  'description', 'startdate', 'enddate','starttime','endtime','locationid' )
    
    # Convert the queryset to a list of dictionaries
    fetchedEvent = list(event)[0]
    
    return JsonResponse(fetchedEvent, safe=False)





def editEvent(request):
    if request.method == "POST":
        eventName = request.POST.get('edit-event-name')
        eventDesc = request.POST.get('edit-event-description')
        startDate = request.POST.get('edit-event-start-date')
        endDate = request.POST.get('edit-event-end-date')
        startTime = request.POST.get('edit-event-start-time')
        endTime = request.POST.get('edit-event-end-time')
        eventId = request.POST.get('eventid')

        provider = Provider.objects.get(providerid=request.POST.get('providerid'))

        location = Location.objects.get(locationid=request.POST.get('event-location'))

        event = Event.objects.get(eventid=eventId)
        event.name = eventName
        event.description = eventDesc
        event.startdate = startDate
        event.enddate = endDate
        event.starttime = startTime
        event.endtime = endTime
        event.locationid = location
        event.save()


        username = Provider.objects.filter(providerid = provider.providerid).values('username')[0]['username']

        eventImage = request.FILES.get('add-event-upload-logo')
        provider_folder = os.path.join(settings.MEDIA_ROOT, username) # waseet/media/username
        event_folder = os.path.join(provider_folder, 'events')
        os.makedirs(event_folder, exist_ok=True)

        # Save the uploaded image
        image_path = os.path.join(event_folder, f'event{eventId}.png')
        if eventImage:
            with open(image_path, 'wb+') as destination:
                for chunk in eventImage.chunks():
                    destination.write(chunk)
        pass
    return redirect('provider:providerPage', provider_id = provider.providerid)


   