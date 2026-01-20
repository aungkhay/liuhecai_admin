import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const prefix = '/admin';
const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    { 
        path: '/login', 
        name: 'login', 
        component: () => import('../views/Login.vue') 
    },
    {
        path: prefix,
        redirect: prefix + '/dashboard',
        component: () => import('../layouts/MainLayout.vue'),
        meta: {
            requiresAuth: true
        },
        children: [
            {
                path: prefix + '/dashboard',
                name: 'dashboard',
                component: () => import('../views/Dashboard.vue'),
                meta: {
                    title: '仪表盘',
                }
            },
            {
                path: prefix + '/aomen-lottery-records',
                name: 'aomen-lottery-records',
                component: () => import('../views/AomenLotteryRecords.vue'),
                meta: {
                    title: '澳门开奖记录',
                }
            },
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();

    const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);
    const previousNearestWithMeta = from.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);

    if(nearestWithTitle) {
        document.title = nearestWithTitle.meta.title;
        userStore.setBarTitle(nearestWithTitle.meta.title);
    } else if(previousNearestWithMeta) {
        document.title = previousNearestWithMeta.meta.title;
        userStore.setBarTitle(previousNearestWithMeta.meta.title);
    }

    if(to.matched.some(record => record.meta.requiresAuth)) {
    
        if(!userStore.isLoggedIn) {
            return next({
                name: 'login',
                replace: false,
                query: { redirect: to.fullPath }
            });
        }

    } else {
        if(to.name ===  'login' && userStore.isLoggedIn) {
            return next({
                name: 'dashboard',
                replace: true,
            });
        }
    }

    return next();
})


export default router