from django.shortcuts import render, redirect
from main import models
from django.contrib import messages
from django.contrib.auth.hashers import make_password
from main.models import Customer, Provider, Location, LocationHasItem, LocationRatings, ProviderRatings, Event, FavoriteLocations, Review, LocationImpressions
from django.db.models import OuterRef, Subquery
from django.http import JsonResponse
import json
from django.views.decorators.http import require_http_methods
from django.core.serializers import serialize
from datetime import date

def viewProviderPage(request, customer_id, location_id):
    # Get location and related provider
    location = Location.objects.annotate(
        locationrating=Subquery(
            LocationRatings.objects.filter(locationid=OuterRef('locationid')).values('locationrating')[:1]
        ),
        providerrating=Subquery(
            ProviderRatings.objects.filter(providerid=OuterRef('providerid')).values('providerrating')[:1]
        )
    ).get(locationid=location_id)
    
    # Create impression record using save()
    customer = Customer.objects.get(customerid=customer_id)
    impression = LocationImpressions(
        customerid=customer,
        locationid=location
    )
    impression.save()
    
    provider = Provider.objects.filter(providerid=location.providerid.providerid).values(
        'providerid', 'username', 'email', 'name', 'phonenumber', 'description'
    )[0]
    
    # Get events associated with this location
    location_events = Event.objects.filter(locationid=location)
    # Get items available at this location
    location_items = LocationHasItem.objects.filter(locationid=location)


    
    
    return render(request, 'customer/viewProviderPage.html',{
        "location": location,
        "provider": provider,
        "location_items": location_items,
        "location_events": location_events,
        "customer_id": customer_id  
    })

# Create your views here.

def registerCustomer(request):
    if request.method == 'POST':
        username = request.POST['customer-name']
        email = request.POST['email']
        password = request.POST['password']
        firstname = request.POST['first-name']
        lastname = request.POST['last-name']
        phonenumber = request.POST['customer-number']
        gender = request.POST['gender']
        dob = request.POST['DOB']

        if models.Customer.objects.filter(username=username).exists() or models.Customer.objects.filter(email=email).exists():
            return render(request,'customer/register-customer.html',{
                'error':'Username or email already exists. Please try a different one.'
            })
        
        else:
            customer = models.Customer(username=username, email=email, firstname=firstname, lastname=lastname, password=make_password(password),phonenumber=phonenumber,gender=gender,dob=dob)
            customer.save()
            messages.success(request, 'User registered successfully.')
            return redirect('main:login')
    return render(request,'customer/register-customer.html')

def mainPage(request, customer_id):
    if request.session.get('user_type') != 'customer' or request.session.get('user_id') != customer_id:
        request.session.flush()
        return redirect('main:login')  # Redirect unauthorized access to login

    # If authorized, render the customer's page
    customer = Customer.objects.get(customerid=customer_id)
    return render(request , 'customer/customerMainPage.html',{
        "customer":customer
    })


def add_bookmark(request, customerid, locationid):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests allowed'}, status=405)

    try:
        # Parse JSON data from request body
        data = json.loads(request.body)
        customer = Customer.objects.get(customerid=customerid)
        location = Location.objects.get(locationid=locationid)

        # Check if bookmark already exists
        if FavoriteLocations.objects.filter(customerid=customer, locationid=location).exists():
            return JsonResponse({'error': 'Location already bookmarked'}, status=400)
            
        bookmark = FavoriteLocations(customerid=customer, locationid=location)
        bookmark.save()
        return JsonResponse({'message': 'Bookmark added successfully!'})
            
    except Customer.DoesNotExist:
        return JsonResponse({'error': 'Customer not found'}, status=404)
    except Location.DoesNotExist:
        return JsonResponse({'error': 'Location not found'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
   

@require_http_methods(["GET"])
def get_location_reviews(request, location_id):
    try:
        reviews = Review.objects.filter(locationid=location_id).select_related('customerid').order_by('-postdate')
        reviews_data = [{
            'id': review.reviewid,
            'rating': review.rating,
            'text': review.reviewtext,
            'date': review.postdate.strftime('%b %d, %Y') if review.postdate else None,
            'customer_name': f"{review.customerid.firstname} {review.customerid.lastname}"
        } for review in reviews]
        return JsonResponse({'reviews': reviews_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["POST"])
def submit_review(request, location_id):
    try:
        data = json.loads(request.body)
        customer_id = request.session.get('user_id')  # Get logged-in customer's ID
        
        if not customer_id:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        customer = Customer.objects.get(customerid=customer_id)
        location = Location.objects.get(locationid=location_id)

        review = Review(
            customerid=customer,
            locationid=location,
            rating=data['rating'],
            reviewtext=data['review_text'],
            postdate=date.today()
        )
        review.save()

        # Return the new review data
        return JsonResponse({
            'review': {
                'id': review.reviewid,
                'rating': review.rating,
                'text': review.reviewtext,
                'date': review.postdate.strftime('%b %d, %Y'),
                'customer_name': f"{customer.firstname} {customer.lastname}"
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
   
