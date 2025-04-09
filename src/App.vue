<template>
  <div class="app-layout">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import Sidebar from "./components/Sidebar.vue";
import { ref, provide, onMounted } from "vue";

export default {
  components: { Sidebar },

  computed: {
    isLoginPage() {
      return this.$route.path === "/login";
    },
  },
  setup() {
    const isDark = ref(localStorage.getItem("darkMode") === "true");

    const toggleDark = () => {
      isDark.value = !isDark.value;
      localStorage.setItem("darkMode", isDark.value);
      document.documentElement.classList.toggle("dark", isDark.value);
    };

    provide("isDark", isDark);
    provide("toggleDark", toggleDark);

    onMounted(() => {
      const saved = localStorage.getItem("darkMode");

      if (saved === null) {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        isDark.value = prefersDark;
        document.documentElement.classList.toggle("dark", prefersDark);
      } else {
        document.documentElement.classList.toggle("dark", isDark.value);
      }
    });

    return {};
  },
};
</script>

<style>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 24px;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 16px;
  }
}
</style>
