from django.shortcuts import render,redirect
from django.contrib.auth import authenticate
from django.http import HttpResponse
from . import models
from django.contrib.auth.hashers import check_password

def index(request):
    return render(request, 'main/index.html')




def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        # a hidden input field in the form that will help us determine either the user is a customer or provider 
        userType = request.POST.get('userType') 
        
        if userType == 'customer':
            try:
                # check if the user exsits
                customer = models.Customer.objects.get(username=username)
            except models.Customer.DoesNotExist:
                return render(request, 'main/login.html',{
                    'error':'Invalid credentials'
                })
                # match the hash password with password the user entered
            if check_password(password,customer.password):
                return redirect("customer:mainPage")
            else:
                return render(request, 'main/login.html',{
                    'error':'Invalid credentials'
                })
            
        # need more work here
        elif userType == 'provider':
            try:
                # check if the user exsits
                provider = models.Provider.objects.get(username=username)
            except models.Provider.DoesNotExist:
                return render(request, 'main/login.html',{
                    'error':'Invalid credentials'
                })
                # match the hash password with password the user entered
            if password == provider.password:
                    return redirect("provider:providerPage")
            else:
                    return render(request, 'main/login.html',{
                    'error':'Invalid credentials'
                })
    else:      
        return render(request, 'main/login.html')








# def dbCheck(request):
#     q = models.Customer.objects.all()
#     response = "<h1>Customer List</h1><ul>"
    
#     # Loop through customers and append them to the response
#     for customer in q:
#         response += f"<li>{customer.firstname} - {customer.email}</li>"
    
#     # If no customers found
#     if not q:
#         response += "<li>No customers found.</li>"
    
#     response += "</ul>"
#     return HttpResponse(response)

