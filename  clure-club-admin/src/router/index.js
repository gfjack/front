import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/Login.vue'),
            meta: { requiresAuth: false }
        },
        {
            path: '/',
            name: 'Layout',
            component: () => import('@/layout/index.vue'),
            redirect: '/dashboard',
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/dashboard',
                    name: 'Dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { title: '仪表板', icon: 'Odometer' }
                },
                {
                    path: '/users',
                    name: 'Users',
                    component: () => import('@/views/Users.vue'),
                    meta: { title: '用户管理', icon: 'User' }
                },
                {
                    path: '/points',
                    name: 'Points',
                    component: () => import('@/views/Points.vue'),
                    meta: { title: '积分管理', icon: 'Medal' }
                },
                {
                    path: '/announcements',
                    name: 'Announcements',
                    component: () => import('@/views/Announcements.vue'),
                    meta: { title: '公告管理', icon: 'Bell' }
                },
                {
                    path: '/prizes',
                    name: 'Prizes',
                    component: () => import('@/views/Prizes.vue'),
                    meta: { title: '奖品管理', icon: 'Present' }
                },
                {
                    path: '/messages',
                    name: 'Messages',
                    component: () => import('@/views/Messages.vue'),
                    meta: { title: '留言管理', icon: 'ChatDotRound' }
                },
                {
                    path: '/ranking',
                    name: 'Ranking',
                    component: () => import('@/views/Ranking.vue'),
                    meta: { title: '排行榜', icon: 'TrophyBase' }
                }
            ]
        }
    ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.token) {
        next('/login')
    } else if (to.path === '/login' && authStore.token) {
        next('/')
    } else {
        next()
    }
})

export default router