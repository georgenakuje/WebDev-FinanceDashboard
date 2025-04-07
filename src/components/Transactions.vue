<template>
  <div class="transactions-page">
    <h1>Transactions</h1>
    
    <!-- Search and Filter Section -->
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

    <!-- Transaction List -->
    <div class="transaction-list">
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
                {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount.toFixed(2) }}
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
        // Search filter
        const matchesSearch = tx.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        
        // Date range filter
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

        console.log('Saving transaction:', {
          id: tx.id,
          ...updatedData
        })

        const response = await fetch(`http://localhost:3000/api/transactions/${tx.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedData)
        })

        const responseData = await response.json()

        if (response.status === 404) {
          alert('Transaction not found. It may have been deleted.')
          await this.loadTransactions()
          return
        }

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to update transaction')
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
.transactions-page {
  padding: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-filter input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.transaction-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.transaction-details {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.edit-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 150px;
}

.transaction-title {
  font-weight: 500;
  color: #333;
  min-width: 200px;
}

.transaction-date {
  color: #666;
  font-size: 0.9rem;
}

.transaction-amount {
  font-weight: 500;
  min-width: 100px;
  text-align: right;
}

.transaction-amount.income {
  color: #28a745;
}

.transaction-amount.expense {
  color: #dc3545;
}

.transaction-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.edit-btn {
  background-color: #ffc107;
  color: #000;
}

.save-btn {
  background-color: #28a745;
  color: white;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.no-transactions {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.transaction-field {
  flex: 1;
  min-width: 150px;
}
</style> 