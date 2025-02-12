# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.utils import timezone


class Admin(models.Model):
    adminid = models.AutoField(db_column='AdminID', primary_key=True)  # Field name made lowercase.
    firstname = models.CharField(db_column='FirstName', max_length=50, blank=True, null=True)  # Field name made lowercase.
    lastname = models.CharField(db_column='LastName', max_length=50, blank=True, null=True)  # Field name made lowercase.
    email = models.CharField(db_column='Email', max_length=100, blank=True, null=True)  # Field name made lowercase.
    password = models.CharField(db_column='Password', max_length=100, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'admin'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class Customer(models.Model):
    customerid = models.AutoField(db_column='CustomerID', primary_key=True)  # Field name made lowercase.
    firstname = models.CharField(db_column='FirstName', max_length=25, blank=True, null=True)  # Field name made lowercase.
    lastname = models.CharField(db_column='LastName', max_length=25, blank=True, null=True)  # Field name made lowercase.
    email = models.CharField(db_column='Email', unique=True, max_length=100, blank=True, null=True)  # Field name made lowercase.
    username = models.CharField(db_column='Username', unique=True, max_length=25, blank=True, null=True)  # Field name made lowercase.
    password = models.CharField(db_column='Password', max_length=100, blank=True, null=True)  # Field name made lowercase.
    phonenumber = models.CharField(db_column='PhoneNumber', max_length=14, blank=True, null=True)  # Field name made lowercase.
    dob = models.DateField(db_column='DOB', blank=True, null=True)  # Field name made lowercase.
    gender = models.CharField(db_column='Gender', max_length=1, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'customer'


class CustomerMessagesProvider(models.Model):
    messageid = models.AutoField(db_column='MessageID', primary_key=True)  # Field name made lowercase.
    providerid = models.ForeignKey('Provider', models.DO_NOTHING, db_column='ProviderID', blank=True, null=True)  # Field name made lowercase.
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID', blank=True, null=True)  # Field name made lowercase.
    messagetext = models.TextField(db_column='MessageText', blank=True, null=True)  # Field name made lowercase.
    timestamp = models.DateTimeField(db_column='Timestamp', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'customer_messages_provider'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Event(models.Model):
    eventid = models.AutoField(db_column='EventID', primary_key=True)  # Field name made lowercase.
    locationid = models.ForeignKey('Location', models.DO_NOTHING, db_column='LocationID', blank=True, null=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=100, blank=True, null=True)  # Field name made lowercase.
    description = models.TextField(blank=True, null=True)
    startdate = models.DateField(db_column='StartDate', blank=True, null=True)  # Field name made lowercase.
    enddate = models.DateField(db_column='EndDate', blank=True, null=True)  # Field name made lowercase.
    starttime = models.TimeField(db_column='StartTime', blank=True, null=True)  # Field name made lowercase.
    endtime = models.TimeField(db_column='EndTime', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'event'


class FavoriteItems(models.Model):
    customerid = models.OneToOneField(Customer, models.DO_NOTHING, db_column='CustomerID', primary_key=True)  # Field name made lowercase. The composite primary key (CustomerID, ItemID) found, that is not supported. The first column is selected.
    itemid = models.ForeignKey('Item', models.DO_NOTHING, db_column='ItemID')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'favorite_items'
        unique_together = (('customerid', 'itemid'),)


class FavoriteProviders(models.Model):
    customerid = models.OneToOneField(Customer, models.DO_NOTHING, db_column='CustomerID', primary_key=True)  # Field name made lowercase. The composite primary key (CustomerID, ProviderID) found, that is not supported. The first column is selected.
    providerid = models.ForeignKey('Provider', models.DO_NOTHING, db_column='ProviderID')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'favorite_providers'
        unique_together = (('customerid', 'providerid'),)



class FavoriteLocations(models.Model):
    favorite_locationsid = models.AutoField(db_column='favorite_locationsID', primary_key=True)  # Match existing column
    customerid = models.ForeignKey(
        'Customer',
        on_delete=models.CASCADE,
        db_column='CustomerID'
    )
    locationid = models.ForeignKey(
        'Location',
        on_delete=models.CASCADE,
        db_column='LocationID'
    )

    class Meta:
        managed = False
        db_table = 'favorite_locations'
        unique_together = (('customerid', 'locationid'),)  # Prevent duplicates


class LocationImpressions(models.Model):
    impressionid = models.AutoField(db_column='ImpressionID', primary_key=True)
    customerid = models.ForeignKey('Customer', on_delete=models.CASCADE, db_column='CustomerID')
    locationid = models.ForeignKey('Location', on_delete=models.CASCADE, db_column='LocationID')
    impressiontimestamp = models.DateTimeField(db_column='ImpressionTimeStamp', default=timezone.now)

    class Meta:
        db_table = 'location_impressions'


class Item(models.Model):
    itemid = models.AutoField(db_column='ItemID', primary_key=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=100, blank=True, null=True)  # Field name made lowercase.
    price = models.DecimalField(db_column='Price', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    description = models.TextField(db_column='Description', blank=True, null=True)  # Field name made lowercase.
    providerid = models.ForeignKey('Provider', models.DO_NOTHING, db_column='ProviderID', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'item'


class Location(models.Model):
    locationid = models.AutoField(db_column='LocationID', primary_key=True)  # Field name made lowercase.
    providerid = models.ForeignKey('Provider', models.DO_NOTHING, db_column='ProviderID', blank=True, null=True)  # Field name made lowercase.
    coordinates = models.CharField(db_column='Coordinates', max_length=100, blank=True, null=True)  # Field name made lowercase.
    phonenumber = models.CharField(db_column='PhoneNumber', max_length=14, blank=True, null=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=150, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'location'


class LocationHasItem(models.Model):
    locationitemid = models.AutoField(primary_key=True)  # New auto-incrementing primary key
    locationid = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        db_column='LocationID'
    )
    itemid = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        db_column='ItemID'
    )

    class Meta:
        managed = False  # If you manage the schema manually
        db_table = 'location_has_item'
        constraints = [
            models.UniqueConstraint(fields=['locationid', 'itemid'], name='unique_location_item')
        ]



class Provider(models.Model):
    providerid = models.AutoField(db_column='ProviderID', primary_key=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=100, blank=True, null=True)  # Field name made lowercase.
    email = models.CharField(db_column='Email', unique=True, max_length=100, blank=True, null=True)  # Field name made lowercase.
    username = models.CharField(db_column='Username', unique=True, max_length=25, blank=True, null=True)  # Field name made lowercase.
    password = models.CharField(db_column='Password', max_length=100, blank=True, null=True)  # Field name made lowercase.
    description = models.TextField(blank=True, null=True)
    phonenumber = models.CharField(db_column='PhoneNumber', max_length=14, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'provider'


class ProvidersTags(models.Model):
    tagid = models.OneToOneField('Tags', models.DO_NOTHING, db_column='TagID', primary_key=True)  # Field name made lowercase. The composite primary key (TagID, ProviderID) found, that is not supported. The first column is selected.
    providerid = models.ForeignKey(Provider, models.DO_NOTHING, db_column='ProviderID')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'providers_tags'
        unique_together = (('tagid', 'providerid'),)


class Report(models.Model):
    reportid = models.AutoField(db_column='ReportID', primary_key=True)  # Field name made lowercase.
    reporteeid = models.IntegerField(db_column='ReporteeID')  # Field name made lowercase.
    reporteetype = models.CharField(db_column='ReporteeType', max_length=8)  # Field name made lowercase.
    reportedid = models.IntegerField(db_column='ReportedID')  # Field name made lowercase.
    reportedtype = models.CharField(db_column='ReportedType', max_length=8)  # Field name made lowercase.
    type = models.CharField(db_column='Type', max_length=50, blank=True, null=True)  # Field name made lowercase.
    description = models.TextField(db_column='Description', blank=True, null=True)  # Field name made lowercase.
    status = models.CharField(db_column='Status', max_length=8, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'report'


class Review(models.Model):
    reviewid = models.AutoField(db_column='ReviewID', primary_key=True)
    reviewtext = models.TextField(db_column='ReviewText', blank=True, null=True)
    locationid = models.ForeignKey(Location, models.DO_NOTHING, db_column='LocationID', blank=True, null=True)
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID', blank=True, null=True)
    rating = models.IntegerField(db_column='Rating', blank=True, null=True)
    postdate = models.DateField(db_column='postDate', blank=True, null=True)  # New field added

    class Meta:
        managed = False
        db_table = 'review'


class ReviewResponses(models.Model):
    reviewid = models.ForeignKey(Review, models.DO_NOTHING, db_column='ReviewID', primary_key=True)
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')
    providerid = models.ForeignKey(Provider, models.DO_NOTHING, db_column='ProviderID')
    responsetext = models.TextField(db_column='ResponseText', blank=True, null=True)
    responsedate = models.DateTimeField(db_column='ResponseDate', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'review_responses'
        unique_together = (('reviewid', 'customerid', 'providerid'),)




class SupportTicket(models.Model):
    ticketID = models.AutoField(primary_key=True)  
    created_at = models.DateTimeField(auto_now_add=True) 
    user_email = models.EmailField()  
    ticket_text = models.TextField()  
    
    class Meta:
        db_table = 'support_ticket'  
        managed = False  


class Tags(models.Model):
    tagid = models.AutoField(db_column='TagID', primary_key=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=50, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'tags'

class LocationRatings(models.Model):
    id = models.AutoField(db_column='LocationRatingID', primary_key=True)  # Field name made lowercase.
    providerid = models.IntegerField(db_column='ProviderID')  # Match your MySQL column
    locationid = models.IntegerField(db_column='LocationID')  # Match your MySQL column
    locationrating = models.FloatField(db_column='LocationRating')  # Match your MySQL column

    class Meta:
        managed = True  # This tells Django not to try and create or manage this table/view
        db_table = 'LocationRatings'  # The name of your MySQL view



class ProviderRatings(models.Model):
    id = models.AutoField(db_column='ProviderRatingID', primary_key=True)  # Field name made lowercase.
    providerid = models.IntegerField(db_column='ProviderID')
    providerrating = models.FloatField(db_column='ProviderRating')

    class Meta:
        managed = True  # Tells Django not to manage or create this table
        db_table = 'ProviderRatings'  # Name of the MySQL view