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

            <v-list-item
                v-for="(item, i) in drawerItems"
                :key="i"
                :value="item.title"
                :title="item.title"
                color="primary"
                @click="changeRoute(i)"
                :active="item.isSelected"
                :height="50"
            >
                <template v-slot:prepend>
                    <v-icon :icon="item.icon"></v-icon>
                </template>
                <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item>

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
const drawerItems = ref([
    { 
        title: '仪表盘', 
        icon: 'mdi-view-dashboard', 
        routeName: 'dashboard', 
        isSelected: false,
    },
    { 
        title: '澳门开奖记录', 
        icon: 'mdi-view-list', 
        routeName: 'aomen-lottery-records', 
        isSelected: false,
    },
]);

function setDrawerActive(index) {
    drawerItems.value = drawerItems.value.map((item) => {
        let parent = item;
        parent.isSelected = false;
        return parent;
    });
    drawerItems.value[index].isSelected = true;
}

function changeRoute(index) {
    if (xs.value) {
        userStore.closeDrawer()
    }
    router.push({ name: drawerItems.value[index].routeName })
    setDrawerActive(index);
}

watch(
    () => currentRoute.value,
    () => {
        for (let i = 0; i < drawerItems.value.length; i++) {
            const item = drawerItems.value[i];
            if(item.routeName && item.routeName == currentRoute.value) {
                setDrawerActive(i, -1);
                break;
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