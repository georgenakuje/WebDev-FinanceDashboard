<template>
  <aside class="sidebar">
    <div class="top">
      <h2 class="logo">C <span class="danger">FINANCE</span></h2>
    </div>

    <nav class="nav-links">
      <!-- Router links -->
      <router-link to="/" class="nav-item">
        <span class="material-symbols-sharp">grid_view</span> Dashboard
      </router-link>

      <router-link to="/transactions" class="nav-item">
        <span class="material-symbols-sharp">receipt_long</span> Transactions
      </router-link>

      <!-- Placeholder links (not functional yet) -->
      <a href="#"><span class="material-symbols-sharp">person_outline</span> Customers</a>
      <a href="#"><span class="material-symbols-sharp">insights</span> Analytics</a>
      <a href="#"><span class="material-symbols-sharp">mail_outline</span> Messages <span class="msg_count">5</span></a>
      <a href="#"><span class="material-symbols-sharp">report</span> Reports</a>
      <a href="#"><span class="material-symbols-sharp">settings</span> Settings</a>

      <router-link
        v-if="!isLoggedIn" to="/login" class="nav-item">
        <span class="material-symbols-sharp">login</span> Login
      </router-link>
      <a v-else href="#" class="nav-item" @click.prevent="handleLogout">
        <span class="material-symbols-sharp">logout</span> Logout
      </a>

    </nav>
  </aside>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false
    }
  }, 
  created() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  }, 
  watch: {
    '$route'() {
      //refresh login state on every route change
      this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    }
  }, 
  methods: {
    handleLogout() {
      localStorage.removeItem('isLoggedIn')
      this.isLoggedIn = false
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #fff;
  height: 100vh;
  padding: 2rem 1rem;
  box-shadow: 4px 0 15px rgba(0,0,0,0.05);
  position: fixed;
  left: 0;
  top: 0;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1d3557;
}

.logo .danger {
  color: #e63946;
}

.nav-links {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.nav-links a,
.nav-links .nav-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-links a:hover,
.nav-links .nav-item:hover {
  color: #3b82f6;
}

.router-link-active {
  color: #3b82f6;
  font-weight: bold;
}

.msg_count {
  background-color: #e63946;
  color: white;
  font-size: 0.75rem;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
  margin-left: auto;
}
</style>
