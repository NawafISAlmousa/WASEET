from django.shortcuts import render,redirect
from django.contrib.auth import authenticate
from django.http import HttpResponse
from main import models
from django.contrib.auth.hashers import check_password

def index(request):
    return render(request, 'main/index.html')



def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user_type = request.POST.get('userType')  # 'customer' or 'provider'

        if user_type == 'customer':
            try:
                # Check if the customer exists
                customer = models.Customer.objects.get(username=username)
                # Check if the password matches
                if check_password(password, customer.password):
                    # Save the customer in the session
                    request.session['user_id'] = customer.customerid
                    request.session['user_type'] = 'customer'
                    return redirect('customer:mainPage', customer_id=customer.customerid)
                else:
                    raise models.Customer.DoesNotExist  # Force invalid credentials error
            except models.Customer.DoesNotExist:
                return render(request, 'main/login.html', {'error': 'Invalid credentials'})

        elif user_type == 'provider':
            try:
                # Check if the provider exists
                provider = models.Provider.objects.get(username=username)
                if password == provider.password:  # Assuming plain text passwords (not recommended)
                    # Save the provider in the session
                    request.session['user_id'] = provider.providerid
                    request.session['user_type'] = 'provider'
                    return redirect('provider:providerPage', provider_id=provider.providerid)
                else:
                    raise models.Provider.DoesNotExist  # Force invalid credentials error
            except models.Provider.DoesNotExist:
                return render(request, 'main/login.html', {'error': 'Invalid credentials'})

    return render(request, 'main/login.html')


def logout(request):
    request.session.flush()  # Clear all session data
    return redirect('main:index')


