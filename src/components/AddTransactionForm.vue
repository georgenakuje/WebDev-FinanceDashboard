<template>
  <div class="card">
    <h2>Add Income</h2>
    <div class="row">
      <input v-model="incomeTitle" placeholder="Title" />
      <input type="number" v-model.number="incomeValue" placeholder="Value" />
      <button @click="submitIncome">Add</button>
    </div>

    <h2>Add Expense</h2>
    <div class="row">
      <input v-model="expenseTitle" placeholder="Title" />
      <input type="number" v-model.number="expenseValue" placeholder="Value" />
      <button @click="submitExpense">Add</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      incomeTitle: '',
      incomeValue: 0,
      expenseTitle: '',
      expenseValue: 0,
    }
  },
  methods: {
    async submitIncome() {
      const newTransaction = {
        desc: this.incomeTitle,
        amount: this.incomeValue,
        date: new Date().toISOString()
      }

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch('http://localhost:3000/api/transactions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newTransaction)
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const saved = await response.json()
        this.$emit('transaction-added', saved)
        this.incomeTitle = ''
        this.incomeValue = 0
      } catch (err) {
        console.error('Error submitting income:', err)
        alert('Failed to add transaction. Please make sure you are logged in.')
      }
    },
    async submitExpense() {
      const newTransaction = {
        desc: this.expenseTitle,
        amount: -this.expenseValue,
        date: new Date().toISOString()
      }

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch('http://localhost:3000/api/transactions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newTransaction)
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const saved = await response.json()
        this.$emit('transaction-added', saved)
        this.expenseTitle = ''
        this.expenseValue = 0
      } catch (err) {
        console.error('Error submitting expense:', err)
        alert('Failed to add transaction. Please make sure you are logged in.')
      }
    }
  }
}
</script>