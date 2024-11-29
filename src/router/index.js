// src/router/index.js
import {createRouter, createWebHistory} from 'vue-router'
import {useUserStore} from '../stores/userStore'
import Login from '../views/LoginAndSignUp.vue'
import HomePage from '../views/HomePage.vue'
import History from "@/views/History.vue";
import testupload from "@/views/testupload.vue";

// 配置路由
const routes = [
    // {
    //     path: '/test',
    //     name: 'Test',
    //     component: testupload
    // },
    {
        path: '/',
        name: 'Login',
        component: Login
    },
    {
        path: '/home',
        name: 'HomePage',
        component: HomePage,
        meta: {requiresAuth: true}  // 需要认证的页面
    },
    {
        path: '/history',
        name: 'History',
        component: History,
        meta: {requiresAuth: true}  // 需要认证的页面
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// 设置全局路由守卫，检查是否登录
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    const token = userStore.token || localStorage.getItem('auth_token')  // 获取 token

    // 如果目标路由需要认证且没有 token，跳转到登录页
    if (to.meta.requiresAuth && !token) {
        next({name: 'Login'})
    } else {
        next()
    }
})

export default router
