import { createApp } from 'vue'
import './assets/style.css'
import App from './App.vue'
import router from './router/index.js'

createApp(App).use(router).mount('#app')


var totalIncome = 0;
var totalExpense = 0;
var budgetValue = 0;

function holdsIncome(){ /*collects the income value and the titles for where the user gained those income*/
  let input1 = document.getElementById("incomeTitle").value;
  let input2 = Number(document.querySelector("#incomeValue").value);
  
  addition(input2, "income");
  budgetRemains(input2, "income");

  document.getElementById("displayIncTotal").value = totalIncome; /*displays the income total to the website */
}

function holdsExpense(){ /*collects the expense value and the titles for where the user used those expenses*/
  let input3 = document.getElementById("expenseTitle").value;
  let input4 = Number(document.querySelector("#expenseValue").value);

  addition(input4, "expense");
  budgetRemains(input4, "expense");

  document.getElementById("displayExpTotal").value = totalExpense; /*displays the expense total to the website */
}

function budgetRemains(value, type){/*using income and expense values, it subtracts to get budget remaining */

  if (type == "income"){
    budgetValue += value;
  }
  else if (type == "expense"){
    budgetValue -= value;
  }

  document.getElementById("bugetRemaining").value = budgetValue; /*displays the budgetRemaining to the website */
}

function addition(value, type){ /*used to add either total income or expense values that the user inputted */
  if (type == "income"){
    return totalIncome += value;
  }

  else if (type == "expense"){
    return totalExpense += value;
  }
}



// DOM elements for converter
const convertBtn = document.getElementById("convertBtn");
const fromCurrency = document.getElementById("from-currency");
const toCurrency = document.getElementById("to-currency");
const amountInput = document.getElementById("amount");
const resultOutput = document.getElementById("rate-output");

// Exchange API key
const API_KEY = "df287470c36497518a237b8c";

convertBtn.addEventListener("click", async () => {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (isNaN(amount) || amount <= 0) {
    resultOutput.textContent = "Please enter valid amount.";
    return;
  }

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${from}`
    );
    const data = await res.json();
    const rate = data.conversion_rates[to];
    const converted = (amount * rate).toFixed(2);

    resultOutput.textContent = `${amount} ${from} = ${converted} ${to}`;
  } catch (err) {
    resultOutput.textContent = "Error!";
    console.error(err);
  }
});

// Updates flag based on currency selection
function updateFlag(selectEl) {
  const currencyCode = selectEl.value;
  const flagId = selectEl.dataset.flagId;
  const flagImg = document.getElementById(flagId);

  // Currency to country code mapping
  const currencyToCountry = {
    USD: "US",
    CAD: "CA",
    GBP: "GB",
  };

  const countryCode = currencyToCountry[currencyCode];
  flagImg.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
}

document.querySelectorAll("select").forEach((select) => {
  select.addEventListener("change", () => updateFlag(select));
});

document.querySelectorAll("select").forEach((select) => updateFlag(select));

// Swap icon to swap currencies
document.getElementById("swap").addEventListener("click", () => {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;

  updateFlag(fromCurrency);
  updateFlag(toCurrency);

  // Automatic conversion
  convertBtn.click();
});



