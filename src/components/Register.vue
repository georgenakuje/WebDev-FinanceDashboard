<template>
    <div class="login-box">
      <h2>Sign Up</h2>
      <input v-model="email" placeholder="Email" type="email" />
      <input v-model="username" placeholder="username" type="username" />
      <input v-model="password" placeholder="Password" type="password" />
      <input v-model="confirmPassword" placeholder="Confirm Password" type="password" />
      <button @click="handleRegister">Register</button>
      <p class="signup-link">
        Already have an account?
        <router-link to="/login">Log in</router-link>
      </p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      }
    },
    methods: {
      handleRegister() {
        if (!this.email || !this.password || !this.confirmPassword) {
          alert('Fill in both fields.')
          return
        }

        if (this.password != this.confirmPassword){
          alert('Passwords do not match, try again!')
          return
        }


        // Save user (for demo: store in localStorage)
        const user = {
          email: this.email,
          password: this.password
        }
        localStorage.setItem('user', JSON.stringify(user))
        alert('Registered successfully! Please log in.')
        this.$router.push('/login')
      }
    }
  }
  </script>
  
  