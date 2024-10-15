from django.shortcuts import render, redirect
from main import models
from django.contrib import messages
from django.contrib.auth.hashers import make_password



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

def mainPage(request):
    return render(request , 'customer/customerMainPage.html')


