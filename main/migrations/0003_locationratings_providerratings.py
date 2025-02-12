# Generated by Django 5.0.1 on 2024-11-13 19:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_authgroup_authgrouppermissions_authpermission_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='LocationRatings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('providerid', models.IntegerField(db_column='ProviderID')),
                ('locationid', models.IntegerField(db_column='LocationID')),
                ('locationrating', models.FloatField(db_column='LocationRating')),
            ],
            options={
                'db_table': 'LocationRatings',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ProviderRatings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('providerid', models.IntegerField(db_column='ProviderID')),
                ('providerrating', models.FloatField(db_column='ProviderRating')),
            ],
            options={
                'db_table': 'ProviderRatings',
                'managed': False,
            },
        ),
    ]
