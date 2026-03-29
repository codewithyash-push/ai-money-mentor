# AI Money Mentor

AI Money Mentor is a simple full-stack web app built for quick hackathon demos. It helps Indian users enter a few personal finance numbers and instantly see:

- a financial health score out of 100
- a monthly SIP recommendation
- a tax-saving suggestion
- 2-3 practical action items

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express

## Inputs

- Monthly salary
- Monthly expenses
- Current savings
- Financial goal (optional)

## Output

- Savings rate
- Monthly surplus
- Emergency-fund cushion in months
- Financial health score with a short message
- SIP recommendation based on 20%-30% of salary
- ELSS / 80C tax suggestion
- 3 actionable tips

## Run locally

1. Install dependencies:

```powershell
npm.cmd install
```

2. Start the server:

```powershell
npm.cmd start
```

3. Open the app:

```text
http://localhost:3000
```

## API

### `POST /analyze`

Request body:

```json
{
  "salary": 85000,
  "expenses": 42000,
  "currentSavings": 250000,
  "financialGoal": "Build an emergency fund"
}
```

Example response:

```json
{
  "savingsRate": 0.5058823529,
  "monthlySurplus": 43000,
  "emergencyMonths": 5.9523809524,
  "healthScore": 92,
  "healthLevel": "strong",
  "healthHeadline": "Excellent money discipline",
  "healthMessage": "You are saving 50.6% of your income, which puts you in a strong position to invest consistently and accelerate your goals.",
  "sipRecommendation": 21250,
  "sipRange": {
    "min": 17000,
    "max": 25500
  },
  "taxSuggestion": "Use your surplus strategically: channel part of it into ELSS, PPF, or EPF top-ups to make better use of the Section 80C tax deduction.",
  "actionableTips": [
    "Automate a monthly SIP between ₹17,000 and ₹25,500 to invest before discretionary spending starts.",
    "Your safety buffer exists, but keep growing it toward 6 months of expenses for better resilience.",
    "Create a named bucket for \"Build an emergency fund\" and route part of every monthly surplus into it so the goal stays visible and measurable."
  ]
}
```

## Notes

- The app is intentionally simple and demo-ready.
- No authentication or database is required.
- The form is pre-filled with sample values for faster demos.
