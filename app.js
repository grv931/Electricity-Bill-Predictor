// Application Data and State
let appData = {
    historicalData: [],
    predictions: {},
    charts: {},
    energyTips: null,
    appliances: null
};

// Sample data from the application
const sampleData = [
    {"month": "2023-01", "units_consumed": 177, "bill_amount": 1511.15},
    {"month": "2023-02", "units_consumed": 161, "bill_amount": 1367.95},
    {"month": "2023-03", "units_consumed": 148, "bill_amount": 1251.60},
    {"month": "2023-04", "units_consumed": 257, "bill_amount": 2227.15},
    {"month": "2023-05", "units_consumed": 202, "bill_amount": 1734.90},
    {"month": "2023-06", "units_consumed": 202, "bill_amount": 1734.90},
    {"month": "2023-07", "units_consumed": 259, "bill_amount": 2245.05},
    {"month": "2023-08", "units_consumed": 234, "bill_amount": 2021.30},
    {"month": "2023-09", "units_consumed": 195, "bill_amount": 1672.25},
    {"month": "2023-10", "units_consumed": 145, "bill_amount": 1224.75},
    {"month": "2023-11", "units_consumed": 167, "bill_amount": 1426.15},
    {"month": "2023-12", "units_consumed": 134, "bill_amount": 1133.30}
];

const appliances = [
    {"name": "Air Conditioner (1.5 Ton)", "power_watts": 1400, "typical_hours_day": 8, "monthly_kwh": 336},
    {"name": "Refrigerator", "power_watts": 150, "typical_hours_day": 24, "monthly_kwh": 108},
    {"name": "Ceiling Fan", "power_watts": 70, "typical_hours_day": 12, "monthly_kwh": 25.2},
    {"name": "LED TV", "power_watts": 80, "typical_hours_day": 6, "monthly_kwh": 14.4},
    {"name": "Washing Machine", "power_watts": 500, "typical_hours_day": 1, "monthly_kwh": 15},
    {"name": "Water Heater/Geyser", "power_watts": 2000, "typical_hours_day": 1, "monthly_kwh": 60},
    {"name": "LED Lights (5 bulbs)", "power_watts": 50, "typical_hours_day": 6, "monthly_kwh": 9},
    {"name": "Laptop", "power_watts": 65, "typical_hours_day": 8, "monthly_kwh": 15.6}
];

const energyTips = {
    "general": [
        "Switch off lights, fans, and AC when leaving the room",
        "Use 5-star BEE rated appliances for better energy efficiency", 
        "Replace old incandescent bulbs with LED lights",
        "Unplug electronic devices when not in use",
        "Use power strips and switch them off together"
    ],
    "ac_tips": [
        "Set AC temperature to 24-26°C for optimal cooling",
        "Clean AC filters regularly for efficient operation",
        "Close doors and windows when AC is running",
        "Use ceiling fans along with AC",
        "Install curtains to block direct sunlight"
    ],
    "refrigerator": [
        "Keep temperature between 3-4°C",
        "Don't overload - allow air circulation",
        "Keep away from heat sources",
        "Check door seals regularly",
        "Defrost regularly"
    ]
};

const biharTariff = {
    "slabs": [
        {"range": "0-100", "rate": 7.42},
        {"range": "101-200", "rate": 8.95},
        {"range": "200+", "rate": 8.95}
    ],
    "fixed_charge": 80
};

// Utility Functions
function calculateBillAmount(units) {
    let amount = biharTariff.fixed_charge;
    
    if (units <= 100) {
        amount += units * 7.42;
    } else if (units <= 200) {
        amount += 100 * 7.42 + (units - 100) * 8.95;
    } else {
        amount += 100 * 7.42 + 100 * 8.95 + (units - 200) * 8.95;
    }
    
    return Math.round(amount * 100) / 100;
}

function getMonthName(monthStr) {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Machine Learning Functions
class LinearRegression {
    constructor() {
        this.slope = 0;
        this.intercept = 0;
        this.r2Score = 0;
    }
    
    fit(X, y) {
        const n = X.length;
        const sumX = X.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = X.reduce((sum, x, i) => sum + x * y[i], 0);
        const sumXX = X.reduce((sum, x) => sum + x * x, 0);
        
        this.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        this.intercept = (sumY - this.slope * sumX) / n;
        
        // Calculate R² score
        const yMean = sumY / n;
        const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - this.predict([X[i]])[0], 2), 0);
        const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
        this.r2Score = 1 - (ssRes / ssTot);
    }
    
    predict(X) {
        return X.map(x => this.slope * x + this.intercept);
    }
}

class RandomForestRegressor {
    constructor(nTrees = 10) {
        this.nTrees = nTrees;
        this.trees = [];
        this.r2Score = 0;
    }
    
    fit(X, y) {
        this.trees = [];
        
        for (let i = 0; i < this.nTrees; i++) {
            // Bootstrap sampling
            const indices = Array.from({length: X.length}, () => Math.floor(Math.random() * X.length));
            const bootX = indices.map(idx => X[idx]);
            const bootY = indices.map(idx => y[idx]);
            
            // Create simple decision tree (actually just linear regression for simplicity)
            const tree = new LinearRegression();
            tree.fit(bootX, bootY);
            this.trees.push(tree);
        }
        
        // Calculate R² score using ensemble predictions
        const predictions = this.predict(X);
        const yMean = y.reduce((a, b) => a + b, 0) / y.length;
        const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
        const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
        this.r2Score = Math.max(0, 1 - (ssRes / ssTot));
    }
    
    predict(X) {
        const predictions = this.trees.map(tree => tree.predict(X));
        return X.map((_, i) => {
            const treePreds = predictions.map(pred => pred[i]);
            return treePreds.reduce((a, b) => a + b, 0) / treePreds.length;
        });
    }
}

// Navigation Functions
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const page = this.getAttribute('data-page');
            console.log('Navigating to:', page);
            showPage(page);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showPage(pageId) {
    console.log('Showing page:', pageId);
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load page-specific content
        if (pageId === 'analysis') {
            updateAnalysisPage();
        } else if (pageId === 'tips') {
            updateTipsPage();
        }
    }
}

// Data Input Functions
function initializeDataInput() {
    // Toggle between manual and CSV input
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const mode = this.getAttribute('data-mode');
            console.log('Switching to mode:', mode);
            
            toggleBtns.forEach(b => {
                b.classList.remove('active');
                b.classList.add('btn--outline');
                b.classList.remove('btn--secondary');
            });
            this.classList.add('active');
            this.classList.add('btn--secondary');
            this.classList.remove('btn--outline');
            
            const manualInput = document.getElementById('manual-input');
            const csvInput = document.getElementById('csv-input');
            
            if (mode === 'manual') {
                manualInput.classList.remove('hidden');
                csvInput.classList.add('hidden');
            } else {
                manualInput.classList.add('hidden');
                csvInput.classList.remove('hidden');
            }
        });
    });
    
    // Manual data entry
    document.getElementById('add-data-btn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        addManualData();
    });
    
    document.getElementById('load-sample-btn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        loadSampleData();
    });
    
    // CSV upload
    document.getElementById('csv-file').addEventListener('change', handleCSVUpload);
    
    // Prediction button
    document.getElementById('predict-btn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        makePrediction();
    });
    
    updatePredictButton();
}

function addManualData() {
    const month = document.getElementById('month-input').value;
    const units = parseFloat(document.getElementById('units-input').value);
    const amount = parseFloat(document.getElementById('amount-input').value);
    
    if (!month || !units || !amount) {
        alert('Please fill all fields');
        return;
    }
    
    if (units < 0 || units > 1000) {
        alert('Please enter a valid unit consumption (0-1000 kWh)');
        return;
    }
    
    if (amount < 0 || amount > 10000) {
        alert('Please enter a valid bill amount (₹0-₹10,000)');
        return;
    }
    
    // Check if month already exists
    if (appData.historicalData.find(d => d.month === month)) {
        alert('Data for this month already exists');
        return;
    }
    
    appData.historicalData.push({
        month: month,
        units_consumed: units,
        bill_amount: amount
    });
    
    // Clear inputs
    document.getElementById('month-input').value = '';
    document.getElementById('units-input').value = '';
    document.getElementById('amount-input').value = '';
    
    updateDataTable();
    updatePredictButton();
}

function loadSampleData() {
    appData.historicalData = [...sampleData];
    updateDataTable();
    updatePredictButton();
    alert('Sample data loaded successfully!');
}

function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            try {
                appData.historicalData = results.data
                    .filter(row => row.month && row.units_consumed && row.bill_amount)
                    .map(row => ({
                        month: row.month,
                        units_consumed: parseFloat(row.units_consumed),
                        bill_amount: parseFloat(row.bill_amount)
                    }));
                
                updateDataTable();
                updatePredictButton();
                alert(`Loaded ${appData.historicalData.length} records from CSV`);
            } catch (error) {
                alert('Error parsing CSV file. Please check the format.');
            }
        }
    });
}

function updateDataTable() {
    const tbody = document.getElementById('data-body');
    tbody.innerHTML = '';
    
    const sortedData = appData.historicalData
        .sort((a, b) => new Date(a.month) - new Date(b.month));
    
    sortedData.forEach((data, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${getMonthName(data.month)}</td>
            <td>${data.units_consumed}</td>
            <td>₹${data.bill_amount}</td>
            <td><button class="delete-btn" onclick="deleteData(${index})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

function deleteData(index) {
    const sortedData = appData.historicalData
        .sort((a, b) => new Date(a.month) - new Date(b.month));
    const itemToDelete = sortedData[index];
    
    // Find the original index in unsorted array
    const originalIndex = appData.historicalData.findIndex(d => 
        d.month === itemToDelete.month && 
        d.units_consumed === itemToDelete.units_consumed
    );
    
    if (originalIndex !== -1) {
        appData.historicalData.splice(originalIndex, 1);
        updateDataTable();
        updatePredictButton();
    }
}

function updatePredictButton() {
    const btn = document.getElementById('predict-btn');
    btn.disabled = appData.historicalData.length < 3;
    
    if (appData.historicalData.length < 3) {
        btn.textContent = `🔮 Need at least 3 months of data (${appData.historicalData.length}/3)`;
    } else {
        btn.textContent = '🔮 Predict Next Month\'s Bill';
    }
}

// Prediction Functions
function makePrediction() {
    if (appData.historicalData.length < 3) {
        alert('Please add at least 3 months of historical data');
        return;
    }
    
    const modelType = document.querySelector('input[name="model"]:checked').value;
    
    // Prepare data
    const sortedData = appData.historicalData.sort((a, b) => new Date(a.month) - new Date(b.month));
    const X = sortedData.map((_, i) => i); // Use index as feature (time series)
    const yUnits = sortedData.map(d => d.units_consumed);
    const yAmount = sortedData.map(d => d.bill_amount);
    
    // Train models
    let unitsModel, amountModel;
    
    if (modelType === 'linear') {
        unitsModel = new LinearRegression();
        amountModel = new LinearRegression();
    } else {
        unitsModel = new RandomForestRegressor(5);
        amountModel = new RandomForestRegressor(5);
    }
    
    unitsModel.fit(X, yUnits);
    amountModel.fit(X, yAmount);
    
    // Make prediction for next month
    const nextIndex = X.length;
    const predictedUnits = Math.max(0, Math.round(unitsModel.predict([nextIndex])[0]));
    const predictedAmount = Math.max(0, Math.round(amountModel.predict([nextIndex])[0] * 100) / 100);
    
    // Calculate confidence interval (simple approach)
    const unitsStd = Math.sqrt(yUnits.reduce((sum, u) => sum + Math.pow(u - yUnits.reduce((a,b) => a+b,0)/yUnits.length, 2), 0) / yUnits.length);
    const amountStd = Math.sqrt(yAmount.reduce((sum, a) => sum + Math.pow(a - yAmount.reduce((a,b) => a+b,0)/yAmount.length, 2), 0) / yAmount.length);
    
    const minAmount = Math.max(0, Math.round((predictedAmount - amountStd) * 100) / 100);
    const maxAmount = Math.round((predictedAmount + amountStd) * 100) / 100;
    
    // Store prediction results
    appData.predictions = {
        units: predictedUnits,
        amount: predictedAmount,
        minAmount: minAmount,
        maxAmount: maxAmount,
        accuracy: Math.round(Math.max(unitsModel.r2Score, amountModel.r2Score) * 100),
        model: modelType
    };
    
    displayPredictionResults();
    generateInsights();
}

function displayPredictionResults() {
    document.getElementById('no-results').style.display = 'none';
    document.getElementById('prediction-results').classList.remove('hidden');
    
    const pred = appData.predictions;
    document.getElementById('predicted-amount').textContent = pred.amount.toLocaleString();
    document.getElementById('predicted-units').textContent = pred.units;
    document.getElementById('min-amount').textContent = pred.minAmount.toLocaleString();
    document.getElementById('max-amount').textContent = pred.maxAmount.toLocaleString();
    document.getElementById('accuracy').textContent = pred.accuracy + '%';
    
    // Determine trend
    const recent = appData.historicalData.slice(-3);
    const avgRecent = recent.reduce((sum, d) => sum + d.bill_amount, 0) / recent.length;
    const trendElement = document.getElementById('trend');
    
    if (pred.amount > avgRecent * 1.1) {
        trendElement.textContent = 'Increasing';
        trendElement.className = 'status increasing';
    } else if (pred.amount < avgRecent * 0.9) {
        trendElement.textContent = 'Decreasing';
        trendElement.className = 'status decreasing';
    } else {
        trendElement.textContent = 'Stable';
        trendElement.className = 'status stable';
    }
    
    createPredictionChart();
}

function createPredictionChart() {
    const ctx = document.getElementById('prediction-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (appData.charts.prediction) {
        appData.charts.prediction.destroy();
    }
    
    const sortedData = appData.historicalData.sort((a, b) => new Date(a.month) - new Date(b.month));
    const labels = sortedData.map(d => getMonthName(d.month));
    const actualData = sortedData.map(d => d.bill_amount);
    
    // Add prediction
    const nextMonth = new Date(sortedData[sortedData.length - 1].month);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    labels.push(nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    
    appData.charts.prediction = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Actual Bills',
                data: actualData,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Predicted Bill',
                data: [...Array(actualData.length).fill(null), appData.predictions.amount],
                borderColor: '#FFC185',
                backgroundColor: '#FFC185',
                pointStyle: 'star',
                pointRadius: 8,
                showLine: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Electricity Bill Trend & Prediction'
                },
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount (₹)'
                    }
                }
            }
        }
    });
}

function generateInsights() {
    const insights = [];
    const pred = appData.predictions;
    const recent = appData.historicalData.slice(-3);
    const avgRecent = recent.reduce((sum, d) => sum + d.bill_amount, 0) / recent.length;
    const avgUnits = recent.reduce((sum, d) => sum + d.units_consumed, 0) / recent.length;
    
    // Trend insights
    if (pred.amount > avgRecent * 1.15) {
        insights.push({
            icon: '⚠️',
            text: `Your next bill is predicted to be ${Math.round(((pred.amount / avgRecent) - 1) * 100)}% higher than recent average. Consider energy-saving measures.`
        });
    } else if (pred.amount < avgRecent * 0.85) {
        insights.push({
            icon: '✅',
            text: `Great news! Your bill is expected to decrease by ${Math.round((1 - (pred.amount / avgRecent)) * 100)}% compared to recent average.`
        });
    }
    
    // Seasonal insights
    const currentMonth = new Date().getMonth();
    const peakMonths = [3, 4, 5, 6, 7]; // Apr-Aug (0-indexed)
    if (peakMonths.includes(currentMonth)) {
        insights.push({
            icon: '🌡️',
            text: 'This is peak season (summer). AC usage typically increases bills by 40-60%.'
        });
    }
    
    // Comparison with Bihar average
    if (avgUnits > 200) {
        insights.push({
            icon: '📊',
            text: 'Your consumption is above Bihar state average (150 kWh/month). Consider energy efficiency measures.'
        });
    } else if (avgUnits < 100) {
        insights.push({
            icon: '🏆',
            text: 'Excellent! Your consumption is below Bihar state average. Keep up the good work!'
        });
    }
    
    // Model accuracy insight
    if (pred.accuracy < 70) {
        insights.push({
            icon: '⚡',
            text: 'Prediction confidence is moderate. Adding more historical data will improve accuracy.'
        });
    }
    
    displayInsights(insights);
}

function displayInsights(insights) {
    const container = document.getElementById('insights-list');
    container.innerHTML = '';
    
    insights.forEach(insight => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        item.innerHTML = `
            <span class="insight-icon">${insight.icon}</span>
            <span>${insight.text}</span>
        `;
        container.appendChild(item);
    });
}

// Analysis Page Functions
function updateAnalysisPage() {
    if (appData.historicalData.length === 0) return;
    
    createTrendChart();
    createSeasonalChart();
    updateApplianceBreakdown();
    detectAnomalies();
}

function createTrendChart() {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    
    if (appData.charts.trend) {
        appData.charts.trend.destroy();
    }
    
    const sortedData = appData.historicalData.sort((a, b) => new Date(a.month) - new Date(b.month));
    
    appData.charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedData.map(d => getMonthName(d.month)),
            datasets: [{
                label: 'Units Consumed (kWh)',
                data: sortedData.map(d => d.units_consumed),
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                yAxisID: 'y'
            }, {
                label: 'Bill Amount (₹)',
                data: sortedData.map(d => d.bill_amount),
                borderColor: '#FFC185',
                backgroundColor: 'rgba(255, 193, 133, 0.1)',
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Units (kWh)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Amount (₹)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function createSeasonalChart() {
    const ctx = document.getElementById('seasonal-chart').getContext('2d');
    
    if (appData.charts.seasonal) {
        appData.charts.seasonal.destroy();
    }
    
    // Group data by month
    const monthlyAvg = {};
    appData.historicalData.forEach(d => {
        const month = new Date(d.month).getMonth();
        if (!monthlyAvg[month]) {
            monthlyAvg[month] = { total: 0, count: 0 };
        }
        monthlyAvg[month].total += d.units_consumed;
        monthlyAvg[month].count += 1;
    });
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const seasonalData = monthNames.map((name, i) => {
        return monthlyAvg[i] ? Math.round(monthlyAvg[i].total / monthlyAvg[i].count) : 0;
    });
    
    appData.charts.seasonal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'Average Units',
                data: seasonalData,
                backgroundColor: [
                    '#B4413C', '#B4413C', '#ECEBD5', '#FFC185', '#FFC185', 
                    '#FFC185', '#FFC185', '#FFC185', '#ECEBD5', '#ECEBD5', '#5D878F', '#5D878F'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Units (kWh)'
                    }
                }
            }
        }
    });
}

function updateApplianceBreakdown() {
    const container = document.getElementById('appliance-list');
    container.innerHTML = '';
    
    appliances.forEach(appliance => {
        const monthlyCost = appliance.monthly_kwh * 8.5; // Average rate
        const item = document.createElement('div');
        item.className = 'appliance-item';
        item.innerHTML = `
            <div class="appliance-info">
                <div class="appliance-name">${appliance.name}</div>
                <div class="appliance-consumption">${appliance.monthly_kwh} kWh/month</div>
            </div>
            <div class="appliance-cost">₹${Math.round(monthlyCost)}</div>
        `;
        container.appendChild(item);
    });
}

function detectAnomalies() {
    const container = document.getElementById('anomaly-alerts');
    container.innerHTML = '';
    
    if (appData.historicalData.length < 3) return;
    
    const sortedData = appData.historicalData.sort((a, b) => new Date(a.month) - new Date(b.month));
    const anomalies = [];
    
    for (let i = 1; i < sortedData.length; i++) {
        const current = sortedData[i].units_consumed;
        const previous = sortedData[i-1].units_consumed;
        const change = ((current - previous) / previous) * 100;
        
        if (Math.abs(change) > 50) {
            anomalies.push({
                month: getMonthName(sortedData[i].month),
                type: change > 0 ? 'Sudden Spike' : 'Sudden Drop',
                change: Math.round(Math.abs(change)),
                description: change > 0 ? 
                    'Consumption increased significantly. Check for new appliances or equipment issues.' :
                    'Consumption dropped significantly. Verify meter readings or check for appliance failures.'
            });
        }
    }
    
    if (anomalies.length === 0) {
        container.innerHTML = '<div class="anomaly-alert"><div class="anomaly-title">✅ No Anomalies Detected</div><div class="anomaly-description">Your consumption patterns look normal.</div></div>';
    } else {
        anomalies.forEach(anomaly => {
            const alert = document.createElement('div');
            alert.className = 'anomaly-alert';
            alert.innerHTML = `
                <div class="anomaly-title">⚠️ ${anomaly.type} in ${anomaly.month}</div>
                <div class="anomaly-description">${anomaly.change}% change. ${anomaly.description}</div>
            `;
            container.appendChild(alert);
        });
    }
}

// Tips Page Functions
function updateTipsPage() {
    displayTips('general-tips', energyTips.general);
    displayTips('ac-tips', energyTips.ac_tips);
    displayTips('fridge-tips', energyTips.refrigerator);
    
    initializeSavingsCalculator();
}

function displayTips(containerId, tips) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    tips.forEach(tip => {
        const item = document.createElement('div');
        item.className = 'tip-item';
        item.innerHTML = `
            <span class="tip-icon">💡</span>
            <span>${tip}</span>
        `;
        container.appendChild(item);
    });
}

function initializeSavingsCalculator() {
    const currentBillInput = document.getElementById('current-bill');
    const savingsPercentInput = document.getElementById('savings-percent');
    const savingsDisplay = document.getElementById('savings-display');
    const monthlySavingsSpan = document.getElementById('monthly-savings');
    const yearlySavingsSpan = document.getElementById('yearly-savings');
    
    function updateSavings() {
        const currentBill = parseFloat(currentBillInput.value) || 0;
        const savingsPercent = parseFloat(savingsPercentInput.value);
        
        savingsDisplay.textContent = savingsPercent + '%';
        
        const monthlySavings = Math.round(currentBill * savingsPercent / 100);
        const yearlySavings = monthlySavings * 12;
        
        monthlySavingsSpan.textContent = monthlySavings;
        yearlySavingsSpan.textContent = yearlySavings;
    }
    
    currentBillInput.addEventListener('input', updateSavings);
    savingsPercentInput.addEventListener('input', updateSavings);
    
    // Initialize with default values
    updateSavings();
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initializing...');
    
    initializeNavigation();
    initializeDataInput();
    updateTipsPage();
    
    // Show home page by default
    showPage('home');
    
    console.log('Application initialized successfully');
});