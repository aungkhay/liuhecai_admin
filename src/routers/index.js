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
                path: prefix + '/role-permission',
                name: 'role-permission',
                component: () => import('../views/RolePermission.vue'),
                meta: {
                    title: '角色管理',
                }
            },
            {
                path: prefix + '/users',
                name: 'users',
                component: () => import('../views/User.vue'),
                meta: {
                    title: '用户管理',
                }
            },
            {
                path: prefix + '/banner',
                name: 'banner',
                component: () => import('../views/Banner.vue'),
                meta: {
                    title: '轮播图管理',
                }
            },
            {
                path: prefix + '/lottery-records/aomen',
                name: 'aomen-lottery-records',
                component: () => import('../views/AomenLotteryRecords.vue'),
                meta: {
                    title: '澳门开奖记录',
                }
            },
            {
                path: prefix + '/lottery-records/hongkong',
                name: 'hongkong-lottery-records',
                component: () => import('../views/HongKongLotteryRecords.vue'),
                meta: {
                    title: '香港开奖记录',
                }
            },
            {
                path: prefix + '/lottery-records/platform',
                name: 'platform-lottery-records',
                component: () => import('../views/PlatformLotteryRecords.vue'),
                meta: {
                    title: '平台开奖记录',
                }
            },
            {
                path: prefix + '/result-guess',
                name: 'result-guess',
                component: () => import('../views/ResultGuess.vue'),
                meta: {
                    title: '发什么开什么',
                }
            },
            {
                path: prefix + '/yi-qi-nei-mu',
                name: 'yi-qi-nei-mu',
                component: () => import('../views/YiQiNeiMu.vue'),
                meta: {
                    title: '一期内幕',
                }
            },
            {
                path: prefix + '/tou-zi-ping-te',
                name: 'tou-zi-ping-te',
                component: () => import('../views/TouziPingte.vue'),
                meta: {
                    title: '投资平特',
                }
            },
            {
                path: prefix + '/double-color',
                name: 'double-color',
                component: () => import('../views/DoubleColor.vue'),
                meta: {
                    title: '大神双波',
                }
            },
            {
                path: prefix + '/reference-link',
                name: 'reference-link',
                component: () => import('../views/ReferenceLink.vue'),
                meta: {
                    title: '参考链接',
                }
            },
            {
                path: prefix + '/reference-image',
                name: 'reference-image',
                component: () => import('../views/ReferenceImage.vue'),
                meta: {
                    title: '参考图片',
                }
            },
            {
                path: prefix + '/zodiac-feed',
                name: 'zodiac-feed',
                component: () => import('../views/ZodiacFeed.vue'),
                meta: {
                    title: '草菜肉肖',
                }
            },
            {
                path: prefix + '/do-bet',
                name: 'do-bet',
                component: () => import('../views/DoBet.vue'),
                meta: {
                    title: '下注',
                }
            },
            {
                path: prefix + '/bet-history',
                name: 'bet-history',
                component: () => import('../views/BetHistory.vue'),
                meta: {
                    title: '下注记录',
                }
            },
            {
                path: prefix + '/log',
                name: 'log',
                component: () => import('../views/Log.vue'),
                meta: {
                    title: '操作日志',
                }
            }
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