import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import TransactionList from '../components/TransactionList.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'

const routes = [
    { path: '/', name: 'Dashboard', component: Dashboard}, 
    { path: '/transactions', name: 'Transactions', component: TransactionList},
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register }
]

const router = createRouter({
    history: createWebHistory(), 
    routes
})

export default router