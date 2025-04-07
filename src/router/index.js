import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../components/Dashboard.vue";
import Transactions from "../components/Transactions.vue";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import Customers from "../components/Customers.vue";
import Analytics from "../components/Analytics.vue";
import Reports from "../components/Reports.vue";
import Settings from "../components/Settings.vue";

const routes = [
  { path: "/", name: "Dashboard", component: Dashboard },
  { path: "/transactions", name: "Transactions", component: Transactions },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  { path: "/customers", name: "Customers", component: Customers },
  { path: "/analytics", name: "Analytics", component: Analytics },
  { path: "/reports", name: "Reports", component: Reports },
  { path: "/settings", name: "Settings", component: Settings },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
