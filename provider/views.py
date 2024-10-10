from django.shortcuts import render

# Create your views here.


def registerProvider(request):
    return render(request , 'provider/register-provider.html')