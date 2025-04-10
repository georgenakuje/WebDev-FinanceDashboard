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
  setup() {
    const theme = ref(localStorage.getItem("theme") || "light");

    const setTheme = (mode) => {
      theme.value = mode;
      localStorage.setItem("theme", mode);
      document.documentElement.classList.toggle("dark", mode === "dark");
    };

    provide("theme", theme);
    provide("setTheme", setTheme);

    onMounted(() => {
      const savedTheme = localStorage.getItem("theme") || "light";
      theme.value = savedTheme;
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
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
