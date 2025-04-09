<template>
  <div class="register-wrapper">
    <div class="register-card">
      <h2>Sign Up</h2>
      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <label>Email</label>
          <input v-model="email" type="email" required />
        </div>
        
        <div class="input-group">
          <label>Password</label>
          <input v-model="password" type="password" required />
        </div>
        
        <div class="input-group">
          <label>Confirm Password</label>
          <input v-model="confirmPassword" type="password" required />
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
        </button>
      </form>

      <p class="signup-link">
        Already have an account?
        <router-link to="/login">Log in</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      isLoading: false
    }
  },
  methods: {
    async handleRegister() {
      try {
        // Validate inputs
        if (!this.email || !this.password || !this.confirmPassword) {
          alert('Please fill in all fields')
          return
        }

        if (this.password !== this.confirmPassword) {
          alert('Passwords do not match')
          return
        }

        this.isLoading = true

        // Make API call to register
        const response = await fetch('http://localhost:3000/api/auth/register', {
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
          throw new Error(data.message || 'Registration failed')
        }

        // Registration successful
        alert('Account created successfully! Please log in.')
        this.$router.push('/login')
      } catch (error) {
        alert(error.message || 'Failed to create account. Please try again.')
        console.error('Registration error:', error)
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>



  
  