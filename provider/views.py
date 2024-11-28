from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.http import JsonResponse, HttpResponseRedirect
from main.models import Provider, Location, ProviderRatings, Tags, ProvidersTags, Item, Event, LocationHasItem, Event, LocationRatings,FavoriteLocations, Review, ReviewResponses, Report, Customer, LocationImpressions
import time,os
from django.db.models import Subquery, OuterRef
from django.conf import settings
import json
from django.contrib.auth.hashers import make_password
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.contrib import messages
from django.core.serializers.json import DjangoJSONEncoder


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




def fetchProvider(request,customer_id):
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
        'locationrating',
        'providerid'
    )

    # Create a list to store the enhanced location data
    enhanced_locations = []
    
    for location in locations_with_provider_and_ratings:
        # Get provider tags
        provider_tags = list(Tags.objects.filter(
            tagid__in=ProvidersTags.objects.filter(
                providerid=location['providerid']
            ).values('tagid')
        ).values('name'))
        
        # Add tags to location data
        location_data = dict(location)
        location_data['tags'] = provider_tags
        enhanced_locations.append(location_data)

    favlocation = list(FavoriteLocations.objects.filter(customerid=customer_id).values('locationid'))
    
    # Combine the two lists into a dictionary
    data = {
        'locations': enhanced_locations,
        'favorites': list(favlocation)
    }
    
    return JsonResponse(data, safe=False)


def tags_list(request):
    tags = Tags.objects.all().values('name')
    return JsonResponse(list(tags), safe=False)

def fetchData(request, providerid):
    provider = Provider.objects.get(providerid=providerid)
    tagids = ProvidersTags.objects.filter(providerid=providerid).values('tagid')
    selectedtags = [
        {'name': tag.name} 
        for id in tagids 
            for tag in Tags.objects.filter(tagid=id['tagid'])
    ]
    
    data = {
        'name': provider.name,
        'phonenumber': provider.phonenumber,
        'description': provider.description,
        'tags': selectedtags
    }
    
    return JsonResponse(data)



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
    location_info = [list(location),list(locationItems)]
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

def fetchEvents(request, customer_id):
    try:
        events = Event.objects.select_related(
            'locationid', 
            'locationid__providerid'
        ).values(
            'eventid',
            'name',
            'description',
            'startdate',
            'enddate',
            'starttime',
            'endtime',
            'locationid',
            'locationid__providerid__username',
            'locationid__providerid__name',
            'locationid__name',
            'locationid__coordinates'
        )
        
        events_data = {
            'events': [{
                'eventid': event['eventid'],
                'name': event['name'],
                'description': event['description'],
                'startdate': event['startdate'],
                'enddate': event['enddate'],
                'starttime': event['starttime'],
                'endtime': event['endtime'],
                'locationid': event['locationid'],
                'provider_username': event['locationid__providerid__username'],
                'provider_name': event['locationid__providerid__name'],
                'location_name': event['locationid__name'],
                'coordinates': event['locationid__coordinates']
            } for event in events]
        }
        
        return JsonResponse(events_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def fetchProviderEvents(request,provider_id):
    provider = Provider.objects.get(providerid=provider_id)
    locations = Location.objects.filter(providerid=provider)
    eventslist = []
    for location in locations:
        events = list(Event.objects.filter(locationid = location).values('name','eventid','startdate','enddate','starttime','endtime','description'))
        eventslist+=(events)
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

        eventImage = request.FILES.get('edit-event-upload-logo')
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

def providerReviews(request, provider_id):
    if request.session.get('user_type') != 'provider' or request.session.get('user_id') != provider_id:
        request.session.flush()
        return redirect('main:login')
    
    provider = Provider.objects.get(providerid=provider_id)
    return render(request, 'provider/provider-reviews.html', {
        'provider': provider,
    })

def fetchProviderReviews(request, provider_id):
    try:
        # Get all locations for this provider with their ratings
        locations = Location.objects.annotate(
            locationrating=Subquery(
                LocationRatings.objects.filter(locationid=OuterRef('locationid')).values('locationrating')[:1]
            )
        ).filter(providerid=provider_id)
        
        reviews_data = []
        for location in locations:
            location_data = {
                'locationId': location.locationid,
                'name': location.name,
                'rating': location.locationrating if location.locationrating else 0,
                'reviews': []
            }
            
            # Get reviews for this location
            reviews = Review.objects.filter(
                locationid=location
            ).select_related('customerid').order_by('-postdate')
            
            for review in reviews:
                review_data = {
                    'reviewId': review.reviewid,
                    'text': review.reviewtext,
                    'rating': review.rating,
                    'date': review.postdate.strftime('%Y-%m-%d') if review.postdate else None,
                    'customer_name': f"{review.customerid.firstname} {review.customerid.lastname}",
                    'customer_id': review.customerid.customerid,
                    'response': None
                }
                
                # Check if there's a response
                try:
                    response = ReviewResponses.objects.get(reviewid=review)
                    review_data['response'] = {
                        'text': response.responsetext,
                        'date': response.responsedate.strftime('%Y-%m-%d') if response.responsedate else None
                    }
                except ReviewResponses.DoesNotExist:
                    pass
                
                location_data['reviews'].append(review_data)
            
            reviews_data.append(location_data)
        
        return JsonResponse(reviews_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["POST"])
def submitReviewResponse(request):
    try:
        data = json.loads(request.body)
        review_id = data.get('reviewId')
        response_text = data.get('responseText')
        
        review = Review.objects.get(reviewid=review_id)
        provider = Provider.objects.get(providerid=request.session.get('user_id'))
        
        # Create or update the response
        response, created = ReviewResponses.objects.update_or_create(
            reviewid=review,
            customerid=review.customerid,
            providerid=provider,
            defaults={
                'responsetext': response_text,
                'responsedate': timezone.now()
            }
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Response submitted successfully',
            'response': {
                'text': response_text,
                'date': timezone.now().strftime('%Y-%m-%d')
            }
        })
        
    except Review.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Review not found'
        }, status=400)
    except Exception as e:
        print(f"Error in submitReviewResponse: {str(e)}")  # Add debugging
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)

def report_page(request, provider_id, reportee_type, reportee_id, reported_type, reported_id):
    if request.session.get('user_type') != 'provider' or request.session.get('user_id') != provider_id:
        request.session.flush()
        return redirect('main:login')
    
    if request.method == 'POST':
        try:
            report = Report(
                reporteeid=reportee_id,
                reporteetype=reportee_type,
                reportedid=reported_id,
                reportedtype=reported_type,
                type=request.POST.get('report_type'),
                description=request.POST.get('description'),
                status='PENDING'
            )
            report.save()
            messages.success(request, 'Report submitted successfully')
            return redirect('provider:providerReviews', provider_id=provider_id)
        except Exception as e:
            messages.error(request, f'Error submitting report: {str(e)}')
    
    # Get the reported entity's details
    reported_entity = None
    if reported_type == 'CUSTOMER':
        reported_entity = Customer.objects.get(customerid=reported_id)
        display_name = f"{reported_entity.firstname} {reported_entity.lastname}"
    elif reported_type == 'PROVIDER':
        reported_entity = Provider.objects.get(providerid=reported_id)
        display_name = reported_entity.name

    context = {
        'provider_id': provider_id,
        'reportee_type': reportee_type,
        'reportee_id': reportee_id,
        'reported_type': reported_type,
        'reported_id': reported_id,
        'reported_entity': reported_entity,
        'display_name': display_name,
        'timestamp': int(time.time()),
        'report_types': ['Inappropriate Content', 'Harassment', 'Spam', 'False Information', 'Other']
    }
    
    return render(request, 'provider/report.html', context)

def analytics(request, provider_id):
    if request.session.get('user_type') != 'provider' or request.session.get('user_id') != provider_id:
        request.session.flush()
        return redirect('main:login')
        
    provider = Provider.objects.get(providerid=provider_id)
    locations = Location.objects.filter(providerid=provider)
    
    analytics_data = []
    
    for location in locations:
        location_data = {
            'name': str(location.name),  # Ensure string
            'locationid': str(location.locationid),  # Convert to string
            'impressions': LocationImpressions.objects.filter(locationid=location).count() or 0,
            'favorites': FavoriteLocations.objects.filter(locationid=location).count() or 0,
            
            # Gender metrics
            'totalmaleimpressions': LocationImpressions.objects.filter(
                locationid=location,
                customerid__gender='M'
            ).count() or 0,
            'totalfemaleimpressions': LocationImpressions.objects.filter(
                locationid=location,
                customerid__gender='F'
            ).count() or 0,
            'totalmalefavorites': FavoriteLocations.objects.filter(
                locationid=location,
                customerid__gender='M'
            ).count() or 0,
            'totalfemalefavorites': FavoriteLocations.objects.filter(
                locationid=location,
                customerid__gender='F'
            ).count() or 0,
            
            # Age metrics
            'youngadultsimpressionscount': LocationImpressions.objects.filter(
                locationid=location,
                customerid__dob__gt=timezone.now().date() - timezone.timedelta(days=25*365)
            ).count() or 0,
            'adultsimpressionscount': LocationImpressions.objects.filter(
                locationid=location,
                customerid__dob__lte=timezone.now().date() - timezone.timedelta(days=25*365),
                customerid__dob__gt=timezone.now().date() - timezone.timedelta(days=45*365)
            ).count() or 0,
            'seniorimpressionscount': LocationImpressions.objects.filter(
                locationid=location,
                customerid__dob__lte=timezone.now().date() - timezone.timedelta(days=45*365)
            ).count() or 0,
            'youngadultsfavoritescount': FavoriteLocations.objects.filter(
                locationid=location,
                customerid__dob__gt=timezone.now().date() - timezone.timedelta(days=25*365)
            ).count() or 0,
            'adultsfavoritescount': FavoriteLocations.objects.filter(
                locationid=location,
                customerid__dob__lte=timezone.now().date() - timezone.timedelta(days=25*365),
                customerid__dob__gt=timezone.now().date() - timezone.timedelta(days=45*365)
            ).count() or 0,
            'seniorsfavoritescount': FavoriteLocations.objects.filter(
                locationid=location,
                customerid__dob__lte=timezone.now().date() - timezone.timedelta(days=45*365)
            ).count() or 0,
            
            # Reviews metrics
            'positive_reviews': Review.objects.filter(locationid=location, rating__gte=3).count() or 0,
            'negative_reviews': Review.objects.filter(locationid=location, rating__lt=3).count() or 0,
        }
        analytics_data.append(location_data)

    # Use json.dumps with proper encoding and escaping
    context = {
        'provider': provider,
        'analytics_data': json.dumps(analytics_data, cls=DjangoJSONEncoder),
        'timestamp': int(time.time())
    }
    
    return render(request, 'provider/analytics.html', context)


   