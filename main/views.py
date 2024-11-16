from django.shortcuts import render,redirect
from django.contrib.auth import authenticate, login
from django.http import HttpResponse
from main import models
from django.contrib.auth.hashers import check_password

def index(request):
    return render(request, 'main/index.html')



from django.shortcuts import render, redirect
from django.contrib.auth.hashers import check_password

def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user_type = request.POST.get('userType')  # 'customer' or 'provider'
        remember = request.POST.get('remember')  # Checkbox input
        
        if user_type == 'customer':
            try:
                # Check if the customer exists
                customer = models.Customer.objects.get(username=username)
                # Check if the password matches
                if check_password(password, customer.password):
                    # Save the customer in the session
                    request.session['user_id'] = customer.customerid
                    request.session['user_type'] = 'customer'
                    
                    # Handle 'Remember Me' functionality
                    if not remember:
                        # Set session to expire when the browser is closed
                        request.session.set_expiry(0)
                    else:
                        # Set session expiry to 7 days
                        request.session.set_expiry(7 * 24 * 60 * 60)
                    
                    return redirect('customer:mainPage', customer_id=customer.customerid)
                else:
                    raise models.Customer.DoesNotExist  # Force invalid credentials error
            except models.Customer.DoesNotExist:
                return render(request, 'main/login.html', {'error': 'Invalid credentials'})

        elif user_type == 'provider':
            try:
                # Check if the provider exists
                provider = models.Provider.objects.get(username=username)
                # Check if the password matches
                if check_password(password, provider.password):
                    # Save the provider in the session
                    request.session['user_id'] = provider.providerid
                    request.session['user_type'] = 'provider'
                    
                    # Handle 'Remember Me' functionality
                    if not remember:
                        # Set session to expire when the browser is closed
                        request.session.set_expiry(0)
                    else:
                        # Set session expiry to 7 days
                        request.session.set_expiry(7 * 24 * 60 * 60)
                    
                    return redirect('provider:providerPage', provider_id=provider.providerid)
                else:
                    raise models.Provider.DoesNotExist  # Force invalid credentials error
            except models.Provider.DoesNotExist:
                return render(request, 'main/login.html', {'error': 'Invalid credentials'})

    return render(request, 'main/login.html')


def logout(request):
    request.session.flush()  # Clear all session data
    return redirect('main:index')


