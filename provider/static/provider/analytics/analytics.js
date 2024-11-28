// At the start of the file, add debug logging
let analyticsData;
try {
    const analyticsDataElement = document.getElementById('analytics-data');
    console.log('Raw analytics data:', analyticsDataElement.value);
    analyticsData = JSON.parse(analyticsDataElement.value);
    console.log('Parsed analytics data:', analyticsData);
} catch (error) {
    console.error('Error parsing analytics data:', error);
    console.log('Raw value:', document.getElementById('analytics-data').value);
}

// Register the Chart.js plugins
Chart.register(ChartDataLabels);

// Set default Chart.js options
Chart.defaults.font.family = 'Jost, sans-serif';
Chart.defaults.color = '#296879';

// Add error handling to chart creation
function createChart(elementId, chartConfig) {
    const canvas = document.getElementById(elementId);
    console.log(`Attempting to create chart for ${elementId}`);
    if (!canvas) {
        console.error(`Canvas element with id '${elementId}' not found`);
        return;
    }
    console.log(`Canvas found for ${elementId}:`, canvas);
    try {
        const chart = new Chart(canvas, chartConfig);
        console.log(`Chart created successfully for ${elementId}`);
        return chart;
    } catch (error) {
        console.error(`Error creating chart for ${elementId}:`, error);
    }
}

// Gender Distribution Charts
function createGenderCharts() {
    // Impressions by Gender
    const totalMaleImpressions = analyticsData.reduce((sum, loc) => sum + loc.totalmaleimpressions, 0);
    const totalFemaleImpressions = analyticsData.reduce((sum, loc) => sum + loc.totalfemaleimpressions, 0);

    createChart('impressions-gender', {
        type: 'doughnut',
        data: {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [totalMaleImpressions, totalFemaleImpressions],
                backgroundColor: ['#296879', '#FF6B6B']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Impressions by Gender'
                },
                datalabels: {
                    color: '#fff',
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((sum, val) => sum + val, 0);
                        return total ? Math.round((value / total) * 100) + '%' : '0%';
                    }
                }
            }
        }
    });

    // Favorites by Gender
    const totalMaleFavorites = analyticsData.reduce((sum, loc) => sum + loc.totalmalefavorites, 0);
    const totalFemaleFavorites = analyticsData.reduce((sum, loc) => sum + loc.totalfemalefavorites, 0);

    createChart('favorites-gender', {
        type: 'doughnut',
        data: {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [totalMaleFavorites, totalFemaleFavorites],
                backgroundColor: ['#296879', '#FF6B6B']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Favorites by Gender'
                },
                datalabels: {
                    color: '#fff',
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((sum, val) => sum + val, 0);
                        return total ? Math.round((value / total) * 100) + '%' : '0%';
                    }
                }
            }
        }
    });
}

// Age Distribution Charts
function createAgeCharts() {
    // Impressions by Age
    const ageData = {
        young: analyticsData.reduce((sum, loc) => sum + loc.youngadultsimpressionscount, 0),
        adult: analyticsData.reduce((sum, loc) => sum + loc.adultsimpressionscount, 0),
        senior: analyticsData.reduce((sum, loc) => sum + loc.seniorimpressionscount, 0)
    };

    createChart('impressions-age', {
        type: 'bar',
        data: {
            labels: ['18-25', '26-45', '45+'],
            datasets: [{
                label: 'Impressions by Age Group',
                data: [ageData.young, ageData.adult, ageData.senior],
                backgroundColor: '#296879'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Age Distribution of Impressions'
                }
            }
        }
    });

    // Favorites by Age
    const ageFavorites = {
        young: analyticsData.reduce((sum, loc) => sum + loc.youngadultsfavoritescount, 0),
        adult: analyticsData.reduce((sum, loc) => sum + loc.adultsfavoritescount, 0),
        senior: analyticsData.reduce((sum, loc) => sum + loc.seniorsfavoritescount, 0)
    };

    createChart('favorites-age', {
        type: 'bar',
        data: {
            labels: ['18-25', '26-45', '45+'],
            datasets: [{
                label: 'Favorites by Age Group',
                data: [ageFavorites.young, ageFavorites.adult, ageFavorites.senior],
                backgroundColor: '#296879'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Age Distribution of Favorites'
                }
            }
        }
    });
}

// Location-based Charts
function createLocationCharts() {
    // Impressions by Location
    createChart('impressions-count-by-location', {
        type: 'bar',
        data: {
            labels: analyticsData.map(loc => loc.name),
            datasets: [{
                label: 'Impressions',
                data: analyticsData.map(loc => loc.impressions),
                backgroundColor: '#296879'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Impressions by Location'
                }
            }
        }
    });

    // Reviews by Location with Rating
    createChart('reviews-count-by-location-with-rating', {
        type: 'bar',
        data: {
            labels: analyticsData.map(loc => loc.name),
            datasets: [
                {
                    label: 'Positive Reviews',
                    data: analyticsData.map(loc => loc.positive_reviews),
                    backgroundColor: '#4CAF50'
                },
                {
                    label: 'Negative Reviews',
                    data: analyticsData.map(loc => loc.negative_reviews),
                    backgroundColor: '#FF6B6B'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Reviews by Location'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    stacked: false,
                    beginAtZero: true
                }
            },
            barPercentage: 0.8,
            categoryPercentage: 0.9
        }
    });
}

// Initialize all charts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Verify analytics data is available
    if (!analyticsData) {
        console.error('Analytics data is not available');
        return;
    }

    console.log('Initializing charts with data:', analyticsData);
    createGenderCharts();
    createAgeCharts();
    createLocationCharts();
});
