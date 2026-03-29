const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, "frontend");

app.use(express.json());
app.use(express.static(FRONTEND_DIR));

app.post("/analyze", (req, res) => {
  const { salary, expenses, currentSavings, financialGoal = "" } = req.body || {};

  if (!isFiniteNumber(salary) || salary <= 0) {
    return res.status(400).json({ error: "Monthly salary must be greater than 0." });
  }

  if (!isFiniteNumber(expenses) || expenses < 0) {
    return res.status(400).json({ error: "Monthly expenses cannot be negative." });
  }

  if (!isFiniteNumber(currentSavings) || currentSavings < 0) {
    return res.status(400).json({ error: "Current savings cannot be negative." });
  }

  const monthlySurplus = salary - expenses;
  const savingsRate = monthlySurplus / salary;
  const normalizedGoal = String(financialGoal).trim();
  const healthScore = calculateHealthScore(savingsRate);
  const healthLevel = getHealthLevel(healthScore);
  const emergencyMonths = expenses === 0 ? 12 : currentSavings / expenses;
  const sipRange = {
    min: roundToRupee(salary * 0.2),
    max: roundToRupee(salary * 0.3),
  };

  const result = {
    savingsRate,
    monthlySurplus,
    emergencyMonths,
    healthScore,
    healthLevel,
    healthHeadline: getHealthHeadline(healthScore, monthlySurplus),
    healthMessage: getHealthMessage(healthScore, savingsRate, monthlySurplus),
    sipRecommendation: roundToRupee(salary * 0.25),
    sipRange,
    taxSuggestion: getTaxSuggestion(savingsRate, monthlySurplus),
    actionableTips: buildTips({
      salary,
      expenses,
      currentSavings,
      monthlySurplus,
      savingsRate,
      emergencyMonths,
      financialGoal: normalizedGoal,
      sipRange,
    }),
  };

  return res.json(result);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`AI Money Mentor running at http://localhost:${PORT}`);
});

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function calculateHealthScore(savingsRate) {
  if (savingsRate >= 0.4) {
    return clamp(Math.round(90 + Math.min((savingsRate - 0.4) * 20, 10)), 90, 100);
  }

  if (savingsRate >= 0.2) {
    return clamp(Math.round(70 + ((savingsRate - 0.2) / 0.2) * 20), 70, 90);
  }

  if (savingsRate >= 0) {
    return clamp(Math.round(40 + (savingsRate / 0.2) * 29), 40, 69);
  }

  return clamp(Math.round(35 + savingsRate * 40), 10, 39);
}

function getHealthLevel(score) {
  if (score >= 90) {
    return "strong";
  }

  if (score >= 70) {
    return "stable";
  }

  return "needs-attention";
}

function getHealthHeadline(score, monthlySurplus) {
  if (monthlySurplus < 0) {
    return "You are spending above your income";
  }

  if (score >= 90) {
    return "Excellent money discipline";
  }

  if (score >= 70) {
    return "You are on a stable track";
  }

  return "Your cash flow needs a reset";
}

function getHealthMessage(score, savingsRate, monthlySurplus) {
  if (monthlySurplus < 0) {
    return "Your expenses are higher than your salary, so the first priority is to cut fixed costs and stop the monthly leak.";
  }

  if (score >= 90) {
    return `You are saving ${formatPercent(savingsRate)} of your income, which puts you in a strong position to invest consistently and accelerate your goals.`;
  }

  if (score >= 70) {
    return `You are saving ${formatPercent(savingsRate)} of your income. A few focused changes can improve your emergency cushion and long-term investing pace.`;
  }

  return `You are saving ${formatPercent(savingsRate)} of your income, which is below a comfortable range. Tightening spending and automating savings should be the next move.`;
}

function getTaxSuggestion(savingsRate, monthlySurplus) {
  if (monthlySurplus <= 0 || savingsRate < 0.2) {
    return "Start small with tax-saving discipline: consider ELSS or other Section 80C options once your monthly cash flow turns positive.";
  }

  return "Use your surplus strategically: channel part of it into ELSS, PPF, or EPF top-ups to make better use of the Section 80C tax deduction.";
}

function buildTips(data) {
  const tips = [];

  if (data.monthlySurplus <= 0) {
    tips.push("Bring expenses below salary immediately by reviewing rent, EMI, subscriptions, and food delivery spend this month.");
  } else if (data.savingsRate < 0.2) {
    tips.push("Move at least 10% of salary to a separate savings or investment account on salary day so spending adjusts around it.");
  } else {
    tips.push(`Automate a monthly SIP between ${formatCurrency(data.sipRange.min)} and ${formatCurrency(data.sipRange.max)} to invest before discretionary spending starts.`);
  }

  if (data.emergencyMonths < 3) {
    tips.push("Build an emergency fund covering at least 3-6 months of expenses before taking on aggressive investing risk.");
  } else if (data.emergencyMonths < 6) {
    tips.push("Your safety buffer exists, but keep growing it toward 6 months of expenses for better resilience.");
  } else {
    tips.push("Your emergency cushion looks healthy, so you can focus more of the surplus on long-term wealth creation.");
  }

  if (data.financialGoal) {
    tips.push(`Create a named bucket for "${data.financialGoal}" and route part of every monthly surplus into it so the goal stays visible and measurable.`);
  } else {
    tips.push("Pick one near-term money goal, such as an emergency fund or travel corpus, so your savings plan has a clear target.");
  }

  return tips.slice(0, 3);
}

function roundToRupee(value) {
  return Math.round(value);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
