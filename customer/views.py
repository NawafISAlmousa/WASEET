from django.shortcuts import render, redirect
from main import models
from django.contrib import messages
from django.contrib.auth.hashers import make_password
from main.models import Customer, Provider, Location, LocationHasItem, LocationRatings, ProviderRatings, Event
from django.db.models import OuterRef

def viewProviderPage(request, location_id):
    # Get location and related provider
    location = Location.objects.get(locationid=location_id)
    provider = Provider.objects.filter(providerid=location.providerid.providerid).values('providerid', 'username', 'email', 'name', 'phonenumber', 'description')[0]
    # Get events associated with this location
    location_events = Event.objects.filter(locationid=location)
    # Get items available at this location
    location_items = LocationHasItem.objects.filter(locationid=location)
    
    # Get ratings using raw SQL
    location_ratings = LocationRatings.objects.raw(
        'SELECT * FROM location_ratings_view WHERE locationid = %s', 
        [location_id]
    )
    
    provider_ratings = ProviderRatings.objects.raw(
        'SELECT * FROM provider_ratings_view WHERE providerid = %s', 
        [location.providerid.providerid]
    )

    return render(request, 'customer/viewProviderPage.html',{
        "location": location,
        "provider": provider,
        "location_items": location_items,
        "location_events": location_events,
        "location_ratings": location_ratings,
        "provider_ratings": provider_ratings
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


