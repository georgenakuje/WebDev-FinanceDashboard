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



