from django.contrib import admin
from .models import (
    Admin, Customer, Provider, Location, Item, Event,
    Review, Report, Tags, CustomerMessagesProvider,
    FavoriteItems, FavoriteProviders, FavoriteLocations,
    LocationImpressions, LocationHasItem, ProvidersTags,
    ReviewResponses, LocationRatings, ProviderRatings
)

@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    list_display = ['adminid', 'firstname', 'lastname', 'email']
    search_fields = ['firstname', 'lastname', 'email']

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['customerid', 'firstname', 'lastname', 'email', 'username', 'phonenumber']
    search_fields = ['firstname', 'lastname', 'email', 'username']

@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ['providerid', 'name', 'email', 'username', 'phonenumber']
    search_fields = ['name', 'email', 'username']

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['locationid', 'providerid', 'name', 'phonenumber']
    search_fields = ['name', 'phonenumber']

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['itemid', 'name', 'price', 'providerid']
    search_fields = ['name']

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['eventid', 'name', 'startdate', 'enddate']
    search_fields = ['name']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewid', 'customerid', 'locationid', 'rating', 'postdate','reviewtext']
    list_filter = ['rating', 'postdate']
    search_fields = ['reviewtext']

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['reportid', 'reporteetype', 'reportedtype', 'type', 'status']
    list_filter = ['status', 'type']

@admin.register(Tags)
class TagsAdmin(admin.ModelAdmin):
    list_display = ['tagid', 'name']
    search_fields = ['name']

# Register simpler models with default admin interface
admin.site.register(CustomerMessagesProvider)
admin.site.register(FavoriteItems)
admin.site.register(FavoriteProviders)
admin.site.register(FavoriteLocations)
admin.site.register(LocationImpressions)
admin.site.register(LocationHasItem)
admin.site.register(ProvidersTags)
admin.site.register(ReviewResponses)
admin.site.register(LocationRatings)
admin.site.register(ProviderRatings)
