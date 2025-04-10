<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1>Settings</h1>
      <p class="subtitle">Customize your experience</p>
    </div>

    <div class="settings-grid">
      <!-- Theme Settings -->
      <div class="settings-card">
        <h2>Appearance</h2>
        <div class="setting-group">
          <label>Theme</label>
          <div class="theme-options">
            <button
              class="theme-btn"
              :class="{ active: settings.theme === 'light' }"
              @click="setTheme('light')"
            >
              <span class="material-symbols-sharp">light_mode</span>
              Light
            </button>
            <button
              class="theme-btn"
              :class="{ active: settings.theme === 'dark' }"
              @click="setTheme('dark')"
            >
              <span class="material-symbols-sharp">dark_mode</span>
              Dark
            </button>
          </div>
        </div>
      </div>

      <!-- Currency Settings -->
      <div class="settings-card">
        <h2>Currency</h2>
        <div class="setting-group">
          <label>Default Currency</label>
          <select
            v-model="settings.currency"
            class="select-input"
            @change="updateSettings"
          >
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="CAD">Canadian Dollar (CAD)</option>
            <option value="AUD">Australian Dollar (AUD)</option>
          </select>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="settings-card">
        <h2>Notifications</h2>
        <div class="setting-group">
          <div class="setting-row">
            <div>
              <h3>Email Notifications</h3>
              <p class="setting-description">
                Receive updates about your transactions
              </p>
            </div>
            <label class="toggle">
              <input
                type="checkbox"
                v-model="settings.email_notifications"
                @change="updateSettings"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div>
              <h3>Budget Alerts</h3>
              <p class="setting-description">
                Get notified when you're close to your budget limit
              </p>
            </div>
            <label class="toggle">
              <input
                type="checkbox"
                v-model="settings.budget_alerts"
                @change="updateSettings"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="settings-card">
        <h2>Account</h2>
        <div class="setting-group">
          <div class="setting-row">
            <div>
              <h3>Email</h3>
              <p class="setting-description">{{ userEmail }}</p>
            </div>
            <button class="action-btn" @click="showChangeEmail = true">
              Change
            </button>
          </div>

          <div class="setting-row">
            <div>
              <h3>Password</h3>
              <p class="setting-description">
                Last changed {{ lastPasswordChange }}
              </p>
            </div>
            <button class="action-btn" @click="showChangePassword = true">
              Change
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Email Modal -->
    <div v-if="showChangeEmail" class="modal">
      <div class="modal-content">
        <h2>Change Email</h2>
        <form @submit.prevent="updateEmail">
          <div class="form-group">
            <label>New Email</label>
            <input type="email" v-model="newEmail" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" v-model="currentPassword" required />
          </div>
          <div class="modal-actions">
            <button
              type="button"
              class="cancel-btn"
              @click="showChangeEmail = false"
            >
              Cancel
            </button>
            <button type="submit" class="save-btn">Update Email</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePassword" class="modal">
      <div class="modal-content">
        <h2>Change Password</h2>
        <form @submit.prevent="updatePassword">
          <div class="form-group">
            <label>Current Password</label>
            <input type="password" v-model="currentPassword" required />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" v-model="newPassword" required />
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input type="password" v-model="confirmPassword" required />
          </div>
          <div class="modal-actions">
            <button
              type="button"
              class="cancel-btn"
              @click="showChangePassword = false"
            >
              Cancel
            </button>
            <button type="submit" class="save-btn">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Settings",
  data() {
    return {
      settings: {
        theme: localStorage.getItem("theme") || "light",
        currency: "CAD",
        email_notifications: false,
        budget_alerts: false,
      },
      showChangeEmail: false,
      showChangePassword: false,
      newEmail: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      userEmail: "",
      lastPasswordChange: "Never",
    };
  },
  methods: {
    async loadSettings() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:3000/api/settings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to load settings");

        const data = await response.json();
        this.settings = data;
        this.userEmail = localStorage.getItem("email");
        this.lastPasswordChange = data.last_password_change || "Never";

        // Apply theme
        this.applyTheme(data.theme);
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    },

    async updateSettings() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:3000/api/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(this.settings),
        });

        if (!response.ok) throw new Error("Failed to update settings");

        // Apply theme
        this.applyTheme(this.settings.theme);
      } catch (error) {
        console.error("Error updating settings:", error);
      }
    },

    setTheme(theme) {
      this.settings.theme = theme;
      this.applyTheme(theme);
      this.updateSettings();
    },

    applyTheme(theme) {
      {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
      }
    },

    async updateEmail() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          "http://localhost:3000/api/settings/email",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              newEmail: this.newEmail,
              password: this.currentPassword,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to update email");

        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", this.newEmail);

        this.userEmail = this.newEmail;
        this.showChangeEmail = false;
        this.newEmail = "";
        this.currentPassword = "";
      } catch (error) {
        console.error("Error updating email:", error);
        alert(error.message);
      }
    },

    async updatePassword() {
      try {
        if (this.newPassword !== this.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          "http://localhost:3000/api/settings/password",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              currentPassword: this.currentPassword,
              newPassword: this.newPassword,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to update password");

        this.lastPasswordChange = new Date().toLocaleDateString();
        this.showChangePassword = false;
        this.currentPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
      } catch (error) {
        console.error("Error updating password:", error);
        alert(error.message);
      }
    },
  },
  mounted() {
    this.applyTheme(this.settings.theme);
    this.loadSettings();
  },
};
</script>

<style scoped>
.settings-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 32px;
}

.settings-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  margin: 8px 0 0 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.settings-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.settings-card h2 {
  font-size: 18px;
  color: #1e293b;
  margin: 0 0 20px 0;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.setting-row h3 {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin: 0;
}

.setting-description {
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0 0;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 8px;
}

.theme-options {
  display: flex;
  gap: 12px;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.theme-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.select-input {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  width: 100%;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: 0.4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #3b82f6;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #e2e8f0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #cbd5e1;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.modal-content h2 {
  margin: 0 0 24px 0;
  font-size: 20px;
  color: #1e293b;
}

.form-group {
  margin-bottom: 16px;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #e2e8f0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .theme-options {
    flex-direction: column;
  }

  .theme-btn {
    width: 100%;
    justify-content: center;
  }
  .dark .settings-container {
    background-color: #111111;
    color: #f5f5f5;
  }

  .dark .settings-card {
    background: #1e1e1e;
  }

  .dark .settings-card h2,
  .dark .setting-row h3,
  .dark .setting-group label {
    color: #e0e0e0;
  }

  .dark .setting-description {
    color: #cbd5e1;
  }

  .dark .select-input {
    background-color: #2a2a2a;
    color: #e0e0e0;
    border-color: #444;
  }

  .dark .theme-btn {
    background-color: #2a2a2a;
    border-color: #444;
    color: #e0e0e0;
  }

  .dark .theme-btn.active {
    background-color: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }

  .dark .action-btn,
  .dark .cancel-btn,
  .dark .modal-content {
    background-color: #2a2a2a;
    color: #f0f0f0;
  }
}
</style>

<!-- Dark theme -->
<style>
.dark .settings-container {
  background-color: #111111;
  color: #f5f5f5;
}

.dark .settings-card {
  background: #1e1e1e;
}

.dark .settings-card h2,
.dark .setting-row h3,
.dark .setting-group label {
  color: #e0e0e0;
}

.dark .setting-description {
  color: #cbd5e1;
}

.dark .select-input {
  background-color: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}

.dark .theme-btn {
  background-color: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}

.dark .theme-btn.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.dark .action-btn,
.dark .cancel-btn,
.dark .modal-content {
  background-color: #2a2a2a;
  color: #f0f0f0;
}
.dark .subtitle {
  color: #f0f0f0;
}
</style>
