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
      async loadTransactions() {
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            console.error('No authentication token found')
            return
          }

          const response = await fetch('http://localhost:3000/api/transactions', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          this.transactions = await response.json()
        } catch (error) {
          console.error('Error loading transactions:', error)
        }
      },
      handleAdd(tx) {
        this.transactions.push(tx)
      }
    },
    async mounted() {
      await this.loadTransactions()
    }
  }
  </script>
  
  <style scoped>
  .transaction-list {
    margin-top: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .transaction-list h2 {
    margin-bottom: 1rem;
    color: #333;
  }

  .transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }

  .transaction-details {
    flex: 1;
  }

  .transaction-title {
    font-weight: 500;
    color: #333;
  }

  .transaction-date {
    font-size: 0.8rem;
    color: #666;
    margin-left: 1rem;
  }

  .transaction-amount {
    font-weight: 500;
    margin: 0 1rem;
  }

  .transaction-amount.income {
    color: #28a745;
  }

  .transaction-amount.expense {
    color: #dc3545;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #dc3545;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 0.5rem;
  }

  .delete-btn:hover {
    color: #c82333;
  }

  .no-transactions {
    text-align: center;
    color: #666;
    padding: 2rem;
  }
  </style>
  