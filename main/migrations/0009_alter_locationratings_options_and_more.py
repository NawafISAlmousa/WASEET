# Generated by Django 5.0.1 on 2024-11-22 22:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0008_alter_locationratings_options_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='locationratings',
            options={'managed': True},
        ),
        migrations.AlterModelOptions(
            name='providerratings',
            options={'managed': True},
        ),
    ]