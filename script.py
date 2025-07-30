# Let me create a sample electricity consumption dataset based on typical Indian household patterns
import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import json

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Create sample data for 2 years (24 months) of electricity consumption
# Based on research data: average Indian household consumes 100-200 kWh per month

months = []
consumption_units = []
bills = []

# Bihar electricity tariff rates (from research)
def calculate_bihar_bill(units):
    """Calculate electricity bill based on Bihar tariff rates"""
    if units <= 100:
        energy_charge = units * 7.42
        fixed_charge = 80  # For DS-II category up to 5kW
    elif units <= 200:
        energy_charge = 100 * 7.42 + (units - 100) * 8.95
        fixed_charge = 80
    else:
        energy_charge = 100 * 7.42 + 100 * 8.95 + (units - 200) * 8.95
        fixed_charge = 80
    
    total = energy_charge + fixed_charge
    return round(total, 2)

# Generate 24 months of data (January 2023 to December 2024)
start_date = datetime(2023, 1, 1)
base_consumption = 150  # Base consumption around 150 units

for i in range(24):
    current_date = start_date + timedelta(days=30*i)
    month_name = current_date.strftime("%Y-%m")
    
    # Seasonal variation
    month = current_date.month
    if month in [4, 5, 6, 7, 8]:  # Summer months - higher AC usage
        seasonal_factor = 1.4
    elif month in [11, 12, 1]:  # Winter months - moderate increase
        seasonal_factor = 1.1
    else:  # Monsoon and pleasant months
        seasonal_factor = 0.9
    
    # Add some randomness
    random_factor = np.random.normal(1.0, 0.15)
    
    # Calculate monthly consumption
    monthly_units = int(base_consumption * seasonal_factor * random_factor)
    
    # Ensure reasonable bounds
    monthly_units = max(80, min(350, monthly_units))
    
    # Calculate bill amount
    bill_amount = calculate_bihar_bill(monthly_units)
    
    months.append(month_name)
    consumption_units.append(monthly_units)
    bills.append(bill_amount)

# Create DataFrame
sample_data = pd.DataFrame({
    'month': months,
    'units_consumed': consumption_units,
    'bill_amount': bills
})

print("Sample Electricity Consumption Data:")
print(sample_data.head(10))
print(f"\nData shape: {sample_data.shape}")
print(f"\nSummary statistics:")
print(sample_data.describe())

# Save to CSV for the web app
sample_data.to_csv('sample_electricity_data.csv', index=False)
print("\nData saved to 'sample_electricity_data.csv'")