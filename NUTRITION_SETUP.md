# Nutrition Logging System

A simple food and water logging system integrated with Nutritionix API.

## 🏗️ Architecture

### **Database Tables**
- `food_items` - Stores Nutritionix food data
- `nutrition_logs` - Client food logging records
- `water_logs` - Water intake tracking

### **Components**
- `NutritionHubPage` - Coach dashboard for viewing client nutrition
- `FoodLogger` - Mobile component for logging meals
- `WaterLogger` - Mobile component for logging water
- `NutritionDashboard` - Mobile dashboard showing daily summary

## 🚀 Setup Instructions

### 1. **Get Nutritionix API Keys**
1. Go to [Nutritionix Developer Portal](https://www.nutritionix.com/business/api)
2. Sign up for a free account
3. Get your App ID and App Key
4. Add to your `.env.local`:
```bash
NEXT_PUBLIC_NUTRITIONIX_APP_ID=your_app_id_here
NEXT_PUBLIC_NUTRITIONIX_APP_KEY=your_app_key_here
```

### 2. **Database Tables**
The nutrition tables are already in your database schema:
- `food_items`
- `nutrition_logs` 
- `water_logs`

### 3. **Components Ready to Use**

#### **Web App (Coach Side)**
```tsx
// Nutrition Hub Dashboard
<NutritionHubPage />
```

#### **Mobile App (Client Side)**
```tsx
// Food Logging
<FoodLogger clientId="user-id" onLogComplete={() => {}} />

// Water Logging  
<WaterLogger clientId="user-id" onLogComplete={() => {}} />

// Nutrition Dashboard
<NutritionDashboard clientId="user-id" onRefresh={() => {}} />
```

## 📱 Mobile App Integration

### **Food Logging Flow**
1. User selects meal type (breakfast, lunch, dinner, snack)
2. User searches for foods using Nutritionix API
3. User adds foods to their meal with quantities
4. System calculates total calories and macros
5. User logs the meal to database

### **Water Logging Flow**
1. User sets water amount (ml)
2. Quick add buttons for common amounts
3. User logs water intake to database

### **Dashboard Features**
- Daily calorie summary
- Macro breakdown (protein, carbs, fat)
- Water intake tracking
- Recent meal history
- Quick action buttons

## 🔧 API Integration

### **Nutritionix API Endpoints Used**
- `GET /v2/search/instant` - Search for foods
- `POST /v2/natural/nutrients` - Parse natural language

### **Example Usage**
```typescript
const nutritionService = new NutritionService();

// Search for foods
const results = await nutritionService.searchFoods("apple");

// Log a meal
const logData = {
  client_id: "user-id",
  coach_id: "coach-id", 
  log_date: "2024-01-15",
  meal_type: "breakfast",
  food_items: [
    {
      food_name: "Apple",
      quantity: 1,
      unit: "medium",
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3
    }
  ]
};

await nutritionService.createNutritionLog(logData);
```

## 📊 Data Structure

### **Nutrition Log**
```typescript
{
  id: string;
  client_id: string;
  coach_id: string;
  log_date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "pre_workout" | "post_workout";
  food_items: LoggedFoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  notes?: string;
  logged_at: string;
}
```

### **Water Log**
```typescript
{
  id: string;
  client_id: string;
  coach_id: string;
  log_date: string;
  amount_ml: number;
  logged_at: string;
}
```

## 🎯 Features

### **✅ Implemented**
- Food search using Nutritionix API
- Meal logging with macro calculations
- Water intake tracking
- Daily nutrition summaries
- Recent meal history
- Coach dashboard for client overview
- Real-time data from database

### **🚧 Future Enhancements**
- Barcode scanning for packaged foods
- Voice input for natural language logging
- Meal planning and templates
- Nutrition goals and tracking
- Progress charts and analytics
- Push notifications for meal reminders

## 🔍 Testing

### **Test Food Search**
1. Open the FoodLogger component
2. Search for "apple" or "chicken"
3. Verify results appear from Nutritionix API

### **Test Meal Logging**
1. Add foods to a meal
2. Adjust quantities
3. Verify totals are calculated correctly
4. Log the meal and check database

### **Test Water Logging**
1. Set water amount
2. Use quick add buttons
3. Log water intake
4. Verify appears in dashboard

## 🛠️ Troubleshooting

### **Common Issues**

1. **Nutritionix API Errors**
   - Check API keys in environment variables
   - Verify API quota hasn't been exceeded
   - Check network connectivity

2. **Database Errors**
   - Ensure tables exist in Supabase
   - Check user authentication
   - Verify client_id and coach_id relationships

3. **Component Not Loading**
   - Check user authentication
   - Verify clientId prop is passed correctly
   - Check console for JavaScript errors

### **Debug Commands**
```bash
# Check if Nutritionix API is working
curl -H "x-app-id: YOUR_APP_ID" -H "x-app-key: YOUR_APP_KEY" \
  "https://trackapi.nutritionix.com/v2/search/instant?query=apple"

# Check database tables
# Run in Supabase SQL editor:
SELECT * FROM nutrition_logs LIMIT 5;
SELECT * FROM water_logs LIMIT 5;
```

## 📈 Performance Tips

1. **API Caching**: Consider caching Nutritionix results
2. **Batch Operations**: Group multiple food items in one log
3. **Lazy Loading**: Load recent logs on demand
4. **Offline Support**: Store logs locally when offline

## 🔐 Security Considerations

1. **API Keys**: Keep Nutritionix keys secure
2. **User Data**: Ensure proper authentication
3. **Data Privacy**: Follow GDPR guidelines for nutrition data
4. **Input Validation**: Sanitize all user inputs

## 📞 Support

For issues with:
- **Nutritionix API**: Contact Nutritionix support
- **Database**: Check Supabase documentation
- **Components**: Review React/Next.js documentation
- **Integration**: Check authentication and environment setup 