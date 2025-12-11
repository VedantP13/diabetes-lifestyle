# Diabetes Lifestyle Phenotype App (V1)

## What this project is

A simple web app that:
1. Asks the user questions about sleep, food, activity, happiness/stress, labs, etc.
2. Calculates 4 scores:
   - SleepScore
   - FoodScore
   - ActivityScore
   - HappinessScore
3. Determines a "phenotype" (root pattern) like:
   - Food-Pattern & Timing Type
   - Digestion & Food-Pattern Type
   - Sleep-Disruption Type
   - Low-Activity & Sitting Type
   - Duty-Driven Stress Type
   - Fear/Stress-Driven Glucose Type
4. Returns:
   - Scores
   - Phenotype
   - Pillar priority (which area to fix first)
   - Universal lifestyle advice
   - Personalized suggestions per pillar (Sleep, Food, Activity, Happiness)
   - Insights ("why this phenotype")
   - Forecast ("what is likely to improve if you follow the plan")

We have 3 main files:

- `questionnaire.json` – all questions and options
- `server.js` – Node.js/Express backend API
- `App.jsx` – React frontend

## How to run backend

```bash
cd diabetes-lifestyle-backend
npm install
node server.js
Backend runs at http://localhost:4000.
API endpoints:
•	GET /api/questionnaire → returns questionnaire JSON
•	POST /api/analyze → send answers as JSON, returns plan
Example POST body: { "sleep_bedtime": "10–11:30 pm", "dinner_time": "8–9:30 pm", ... }
