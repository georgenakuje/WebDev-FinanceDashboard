$(document).ready(function() {
    addition()    
});

let input1;
let input2;
let input3;
let input4;


function holdsIncome(){
    input1 = document.getElementById("incomeTitle").value
    input2 = parseFloat(document.getElementById("incomeValue").value)
    console.log("input2:", input2);
    return input2;
}

function holdsExpense(){
    input3 = document.getElementById("expenseTitle").value
    input4 = parseFloat(document.getElementById("expenseValue").value)
    console.log("input4:", input4);
    return input4;
}

function addition(){
    const totalIncome = holdsIncome()
    const totalExpense = holdsExpense()
    
    totalIncome.innerHTML = displayIncTotal.value;

    console.log("Total Income:", totalIncome);
    console.log("Total Expense:", totalExpense);


    const outputInc = document.querySelector(".total1"); 
    outputInc.textContent = `Total Income: ${totalIncome}`; // Correctly update the total income display

    const outputExp = document.querySelector(".total2"); 
    outputExp.textContent = `Total Expense: ${totalExpense}`; // Correctly update the total expense display


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



