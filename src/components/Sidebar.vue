<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="logo">C <span class="highlight">FINANCE</span></h2>
    </div>

    <nav class="nav-links">
      <router-link to="/" class="nav-item">
        <span class="material-symbols-sharp">grid_view</span>
        <span>Dashboard</span>
      </router-link>

      <router-link to="/transactions" class="nav-item">
        <span class="material-symbols-sharp">receipt_long</span>
        <span>Transactions</span>
      </router-link>

      <router-link to="/analytics" class="nav-item">
        <span class="material-symbols-sharp">insights</span>
        <span>Analytics</span>
      </router-link>

      <router-link to="/reports" class="nav-item">
        <span class="material-symbols-sharp">report</span>
        <span>Reports</span>
      </router-link>

      <router-link to="/settings" class="nav-item">
        <span class="material-symbols-sharp">settings</span>
        <span>Settings</span>
      </router-link>

      <div class="nav-divider"></div>

      <router-link v-if="!isLoggedIn" to="/login" class="nav-item">
        <span class="material-symbols-sharp">login</span>
        <span>Login</span>
      </router-link>
      <a v-else href="#" class="nav-item" @click.prevent="handleLogout">
        <span class="material-symbols-sharp">logout</span>
        <span>Logout</span>
      </a>

      <button class="dark-toggle" @click="toggleDark">
        {{ isDark ? "Light" : "Dark" }}
      </button>
    </nav>
  </aside>
</template>

<script>
import { inject } from "vue";

export default {
  data() {
    return {
      isLoggedIn: false,
      isDark: inject("isDark"),
      toggleDark: inject("toggleDark"),
    };
  },
  created() {
    this.isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  },
  watch: {
    $route() {
      this.isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    },
  },
  methods: {
    handleLogout() {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
      this.isLoggedIn = false;
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 24px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.sidebar-header {
  padding: 0 8px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.logo .highlight {
  color: #3b82f6;
}

.nav-links {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #64748b;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.nav-item.router-link-active {
  background: #eff6ff;
  color: #3b82f6;
  font-weight: 500;
}

.nav-item .material-symbols-sharp {
  font-size: 20px;
}

.nav-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 16px 0;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    padding: 16px;
  }

  .nav-links {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px;
  }

  .nav-item {
    padding: 8px 12px;
  }

  .nav-item span:last-child {
    display: none;
  }

  .dark-toggle {
    margin-top: 16px;
    padding: 10px;
    background: none;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    width: 100%;
    cursor: pointer;
    font-weight: 600;
    color: #334155;
    transition: all 0.2s ease;
  }

  .dark-toggle:hover {
    background: #f1f5f9;
  }
}
</style>
