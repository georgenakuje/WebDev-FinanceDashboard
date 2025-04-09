<template>
  <div class="settings-container">
    <h1>Settings</h1>
    <p class="subtitle">Customize your experience</p>

    <div class="settings-grid">
      <div class="settings-card">
        <h2>Appearance</h2>
        <p>Theme</p>
        <div class="theme-options">
          <button
            :class="{ active: theme === 'light' }"
            @click="setTheme('light')"
          >
            Light
          </button>
          <button
            :class="{ active: theme === 'dark' }"
            @click="setTheme('dark')"
          >
            Dark
          </button>
        </div>
      </div>

      <div class="settings-card">
        <h2>Currency</h2>
        <p>Default Currency</p>
        <select v-model="defaultCurrency">
          <option value="CAD">Canadian Dollar (CAD)</option>
          <option value="USD">US Dollar (USD)</option>
          <option value="GBP">British Pound (GBP)</option>
        </select>
      </div>

      <div class="settings-card">
        <h2>Notifications</h2>
        <div class="setting-item">
          <p>Email Notifications</p>
          <p>Receive updates about your transactions</p>
          <input type="checkbox" v-model="emailNotifications" />
        </div>
        <div class="setting-item">
          <p>Budget Alerts</p>
          <p>Get notified when you're close to your budget limit</p>
          <input type="checkbox" v-model="budgetAlerts" />
        </div>
      </div>

      <div class="settings-card">
        <h2>Account</h2>
        <div class="setting-item">
          <p>Email</p>
          <p>Not set</p>
          <button class="change-btn">Change</button>
        </div>
        <div class="setting-item">
          <p>Password</p>
          <p>Last changed Never</p>
          <button class="change-btn">Change</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Settings",
  data() {
    return {
      theme: localStorage.getItem("theme") || "system",
      defaultCurrency: "CAD",
      emailNotifications: false,
      budgetAlerts: false,
    };
  },
  mounted() {
    this.applyTheme(this.theme);
  },
  methods: {
    setTheme(mode) {
      this.theme = mode;
      localStorage.setItem("theme", mode);
      this.applyTheme(mode);
    },
    applyTheme(mode) {
      const root = document.documentElement;
      if (mode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    },
  },
};
</script>

<style scoped>
.settings-container {
  padding: 2rem;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}
.subtitle {
  color: #64748b;
  margin-bottom: 1rem;
  font-size: 14px;
  color: #64748b;
  font-weight: 400;
}
.dark .subtitle {
  color: #e0e0e0;
}

.settings-container h1 {
  font-size: 24px;
}
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 1.5rem;
}
.settings-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.settings-card > p {
  color: #64748b;
  font-weight: 500;
  font-size: 14px;
}

.dark .settings-card > p {
  color: #e0e0e0;
}

.dark .settings-card {
  background: #1e1e1e;
}

.theme-options button {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  color: #333;
  cursor: pointer;
}

.theme-options button.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.dark .theme-options button {
  background: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}

.dark .theme-options button.active {
  background-color: #3b82f6;
  color: white;
}

.setting-item {
  margin: 1rem 0;
}

.setting-item p {
  margin: 0.2rem 0;
}

.setting-item p:not(:first-child) {
  color: #64748b;
  font-size: 14px;
}

.dark .setting-item p:not(:first-child) {
  color: #e0e0e0;
}

.setting-item p:first-child {
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
}

.dark .setting-item p:first-child {
  color: #e0e0e0;
}

.change-btn {
  margin-top: -1.5rem;
  background: #e5e7eb;
  color: #1e293b;
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: auto;
}

.dark .change-btn {
  background: #2a2a2a;
  color: white;
}

select {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.dark select {
  background-color: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}
</style>
