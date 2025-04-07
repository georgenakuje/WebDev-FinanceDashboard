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
    async handleLogin() {
      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Login failed')
        }

        // Store login flag and redirect
        localStorage.setItem('token', data.token)
        localStorage.setItem('isLoggedIn', 'true')
        this.$router.push('/')
      } catch (err) {
        alert(err.message)
        console.error('Login error:', err)
      }
    }
  }
}
</script>

  
