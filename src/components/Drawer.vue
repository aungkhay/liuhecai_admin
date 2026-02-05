<template>
    <div>
        <v-navigation-drawer
            v-model="drawer"
            :permanent="innerWidth > 786 || isDrawerOpen > 0"
            expand-on-hover
            :rail="isDrawerOpen == 2"
            style="box-shadow: 1px 0px 7px 1px #00000020;"
        >
            <v-list-item style="background-color: var(--list-group-active);" height="64" title="管理面板"></v-list-item>

            <v-list nav slim :opened="open">
                <div v-for="(item, index) in drawerItems" :key="index">
                    <v-list-group 
                        :value="item.title"
                        :collapse-icon="item.children?.length > 0 ? 'mdi-chevron-up' : null"
                        :expand-icon="item.children?.length > 0 ? 'mdi-chevron-down' : null"
                    >
                        <template v-slot:activator="{ props }">
                            <v-list-item 
                                v-bind="props" 
                                :title="item.title" 
                                :value="item.title"
                                :prepend-icon="item.icon"
                                :active="item.isSelected"
                                color="primary"
                                :style="`background-color: ${item.isSelected ? 'var(--list-group-active)' : ''}`"
                                @click="item.children ? {} : changeRoute(index, -1)"
                                :height="50"
                            ></v-list-item>
                        </template>

                        <div v-for="(child, i) in item?.children" :key="i">
                            <v-list-item
                                :title="child.title"
                                :value="child.title"
                                :active="child.isSelected"
                                color="primary"
                                @click="changeRoute(index, i)"
                                :height="50"
                            ></v-list-item>
                        </div>
                        
                    </v-list-group>
                </div>
            </v-list>

            <template v-slot:append>
                <div class="pa-2">
                    <v-btn block color="red-darken-4" variant="flat" @click="dialog = true"><v-icon>mdi-logout</v-icon><span v-if="isDrawerOpen < 2">退出</span></v-btn>
                </div>
            </template>
        </v-navigation-drawer>

        <v-dialog v-model="dialog" persistent transition="dialog-bottom-transition" max-width="320px">
            <v-card class="pa-2">
                <v-card-title class="d-flex justify-space-between">
                    <span>退出</span> 
                    <v-btn v-if="!isLoading" size="small" variant="text" icon="mdi-close" @click="dialog = false"></v-btn>
                </v-card-title>
                <v-card-text class="py-0 px-3">
                    <div>您确定要退出吗？</div>
                </v-card-text>
                <v-card-actions class="justify-center mt-3">
                    <v-btn :loading="isLoading" :disabled="isLoading" :color="isLoading ? 'grey-darken-4' : 'red-darken-1'" variant="flat" @click="logout()">
                        <v-icon>mdi-logout</v-icon> 确定
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';
import router from '@/routers';
import { LOGOUT } from '@/js/api';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const { xs } = useDisplay();
const isDrawerOpen = computed(() => userStore.isDrawerOpen);
const innerWidth = computed(() => userStore.innerWidth);
const currentRoute = computed(() => userStore.currentRoute);
const dialog = ref(false);
const drawer = ref(null);
const isLoading = ref(false);
const open = ref([]);
const drawerItems = ref([
    { 
        title: '仪表盘', 
        icon: 'mdi-view-dashboard', 
        routeName: 'dashboard', 
        isSelected: false,
    },
    {
        title: '轮播图管理',
        icon: 'mdi-image-multiple',
        routeName: 'banner',
        isSelected: false,
    },
    {
        title: '开奖记录',
        icon: 'mdi-view-list',
        isSelected: false,
        children: [
            { 
                title: '平台开奖记录', 
                icon: 'mdi-view-list', 
                routeName: 'platform-lottery-records', 
                isSelected: false,
            },
            { 
                title: '澳门开奖记录', 
                icon: 'mdi-view-list', 
                routeName: 'aomen-lottery-records', 
                isSelected: false,
            },
            { 
                title: '香港开奖记录', 
                icon: 'mdi-view-list', 
                routeName: 'hongkong-lottery-records', 
                isSelected: false,
            },
        ]
    },
    { 
        title: '结果猜测', 
        icon: 'mdi-view-list', 
        isSelected: false,
        children: [
            {
                title: '发什么开什么',
                icon: 'mdi-circle-small',
                routeName: 'result-guess',
                isSelected: false,
            },
            {
                title: '一期内幕',
                icon: 'mdi-circle-small',
                routeName: 'yi-qi-nei-mu',
                isSelected: false,
            },
            {
                title: '投资平特',
                icon: 'mdi-circle-small',
                routeName: 'tou-zi-ping-te',
                isSelected: false,
            },
            {
                title: '大神双波',
                icon: 'mdi-circle-small',
                routeName: 'double-color',
                isSelected: false,
            },
        ],
    },
    {
        title: '下注',
        icon: 'mdi-cash-multiple',
        routeName: 'do-bet',
        isSelected: false,
    },
    {
        title: '下注记录',
        icon: 'mdi-history',
        routeName: 'bet-history',
        isSelected: false,
    }
]);

function setDrawerActive(parentIndex, childIndex) {
    drawerItems.value = drawerItems.value.map((item) => {
        let parent = item;
        parent.isSelected = false;

        if (parent.children) {
            let children = parent.children;
            children = children.map(child => {
                child.isSelected = false;
                return child;
            });
            parent.children = children;
        }
        return parent;
    });

    drawerItems.value[parentIndex].isSelected = true;
    if (childIndex >= 0) {
        drawerItems.value[parentIndex].children[childIndex].isSelected = true;
    }

    open.value = [drawerItems.value[parentIndex].title];
}

function changeRoute(parentIndex, childIndex) {
    if (xs.value) {
        closeDrawer();
    }

    if (childIndex >= 0) {
        router.push({ name: drawerItems.value[parentIndex].children[childIndex].routeName })
    } else {
        router.push({ name: drawerItems.value[parentIndex].routeName })
    }
    setDrawerActive(parentIndex, childIndex);
}

watch(
    () => currentRoute.value,
    () => {
        for (let i = 0; i < drawerItems.value.length; i++) {
            const parent = drawerItems.value[i];
            if(parent.routeName && parent.routeName == currentRoute.value) {
                setDrawerActive(i, -1);
                break;
            } else if(parent.children) {
                const childIndex = parent.children.findIndex((item) => item.routeName == currentRoute.value);
                if(childIndex >= 0) {
                    setDrawerActive(i, childIndex);
                    break;
                }
            }
        }
    },
    { immediate: true, deep: true }
)

async function logout() {
    isLoading.value = true;
    await LOGOUT();
    setTimeout(() => {
        isLoading.value = false;
        router.push('/login');
    }, 2000);
}
</script>

<style scoped>
.v-list-group__items .v-list-item {
  padding-inline-start: 16px !important;
}
</style>