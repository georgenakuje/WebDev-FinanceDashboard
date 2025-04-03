<template>
  <div class="dashboard-layout">
    <Sidebar />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'

export default {
  components: { Sidebar }, 
  computed: {
    isLoginPage() {
      return this.$route.path === '/login'
    }
  }
}
</script>
