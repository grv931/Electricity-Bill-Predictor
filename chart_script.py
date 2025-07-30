import plotly.graph_objects as go
import pandas as pd

# Load the data
data_json = [
    {"month": "2023-01", "units_consumed": 177, "bill_amount": 1511.15, "season": "Winter"},
    {"month": "2023-02", "units_consumed": 161, "bill_amount": 1367.95, "season": "Winter"},
    {"month": "2023-03", "units_consumed": 148, "bill_amount": 1251.60, "season": "Pleasant"},
    {"month": "2023-04", "units_consumed": 257, "bill_amount": 2227.15, "season": "Summer"},
    {"month": "2023-05", "units_consumed": 202, "bill_amount": 1734.90, "season": "Summer"},
    {"month": "2023-06", "units_consumed": 202, "bill_amount": 1734.90, "season": "Summer"},
    {"month": "2023-07", "units_consumed": 259, "bill_amount": 2245.05, "season": "Summer"},
    {"month": "2023-08", "units_consumed": 234, "bill_amount": 2021.30, "season": "Summer"},
    {"month": "2023-09", "units_consumed": 195, "bill_amount": 1672.25, "season": "Pleasant"},
    {"month": "2023-10", "units_consumed": 145, "bill_amount": 1224.75, "season": "Pleasant"},
    {"month": "2023-11", "units_consumed": 167, "bill_amount": 1426.15, "season": "Winter"},
    {"month": "2023-12", "units_consumed": 134, "bill_amount": 1133.30, "season": "Winter"},
    {"appliance": "Air Conditioner", "monthly_kwh": 336, "percentage": 60},
    {"appliance": "Refrigerator", "monthly_kwh": 108, "percentage": 19},
    {"appliance": "Ceiling Fan", "monthly_kwh": 25.2, "percentage": 4.5},
    {"appliance": "LED TV", "monthly_kwh": 14.4, "percentage": 2.6},
    {"appliance": "Water Heater", "monthly_kwh": 60, "percentage": 10.7},
    {"appliance": "Others", "monthly_kwh": 20, "percentage": 3.2}
]

# Filter appliance data
appliance_data = [item for item in data_json if 'appliance' in item]
df_appliance = pd.DataFrame(appliance_data)

# Sort by monthly_kwh for better visualization
df_appliance = df_appliance.sort_values('monthly_kwh', ascending=True)

# Abbreviate appliance names for 15 char limit
appliance_names = []
for name in df_appliance['appliance']:
    if name == "Air Conditioner":
        appliance_names.append("Air Cond.")
    elif name == "Refrigerator":
        appliance_names.append("Refrigerator")
    elif name == "Ceiling Fan":
        appliance_names.append("Ceiling Fan")
    elif name == "LED TV":
        appliance_names.append("LED TV")
    elif name == "Water Heater":
        appliance_names.append("Water Heater")
    else:
        appliance_names.append(name)

# Define colors
colors = ['#1FB8CD', '#DB4545', '#2E8B57', '#5D878F', '#D2BA4C', '#B4413C']

# Create horizontal bar chart
fig = go.Figure()

fig.add_trace(go.Bar(
    x=df_appliance['monthly_kwh'],
    y=appliance_names,
    orientation='h',
    marker_color=colors[:len(df_appliance)],
    text=[f'{val}%' for val in df_appliance['percentage']],
    textposition='outside',
    hovertemplate='<b>%{y}</b><br>kWh: %{x}<br>Share: %{text}<extra></extra>',
    cliponaxis=False
))

# Update layout
fig.update_layout(
    title='Appliance Power Consumption',
    xaxis_title='Monthly kWh',
    yaxis_title='Appliance',
    showlegend=False
)

# Update axes
fig.update_xaxes(range=[0, max(df_appliance['monthly_kwh']) * 1.15])

# Save the chart
fig.write_image('appliance_power_consumption.png')