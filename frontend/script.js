const mentorForm = document.getElementById("mentorForm");
const analyzeButton = document.getElementById("analyzeButton");
const statusMessage = document.getElementById("statusMessage");
const resultsPanel = document.getElementById("resultsPanel");
const scoreBadge = document.getElementById("scoreBadge");
const healthHeadline = document.getElementById("healthHeadline");
const healthMessage = document.getElementById("healthMessage");
const savingsRateValue = document.getElementById("savingsRateValue");
const monthlySurplusValue = document.getElementById("monthlySurplusValue");
const savingsCushionValue = document.getElementById("savingsCushionValue");
const sipValue = document.getElementById("sipValue");
const sipRange = document.getElementById("sipRange");
const taxSuggestion = document.getElementById("taxSuggestion");
const tipsList = document.getElementById("tipsList");

mentorForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(mentorForm);
  const payload = {
    salary: Number(formData.get("salary")),
    expenses: Number(formData.get("expenses")),
    currentSavings: Number(formData.get("currentSavings")),
    financialGoal: String(formData.get("financialGoal") || "").trim(),
  };

  if (!Number.isFinite(payload.salary) || payload.salary <= 0) {
    setStatus("Enter a salary greater than 0.", true);
    return;
  }

  if (!Number.isFinite(payload.expenses) || payload.expenses < 0) {
    setStatus("Monthly expenses cannot be negative.", true);
    return;
  }

  if (!Number.isFinite(payload.currentSavings) || payload.currentSavings < 0) {
    setStatus("Current savings cannot be negative.", true);
    return;
  }

  setLoading(true);
  setStatus("Analyzing your money snapshot...", false);

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Analysis failed.");
    }

    renderResults(result);
    setStatus("Analysis complete. Your demo view is ready.", false);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    setLoading(false);
  }
});

function renderResults(result) {
  resultsPanel.classList.remove("hidden");

  scoreBadge.textContent = result.healthScore;
  scoreBadge.dataset.level = result.healthLevel;
  healthHeadline.textContent = result.healthHeadline;
  healthMessage.textContent = result.healthMessage;
  savingsRateValue.textContent = formatPercent(result.savingsRate);
  monthlySurplusValue.textContent = formatCurrency(result.monthlySurplus);
  savingsCushionValue.textContent = `${result.emergencyMonths.toFixed(1)} months`;
  sipValue.textContent = `${formatCurrency(result.sipRecommendation)} / month`;
  sipRange.textContent = `Suggested range: ${formatCurrency(result.sipRange.min)} to ${formatCurrency(result.sipRange.max)}`;
  taxSuggestion.textContent = result.taxSuggestion;

  tipsList.innerHTML = "";
  result.actionableTips.forEach((tip) => {
    const item = document.createElement("li");
    item.textContent = tip;
    tipsList.appendChild(item);
  });

  resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setLoading(isLoading) {
  analyzeButton.disabled = isLoading;
  analyzeButton.textContent = isLoading ? "Analyzing..." : "Analyze";
}

function setStatus(message, isError) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}
