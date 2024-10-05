from django.shortcuts import render, redirect

# Create your views here.

def registerCustomer(request):
    return render(request,'customer/register-customer.html')