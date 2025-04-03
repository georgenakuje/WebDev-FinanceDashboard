<!-- src/views/Login.vue -->
<template>
    <div class="login-wrapper">
      <div class="login-card">
        <h1>Login</h1>
  
        <form @submit.prevent="handleLogin">
          <label>Email</label>
          <input type="email" v-model="email" required />
  
          <label>Password</label>
          <input type="password" v-model="password" required />
  
          <button type="submit">Log In</button>
        </form>
  
        <!-- ✅ Sign Up Prompt -->
        <p class="signup-link">
          New user?
          <router-link to="/register">Sign up</router-link>
        </p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Login',
    data() {
      return {
        email: '',
        password: ''
      }
    },
    methods: {
      handleLogin() {
        if (this.email && this.password) {
          localStorage.setItem('isLoggedIn', 'true')
          this.$router.push('/')
        } else {
          alert('Enter credentials!')
        }
      }
    }
  }
  </script>
  
