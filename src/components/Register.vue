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

<style scoped>
.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8fafc;
  padding: 16px;
}

.register-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.register-card h2 {
  text-align: center;
  color: #1e293b;
  margin-bottom: 24px;
  font-size: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  transition: border-color 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #3b82f6;
}

button {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background: #2563eb;
}

button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.signup-link {
  text-align: center;
  margin-top: 24px;
  color: #64748b;
  font-size: 14px;
}

.signup-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
  
  