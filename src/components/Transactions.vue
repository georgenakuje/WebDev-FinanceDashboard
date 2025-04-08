<template>
  <div class="transactions-container">
    <div class="transactions-header">
      <h1>Transactions</h1>
      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search transactions..."
            @input="filterTransactions"
          />
        </div>
        <div class="date-filter">
          <input 
            type="date" 
            v-model="startDate" 
            @change="filterTransactions"
          />
          <span>to</span>
          <input 
            type="date" 
            v-model="endDate" 
            @change="filterTransactions"
          />
        </div>
      </div>
    </div>

    <div class="transactions-list">
      <div v-if="filteredTransactions.length === 0" class="no-transactions">
        No transactions found
      </div>
      <div v-else class="transactions">
        <div v-for="tx in filteredTransactions" :key="tx.id" class="transaction-item">
          <div class="transaction-details">
            <div class="transaction-field">
              <input 
                v-if="isEditing(tx.id)" 
                v-model="tx.editDescription" 
                class="edit-input"
              />
              <span v-else class="transaction-title">{{ tx.description }}</span>
            </div>
            
            <div class="transaction-field">
              <input 
                v-if="isEditing(tx.id)" 
                type="number" 
                v-model.number="tx.editAmount" 
                class="edit-input"
              />
              <span v-else :class="['transaction-amount', tx.amount > 0 ? 'income' : 'expense']">
                {{ tx.amount > 0 ? '+' : '' }}{{ formatCurrency(tx.amount) }}
              </span>
            </div>
            
            <div class="transaction-field">
              <input 
                v-if="isEditing(tx.id)" 
                type="date" 
                v-model="tx.editDate" 
                class="edit-input"
              />
              <span v-else class="transaction-date">{{ new Date(tx.date).toLocaleDateString() }}</span>
            </div>
          </div>
          
          <div class="transaction-actions">
            <button 
              v-if="isEditing(tx.id)" 
              @click="saveEdit(tx)" 
              class="action-btn save-btn"
            >
              Save
            </button>
            <button 
              v-else 
              @click="startEdit(tx)" 
              class="action-btn edit-btn"
            >
              Edit
            </button>
            <button 
              @click="deleteTransaction(tx.id)" 
              class="action-btn delete-btn"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      transactions: [],
      searchQuery: '',
      startDate: '',
      endDate: '',
      filteredTransactions: [],
      editingId: null
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

        const data = await response.json()
        this.transactions = data
        this.filterTransactions()
      } catch (error) {
        console.error('Error loading transactions:', error)
      }
    },
    filterTransactions() {
      this.filteredTransactions = this.transactions.filter(tx => {
        const matchesSearch = tx.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        const txDate = new Date(tx.date)
        const start = this.startDate ? new Date(this.startDate) : null
        const end = this.endDate ? new Date(this.endDate) : null
        const matchesDate = (!start || txDate >= start) && (!end || txDate <= end)
        return matchesSearch && matchesDate
      })
    },
    startEdit(tx) {
      this.editingId = tx.id
      tx.editDescription = tx.description
      tx.editAmount = tx.amount
      tx.editDate = new Date(tx.date).toISOString().split('T')[0]
    },
    async saveEdit(tx) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          alert('Please log in again')
          return
        }

        const updatedData = {
          description: tx.editDescription,
          amount: parseFloat(tx.editAmount),
          date: tx.editDate
        }

        const response = await fetch(`http://localhost:3000/api/transactions/${tx.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedData)
        })

        if (!response.ok) {
          throw new Error('Failed to update transaction')
        }

        Object.assign(tx, {
          description: tx.editDescription,
          amount: parseFloat(tx.editAmount),
          date: tx.editDate
        })
        
        this.editingId = null
        this.filterTransactions()
      } catch (error) {
        console.error('Error updating transaction:', error)
        alert(error.message || 'Failed to update transaction')
      }
    },
    async deleteTransaction(id) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No authentication token found')
          return
        }

        const response = await fetch(`http://localhost:3000/api/transactions/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        this.transactions = this.transactions.filter(tx => tx.id !== id)
        this.filterTransactions()
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    }
  },
  computed: {
    isEditing() {
      return (id) => this.editingId === id
    }
  },
  async mounted() {
    await this.loadTransactions()
  }
}
</script>

<style scoped>
.transactions-container {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.transactions-header {
  margin-bottom: 24px;
}

.transactions-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.filters {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 300px;
  color: #1e293b;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 4px;
  border-radius: 8px;
}

.date-filter span {
  color: #64748b;
  font-size: 14px;
}

.date-filter input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #1e293b;
  background-color: white;
  min-width: 150px;
  cursor: pointer;
  font-size: 14px;
}

.date-filter input[type="date"]::-webkit-calendar-picker-indicator {
  color: #64748b;
  opacity: 1;
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-left: 8px;
}

.date-filter input[type="date"]:hover {
  border-color: #cbd5e1;
}

.date-filter input[type="date"]:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.transactions-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  gap: 16px;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-details {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(200px, 2fr) minmax(120px, 1fr) minmax(120px, 1fr);
  gap: 16px;
  min-width: 0;
  align-items: center;
  margin-right: 16px;
}

.transaction-field {
  min-width: 0;
  position: relative;
  display: block;
  width: 100%;
}

.transaction-field input {
  width: 100%;
  display: block;
}

.transaction-title {
  font-weight: 500;
  color: #1e293b;
}

.transaction-amount {
  font-weight: 500;
  text-align: right;
}

.transaction-amount.income {
  color: #22c55e;
}

.transaction-amount.expense {
  color: #ef4444;
}

.transaction-date {
  color: #64748b;
  font-size: 14px;
  text-align: right;
}

.transaction-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.edit-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #1e293b;
  font-size: 14px;
  background-color: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  display: block;
}

.edit-input:hover {
  border-color: #cbd5e1;
}

.edit-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.edit-input[type="date"] {
  padding-right: 32px;
  min-width: auto;
  appearance: none;
  -webkit-appearance: none;
  background-color: white;
  position: relative;
  display: block;
  width: 100%;
}

.edit-input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  opacity: 1;
  cursor: pointer;
  padding: 2px;
  z-index: 1;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-size: 14px;
  min-width: 70px;
}

.edit-btn {
  background: #e2e8f0;
  color: #1e293b;
}

.edit-btn:hover {
  background: #cbd5e1;
}

.save-btn {
  background: #22c55e;
  color: white;
}

.save-btn:hover {
  background: #16a34a;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover {
  background: #dc2626;
}

.no-transactions {
  text-align: center;
  padding: 32px;
  color: #64748b;
}

@media (max-width: 1200px) {
  .transaction-details {
    grid-template-columns: 40% 30% 20%;
  }
}

@media (max-width: 992px) {
  .transaction-details {
    grid-template-columns: minmax(150px, 2fr) minmax(100px, 1fr) minmax(100px, 1fr);
    gap: 12px;
  }

  .edit-input {
    padding: 6px 10px;
    font-size: 13px;
  }

  .action-btn {
    padding: 6px 12px;
    min-width: 60px;
  }
}

@media (max-width: 768px) {
  .transaction-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .transaction-details {
    grid-template-columns: 1fr;
  }

  .transaction-field {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .edit-input {
    width: 60%;
    margin-left: auto;
  }

  .transaction-actions {
    justify-content: flex-end;
    width: 100%;
  }

  .action-btn {
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .transaction-field {
    flex-direction: column;
    align-items: stretch;
  }

  .edit-input {
    width: 100%;
    margin-left: 0;
  }

  .transaction-actions {
    flex-direction: row;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    min-width: 0;
  }
}
</style> 