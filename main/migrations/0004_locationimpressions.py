# Generated by Django 5.0.1 on 2024-11-13 19:12

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_locationratings_providerratings'),
    ]

    operations = [
        migrations.CreateModel(
            name='LocationImpressions',
            fields=[
                ('impressionid', models.AutoField(db_column='ImpressionID', primary_key=True, serialize=False)),
                ('impressiontimestamp', models.DateTimeField(db_column='ImpressionTimeStamp', default=django.utils.timezone.now)),
                ('customerid', models.ForeignKey(db_column='CustomerID', on_delete=django.db.models.deletion.CASCADE, to='main.customer')),
                ('locationid', models.ForeignKey(db_column='LocationID', on_delete=django.db.models.deletion.CASCADE, to='main.location')),
            ],
            options={
                'db_table': 'location_impressions',
            },
        ),
    ]
