const TOTAL_STEPS = 10;
const form = document.getElementById("calculator");
const steps = Array.from(document.querySelectorAll(".step"));
const stepCount = document.getElementById("step-count");
const progressFill = document.getElementById("progress-fill");
const backButton = document.querySelector("[data-action='back']");
const nextButton = document.querySelector("[data-action='next']");
const chartBars = document.getElementById("chart-bars");
const comparison = document.getElementById("comparison");
const projectGrid = document.getElementById("project-grid");
const portfolioEmissions = document.getElementById("portfolio-emissions");
const portfolioCost = document.getElementById("portfolio-cost");
const portfolioPercent = document.getElementById("portfolio-percent");
const summaryEmissions = document.getElementById("summary-emissions");
const summaryCost = document.getElementById("summary-cost");
const summaryBreakdown = document.getElementById("summary-breakdown");
const totalEmissions = document.getElementById("total-emissions");
const formStatus = document.getElementById("form-status");
const offsetLevel = document.getElementById("offset-level");

let currentStep = Number(sessionStorage.getItem("currentStep")) || 1;
let latestResults = null;

const employeeMap = {
  "1-10 employees": 5,
  "11-50 employees": 30,
  "51-200 employees": 125,
  "201-500 employees": 350,
  "500+ employees": 750
};

const industryFactor = {
  Manufacturing: 8,
  "Retail & Wholesale": 6,
  "Professional Services": 4,
  "Technology & IT": 3.5,
  Healthcare: 6.5,
  "Hospitality & Tourism": 7,
  Construction: 7.5,
  "Transportation & Logistics": 9,
  "Agriculture & Food Production": 9.5,
  Education: 4.5,
  Other: 5
};

const officeFactor = {
  "Under 100 m²": 1,
  "100-500 m²": 3,
  "500-1,000 m²": 6,
  "1,000-5,000 m²": 15,
  "5,000+ m²": 30
};

const heatingFactor = {
  "Natural gas": 6,
  "Oil/heating oil": 8,
  "District heating": 5,
  "Electric heating": 7,
  "Heat pump": 3,
  "Other/Mixed": 6
};

const electricityMap = {
  "Under 1,000 kWh": 12000,
  "1,000-5,000 kWh": 36000,
  "5,000-10,000 kWh": 90000,
  "10,000-50,000 kWh": 300000,
  "50,000+ kWh": 900000
};

const vehicleCount = {
  None: 0,
  "1-5 vehicles": 5,
  "6-20 vehicles": 15,
  "20+ vehicles": 35
};

const fuelFactor = {
  Petrol: 1,
  Diesel: 1.1,
  Hybrid: 0.7,
  Electric: 0.3,
  Mixed: 0.9
};

const carTravelMap = {
  "Under 10,000 km": 2,
  "10,000-50,000 km": 8,
  "50,000-150,000 km": 18,
  "150,000+ km": 30
};

const flightMap = {
  None: 0,
  "1-10 short-haul flights": 5,
  "11-50 short-haul flights": 15,
  "1-10 long-haul flights": 12,
  "11+ long-haul flights": 30,
  "Mixed (rough estimate)": 20
};

const procurementMap = {
  "Under €50,000": 3,
  "€50,000-€250,000": 8,
  "€250,000-€1,000,000": 18,
  "€1,000,000+": 35
};

const wasteMap = {
  "Minimal (1-2 bags)": 1,
  "Moderate (3-10 bags)": 3,
  "Significant (multiple bins/containers)": 6,
  "Large scale (industrial waste)": 12
};

const commuteSplitMap = {
  "Mostly car": 6,
  Balanced: 4,
  "Mostly public transport": 2,
  "Mostly cycling/walking": 1
};

const cloudMap = {
  None: 0.5,
  Minimal: 1,
  Moderate: 3,
  Significant: 6
};

const policyFactor = {
  Yes: 0.95,
  Some: 0.98,
  No: 1,
  "Planning to": 1
};

const airconFactor = {
  Yes: 1.2,
  No: 1,
  Partially: 1.1
};

const renewablesFactor = {
  "Yes, 100% renewable": 0.6,
  "Partially renewable": 0.85,
  No: 1,
  "Don't know": 1
};

const commuteSupportFactor = {
  Yes: 0.9,
  Partially: 0.95,
  No: 1
};

const recyclingFactor = {
  "Yes, most waste": 0.9,
  Partially: 0.95,
  No: 1,
  "Don't know": 1
};

const emissionState = {
  selections: {},
  portfolio: {}
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

const loadState = () => {
  const stored = sessionStorage.getItem("assessmentState");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      emissionState.selections = parsed.selections || {};
      emissionState.portfolio = parsed.portfolio || {};
    } catch (error) {
      console.warn("Could not parse stored state", error);
    }
  }
};

const saveState = () => {
  sessionStorage.setItem(
    "assessmentState",
    JSON.stringify({
      selections: emissionState.selections,
      portfolio: emissionState.portfolio
    })
  );
  sessionStorage.setItem("currentStep", String(currentStep));
};

const showStep = (step) => {
  currentStep = Math.min(Math.max(step, 1), TOTAL_STEPS);
  steps.forEach((panel) => {
    panel.classList.toggle("active", Number(panel.dataset.step) === currentStep);
  });
  stepCount.textContent = currentStep;
  progressFill.style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;
  document.querySelector("main").scrollIntoView({ behavior: "smooth" });
  updateConditionalFields();

  if (currentStep === 10) {
    backButton.style.display = "none";
    nextButton.style.display = "none";
  } else {
    backButton.style.display = "inline-flex";
    backButton.style.visibility = currentStep === 1 ? "hidden" : "visible";
    nextButton.style.display = currentStep >= 9 ? "none" : "inline-flex";
  }

  if (currentStep === 6) {
    latestResults = calculateResults();
    renderResults(latestResults);
  }

  if (currentStep === 8) {
    renderPortfolio(latestResults || calculateResults());
  }

  if (currentStep === 9) {
    renderSummary();
  }

  saveState();
};

const getValue = (name) => emissionState.selections[name] || "";

const applyStoredValues = () => {
  const fields = form.querySelectorAll("input, select, textarea");
  fields.forEach((field) => {
    const value = getValue(field.name);
    if (value !== undefined && value !== "") {
      if (field.type === "checkbox") {
        field.checked = value === "true";
      } else if (field.type === "range") {
        field.value = value;
        updateRangeValue(field);
      } else {
        field.value = value;
      }
    }
  });
  if (emissionState.portfolio.offsetLevel) {
    offsetLevel.value = emissionState.portfolio.offsetLevel;
  }
};

const updateRangeValue = (input) => {
  const display = document.querySelector(`[data-range="${input.name}"]`);
  if (display) {
    display.textContent = `${input.value}%`;
  }
};

const updateConditionalFields = () => {
  document.querySelectorAll(".field-conditional").forEach((field) => {
    const trigger = field.dataset.showWhen;
    const values = field.dataset.value.split(",");
    const current = getValue(trigger);
    field.style.display = values.includes(current) ? "flex" : "none";
  });

  document.querySelectorAll(".industry-block").forEach((block) => {
    const currentIndustry = getValue("industry");
    block.style.display = block.dataset.industry === currentIndustry ? "block" : "none";
  });
};

const requiredFieldsForStep = (step) => {
  const panel = steps.find((stepElement) => Number(stepElement.dataset.step) === step);
  if (!panel) return [];
  return Array.from(panel.querySelectorAll("[required]")).filter((field) => {
    if (field.closest(".field-conditional") && field.closest(".field-conditional").style.display === "none") {
      return false;
    }
    if (field.closest(".industry-block") && field.closest(".industry-block").style.display === "none") {
      return false;
    }
    return true;
  });
};

const validateStep = (step) => {
  const requiredFields = requiredFieldsForStep(step);
  let valid = true;
  requiredFields.forEach((field) => {
    const value = field.type === "checkbox" ? field.checked : field.value.trim();
    if (!value) {
      field.classList.add("invalid");
      valid = false;
    } else {
      field.classList.remove("invalid");
    }
  });
  if (!valid) {
    alert("Please complete all required fields before continuing.");
  }
  return valid;
};

const calculateResults = () => {
  const employees = employeeMap[getValue("companySize")] || 25;
  const industry = getValue("industry") || "Other";
  const basePerEmployee = industryFactor[industry] || industryFactor.Other;
  const baseline = employees * basePerEmployee;

  const officeSize = officeFactor[getValue("officeSize")] || 3;
  const heating = heatingFactor[getValue("heating")] || 5;
  const aircon = airconFactor[getValue("aircon")] || 1;
  const electricitySelection = getValue("electricity");
  const electricityUsage =
    electricitySelection === "Don't know"
      ? employees * 3000
      : electricityMap[electricitySelection] || 30000;
  const electricityEmissions = electricityUsage * 0.0002;
  const renewables = renewablesFactor[getValue("renewables")] || 1;

  const facilities = (officeSize * heating + electricityEmissions) * aircon * renewables;

  const vehicles = vehicleCount[getValue("vehicles")] || 0;
  const fuel = fuelFactor[getValue("fuelType")] || 1;
  const vehicleEmissions = vehicles * fuel;
  const carTravel = carTravelMap[getValue("carTravel")] || 5;
  const flights = flightMap[getValue("flights")] || 5;
  const commuteSplit = commuteSplitMap[getValue("commuteSplit")] || 4;
  const commuteSupport = commuteSupportFactor[getValue("commuteSupport")] || 1;
  const remoteWork = Number(getValue("remoteWork")) || 0;
  const commute = (commuteSplit * (employees / 50)) * commuteSupport * (1 - remoteWork / 200);

  const transport = vehicleEmissions + carTravel + flights + commute;

  const procurement = getValue("procurement") === "Yes" ? procurementMap[getValue("procurementSpend")] || 6 : 2;
  const waste = wasteMap[getValue("waste")] || 3;
  const recycling = recyclingFactor[getValue("recycling")] || 1;
  const manufacturing = getValue("manufacturingMachinery") === "Yes" ? 10 : 0;
  const hospitality = getValue("hospitalityFood") === "Yes" ? 5 : 0;
  const logistics = getValue("logisticsFleet") ? 8 : 0;
  const operations = (procurement + waste + manufacturing + hospitality + logistics) * recycling;

  const cloud = cloudMap[getValue("cloudUsage")] || 1;
  const policy = policyFactor[getValue("policies")] || 1;

  const other = cloud + baseline * 0.1;

  const total = (baseline + facilities + transport + operations + other) * policy;

  return {
    total,
    facilities,
    transport,
    operations,
    other
  };
};

const renderResults = (results) => {
  if (!results) return;
  totalEmissions.textContent = numberFormatter.format(results.total);
  portfolioEmissions.textContent = numberFormatter.format(results.total);
  summaryEmissions.textContent = numberFormatter.format(results.total);

  const items = [
    { label: "Facilities & Energy", value: results.facilities, color: "#0b5f4b" },
    { label: "Transportation & Travel", value: results.transport, color: "#1a8f6a" },
    { label: "Operations & Supply Chain", value: results.operations, color: "#2db37d" },
    { label: "Other / Indirect", value: results.other, color: "#5cc997" }
  ];

  chartBars.innerHTML = "";
  items.forEach((item) => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    const span = document.createElement("span");
    span.style.background = item.color;
    span.style.width = `${Math.min(100, (item.value / results.total) * 100)}%`;
    span.textContent = `${item.label}: ${numberFormatter.format(item.value)} t CO2e`;
    bar.appendChild(span);
    chartBars.appendChild(bar);
  });

  const cars = Math.round(results.total * 4.6);
  const trees = Math.round(results.total * 45);
  comparison.textContent = `Equivalent to approximately ${cars} cars driven for one year, or ${trees} trees absorbing CO2 for a year.`;
};

const renderPortfolio = (results) => {
  if (!results) return;
  projectGrid.innerHTML = "";

  PROJECTS.forEach((project, index) => {
    const allocation = emissionState.portfolio[index] || 0;
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <img src="${project.imageUrl}" alt="${project.name}">
      <div class="card-body">
        <span class="badge">${project.type}</span>
        <h4>${project.name}</h4>
        <p class="muted">${project.location}</p>
        <p>${project.description}</p>
        <p><strong>€${project.pricePerTonne}</strong> per tonne · ${project.certification}</p>
        <ul>
          ${project.impacts.map((impact) => `<li>${impact}</li>`).join("")}
        </ul>
        <label>
          Allocation: <span class="allocation-value">${allocation}%</span>
          <input type="range" min="0" max="100" value="${allocation}" data-project="${index}">
        </label>
      </div>
    `;
    projectGrid.appendChild(card);
  });

  projectGrid.querySelectorAll("input[type='range']").forEach((input) => {
    input.addEventListener("input", (event) => {
      const index = event.target.dataset.project;
      emissionState.portfolio[index] = Number(event.target.value);
      event.target.previousElementSibling.textContent = `${event.target.value}%`;
      updatePortfolioTotals(results);
      saveState();
    });
  });

  updatePortfolioTotals(results);
};

const updatePortfolioTotals = (results) => {
  const offset = Number(offsetLevel.value || 100);
  const allocations = Object.values(emissionState.portfolio);
  const allocationTotal = allocations.reduce((sum, value) => sum + value, 0);
  const weightedPrice = PROJECTS.reduce((sum, project, index) => {
    const allocation = emissionState.portfolio[index] || 0;
    return sum + (allocation / 100) * project.pricePerTonne;
  }, 0);

  const offsetEmissions = results.total * (offset / 100);
  const estimatedCost = offsetEmissions * weightedPrice;

  portfolioPercent.textContent = numberFormatter.format(allocationTotal);
  portfolioCost.textContent = currencyFormatter.format(estimatedCost || 0);

  emissionState.portfolio.offsetLevel = offset;
  saveState();
};

const renderSummary = () => {
  if (!latestResults) {
    latestResults = calculateResults();
  }
  summaryEmissions.textContent = numberFormatter.format(latestResults.total);
  summaryCost.textContent = portfolioCost.textContent;
  summaryBreakdown.innerHTML = "";

  PROJECTS.forEach((project, index) => {
    const allocation = emissionState.portfolio[index] || 0;
    if (allocation > 0) {
      const row = document.createElement("p");
      row.textContent = `${project.name}: ${allocation}%`;
      summaryBreakdown.appendChild(row);
    }
  });

  if (!summaryBreakdown.childElementCount) {
    summaryBreakdown.innerHTML = "<p>No projects selected yet. Add allocations in the previous step.</p>";
  }

  const companyField = form.querySelector("input[name='contactCompany']");
  if (companyField && !companyField.value) {
    companyField.value = getValue("companyName");
  }
};

const sendEmail = async () => {
  const emailjsConfigured = window.emailjs && window.EMAILJS_PUBLIC_KEY;
  if (!emailjsConfigured) {
    formStatus.textContent = "Email sending is not configured yet. Please follow the README instructions to connect EmailJS.";
    formStatus.style.color = "#c26b1c";
    return false;
  }

  formStatus.textContent = "Sending your request...";
  formStatus.style.color = "#6b7a70";

  const templateParams = {
    contact_name: getValue("contactName"),
    contact_email: getValue("contactEmail"),
    contact_phone: getValue("contactPhone"),
    company_name: getValue("contactCompany"),
    contact_method: getValue("contactMethod"),
    contact_time: getValue("contactTime"),
    contact_message: getValue("contactMessage"),
    emissions_total: numberFormatter.format(latestResults.total),
    portfolio_allocations: summaryBreakdown.textContent,
    timestamp: new Date().toLocaleString()
  };

  try {
    await window.emailjs.send(
      window.EMAILJS_SERVICE_ID,
      window.EMAILJS_TEMPLATE_ID,
      templateParams,
      window.EMAILJS_PUBLIC_KEY
    );
    formStatus.textContent = "Thank you! Our team will contact you within 2 business days.";
    formStatus.style.color = "#0b5f4b";
    return true;
  } catch (error) {
    console.error(error);
    formStatus.textContent = "We couldn't send your request right now. Please try again later.";
    formStatus.style.color = "#b42318";
    return false;
  }
};

form.addEventListener("input", (event) => {
  const { name, value, type, checked } = event.target;
  if (!name) return;
  emissionState.selections[name] = type === "checkbox" ? String(checked) : value;
  if (type === "range") {
    updateRangeValue(event.target);
  }
  saveState();
  updateConditionalFields();
});

form.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  if (!action) return;

  if (action === "start") {
    showStep(1);
  }

  if (action === "next") {
    if (currentStep <= 5 && !validateStep(currentStep)) return;
    showStep(currentStep + 1);
  }

  if (action === "back") {
    showStep(currentStep - 1);
  }

  if (action === "print") {
    window.print();
  }

  if (action === "restart") {
    sessionStorage.clear();
    window.location.reload();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateStep(9)) return;
  const sent = await sendEmail();
  if (sent) {
    showStep(10);
  }
});

offsetLevel.addEventListener("change", () => {
  updatePortfolioTotals(latestResults || calculateResults());
});

const initialize = () => {
  loadState();
  applyStoredValues();
  updateConditionalFields();
  showStep(currentStep);
};

initialize();
