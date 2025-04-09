<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
    </div>

    <div class="summary-cards">
      <div class="summary-card">
        <h3>Total Income</h3>
        <p class="amount income">{{ formatCurrency(totalIncome) }}</p>
      </div>

      <div class="summary-card">
        <h3>Total Expenses</h3>
        <p class="amount expense">{{ formatCurrency(totalExpense) }}</p>
      </div>

      <div class="summary-card">
        <h3>Net Worth</h3>
        <p class="amount">{{ formatCurrency(totalIncome + totalExpense) }}</p>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <h3>Add Transaction</h3>
        <AddTransactionForm @transaction-added="handleAdd" />
      </div>

      <div class="card">
        <h3>Currency Converter</h3>
        <CurrencyConverter />
      </div>
    </div>
  </div>
</template>

<script>
import AddTransactionForm from "./AddTransactionForm.vue";
import CurrencyConverter from "./CurrencyConverter.vue";

export default {
  components: {
    AddTransactionForm,
    CurrencyConverter,
  },
  data() {
    return {
      transactions: [],
    };
  },
  computed: {
    totalIncome() {
      return this.transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    },
    totalExpense() {
      return Math.abs(
        this.transactions
          .filter((t) => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0)
      );
    },
  },
  methods: {
    async loadTransactions() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const response = await fetch("http://localhost:3000/api/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        this.transactions = await response.json();
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    },
    handleAdd(tx) {
      this.transactions.push(tx);
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    },
  },
  async mounted() {
    await this.loadTransactions();
  },
};
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
  background: #f8fafc;
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-card h3 {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.summary-card .amount {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.summary-card .amount.income {
  color: #22c55e;
}

.summary-card .amount.expense {
  color: #ef4444;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.card h3 {
  font-size: 16px;
  color: #1e293b;
  margin: 0 0 16px 0;
  font-weight: 600;
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: 12px;
  }

  .summary-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .summary-card {
    padding: 16px;
  }

  .card {
    padding: 16px;
  }

  .summary-card .amount {
    font-size: 18px;
  }
}
</style>
