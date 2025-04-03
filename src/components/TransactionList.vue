<template>
    <div>
      <h2 style="color: blue; text-align: center; margin-top: 50px;">Expense History:</h2>
      <table class="financeOutput">
        <thead>
          <tr>
            <th>Expense Name</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tx, index) in transactions" :key="index">
            <td>{{ tx.desc }}</td>
            <td>{{ tx.amount }}</td>
            <td><button @click="$emit('delete', index)">Delete</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    props: ['transactions']
  }
  </script>
  