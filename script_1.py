# Create appliance-wise power consumption data and energy-saving tips
import json

# Appliance power consumption data (based on research)
appliance_data = {
    "appliances": [
        {"name": "Air Conditioner (1.5 Ton)", "power_watts": 1400, "typical_hours_day": 8, "usage_months": [4,5,6,7,8,9,10]},
        {"name": "Refrigerator", "power_watts": 150, "typical_hours_day": 24, "usage_months": list(range(1,13))},
        {"name": "Ceiling Fan", "power_watts": 70, "typical_hours_day": 12, "usage_months": list(range(1,13))},
        {"name": "LED TV", "power_watts": 80, "typical_hours_day": 6, "usage_months": list(range(1,13))},
        {"name": "Washing Machine", "power_watts": 500, "typical_hours_day": 1, "usage_months": list(range(1,13))},
        {"name": "Water Heater/Geyser", "power_watts": 2000, "typical_hours_day": 1, "usage_months": [11,12,1,2,3]},
        {"name": "Microwave", "power_watts": 1200, "typical_hours_day": 0.5, "usage_months": list(range(1,13))},
        {"name": "Laptop", "power_watts": 65, "typical_hours_day": 8, "usage_months": list(range(1,13))},
        {"name": "LED Lights (5 bulbs)", "power_watts": 50, "typical_hours_day": 6, "usage_months": list(range(1,13))},
        {"name": "Iron", "power_watts": 1000, "typical_hours_day": 0.5, "usage_months": list(range(1,13))},
        {"name": "Water Pump", "power_watts": 750, "typical_hours_day": 2, "usage_months": list(range(1,13))},
        {"name": "Inverter/UPS", "power_watts": 200, "typical_hours_day": 24, "usage_months": list(range(1,13))}
    ]
}

# Energy saving tips (based on research)
energy_tips = {
    "general_tips": [
        "Switch off lights, fans, and AC when leaving the room",
        "Use 5-star BEE rated appliances for better energy efficiency",
        "Replace old incandescent bulbs with LED lights",
        "Unplug electronic devices when not in use to avoid phantom loads",
        "Use power strips for multiple devices and switch them off together"
    ],
    "ac_tips": [
        "Set AC temperature to 24-26°C for optimal cooling and energy saving",
        "Clean AC filters regularly for efficient operation",
        "Close doors and windows when AC is running",
        "Use ceiling fans along with AC to feel cooler at higher temperatures",
        "Install curtains/blinds to block direct sunlight"
    ],
    "refrigerator_tips": [
        "Keep refrigerator temperature between 3-4°C",
        "Don't overload the refrigerator - allow air circulation",
        "Keep the refrigerator away from heat sources",
        "Check and replace door seals if damaged",
        "Defrost regularly to maintain efficiency"
    ],
    "water_heating_tips": [
        "Use geyser timer to heat water only when needed",
        "Insulate hot water pipes to reduce heat loss",
        "Fix leaky hot water taps immediately",
        "Take shorter showers instead of baths",
        "Consider solar water heating systems"
    ],
    "lighting_tips": [
        "Use natural light during daytime",
        "Switch to LED bulbs - they use 75% less energy",
        "Install motion sensors for outdoor and corridor lighting",
        "Use task lighting instead of lighting entire rooms",
        "Clean bulbs and fixtures regularly for better light output"
    ]
}

# Bihar-specific information
bihar_info = {
    "average_consumption": "100-150 kWh per month for typical household",
    "tariff_slabs": [
        {"range": "0-100 units", "rate": "₹7.42 per unit"},
        {"range": "101-200 units", "rate": "₹8.95 per unit"},
        {"range": "Above 200 units", "rate": "₹8.95 per unit"}
    ],
    "fixed_charges": "₹80 per month for DS-II category (2-5 kW)",
    "peak_months": ["April", "May", "June", "July", "August"],
    "average_bill": "₹800-1500 per month for middle-class household"
}

# Anomaly detection patterns
anomaly_patterns = {
    "sudden_spike": {
        "description": "Consumption increased by >50% compared to previous month",
        "possible_causes": ["New high-power appliance", "AC left running", "Water heater malfunction", "Electricity theft in meter"],
        "suggestion": "Check for new appliances or equipment left on continuously"
    },
    "gradual_increase": {
        "description": "Consumption steadily increasing over 3+ months",
        "possible_causes": ["Aging appliances becoming less efficient", "Seasonal change", "Changed usage patterns"],
        "suggestion": "Consider servicing old appliances or replacing with energy-efficient models"
    },
    "sudden_drop": {
        "description": "Consumption decreased by >30% compared to previous month",
        "possible_causes": ["Major appliance stopped working", "Extended vacation", "Changed living situation"],
        "suggestion": "Verify if any major appliances need repair or replacement"
    }
}

# Save all data
with open('appliance_data.json', 'w') as f:
    json.dump(appliance_data, f, indent=2)

with open('energy_tips.json', 'w') as f:
    json.dump(energy_tips, f, indent=2)

with open('bihar_info.json', 'w') as f:
    json.dump(bihar_info, f, indent=2)

with open('anomaly_patterns.json', 'w') as f:
    json.dump(anomaly_patterns, f, indent=2)

print("Created comprehensive data files:")
print("- appliance_data.json")
print("- energy_tips.json") 
print("- bihar_info.json")
print("- anomaly_patterns.json")

# Display some sample data
print("\nSample Appliance Data:")
for appliance in appliance_data["appliances"][:5]:
    monthly_kwh = (appliance["power_watts"] * appliance["typical_hours_day"] * 30) / 1000
    print(f"{appliance['name']}: {appliance['power_watts']}W, ~{monthly_kwh:.1f} kWh/month")

print("\nSample Energy Tips:")
for tip in energy_tips["general_tips"][:3]:
    print(f"- {tip}")