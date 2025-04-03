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
    submitIncome() {
      this.$emit('transaction-added', {
        desc: this.incomeTitle,
        amount: this.incomeValue,
        date: new Date().toISOString()
      })
      this.incomeTitle = ''
      this.incomeValue = 0
    },
    submitExpense() {
      this.$emit('transaction-added', {
        desc: this.expenseTitle,
        amount: -this.expenseValue,
        date: new Date().toISOString()
      })
      this.expenseTitle = ''
      this.expenseValue = 0
    }
  }
}
</script>

