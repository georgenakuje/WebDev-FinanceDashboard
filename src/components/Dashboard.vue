<!-- src/views/Dashboard.vue -->
<template>
    <div class="dashboard-layout">
      <h1 class="title">Finance Tracker</h1>
  
      <div class="layout-grid">
        <!-- Left Column -->
        <div class="left-section">
          <AddTransactionForm @transaction-added="handleAdd" />
  
          <div class="summary-cards">
            <SummaryCard title="Total Income" :value="totalIncome" color="green" />
            <SummaryCard title="Budget Remaining" :value="totalIncome + totalExpense" color="black" />
          </div>
        </div>
  
        <!-- Right Column -->
        <div class="right-section">
          <CurrencyConverter />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import AddTransactionForm from '../components/AddTransactionForm.vue'
  import SummaryCard from '../components/SummaryCard.vue'
  import CurrencyConverter from '../components/CurrencyConverter.vue'
  
  export default {
    components: {
      AddTransactionForm,
      SummaryCard,
      CurrencyConverter
    },
    data() {
      return {
        transactions: []
      }
    },
    computed: {
      totalIncome() {
        return this.transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
      },
      totalExpense() {
        return this.transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
      }
    },
    methods: {
      handleAdd(tx) {
        this.transactions.push(tx)
      }
    }
  }
  </script>
  