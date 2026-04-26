<template>
    <div>
        <v-app-bar :elevation="0" density="compact">
            <v-app-bar-nav-icon @click="switchDrawer"></v-app-bar-nav-icon>
            <v-app-bar-title class="font-weight-bold">{{ barTitle }}</v-app-bar-title>
            <v-btn icon="mdi-account" variant="flat" color="primary" class="ml-4" size="small" @click="dialog = true"></v-btn>

            <template #extension>
                <div class="bg-grey-lighten-4 w-100">
                    <v-tabs v-model="active" show-arrows density="compact" color="primary" bg-color="grey-lighten-4" variant="text">
                        <v-tab density="compact" v-for="t in tabs" :key="t.key" :value="t.key" @click="goTab(t)" @contextmenu.prevent="openTabMenu($event, t)">
                            <span class="mr-2 text-caption">{{ t.title }}</span>
                            <v-btn v-if="tabs.length > 1" icon="mdi-close" variant="text" size="x-small" @click.stop="closeTab(t)"/>
                        </v-tab>

                        <v-menu
                            v-model="tabMenu.open"
                            :target="[tabMenu.x, tabMenu.y]"
                            location="top"
                            :close-on-content-click="true"
                        >
                            <v-list density="compact" min-width="180">
                                <v-list-item
                                    title="关闭当前"
                                    :disabled="!tabMenu.tab || tabs.length <= 1"
                                    @click="closeTab(tabMenu.tab)"
                                />
                                <v-list-item
                                    title="关闭其他"
                                    :disabled="!tabMenu.tab || tabs.length <= 1"
                                    @click="closeOthers(tabMenu.tab)"
                                />
                            </v-list>
                        </v-menu>
                    </v-tabs>
                </div>
            </template>

            <v-dialog
                v-model="dialog"
                transition="dialog-bottom-transition" 
                max-width="400px"
            >
                <v-card>
                    <div>
                        <div class="d-flex justify-center bg-black py-5"><v-icon size="128" color="primary">mdi-account-circle-outline</v-icon></div>
                        <div class="text-center my-10">
                            <div>Name: {{ profile?.name }}</div>
                        </div>
                    </div>
                </v-card>
            </v-dialog>
        </v-app-bar>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useUserStore } from '../stores/user';
import { useTabsStore } from '../stores/tabs';
import { useRouter } from 'vuetify/lib/composables/router.mjs';

const userStore = useUserStore();
const tabsStore = useTabsStore();
const profile = computed(() => userStore.profile);
const dialog = ref(false);
const router = useRouter();

const barTitle = computed(() => userStore.barTitle);
const tabs = computed(() => tabsStore.tabs);
const active = computed({
    get: () => tabsStore.activeKey,
    set: (key) => tabsStore.setActive(key),
});

const tabMenu = reactive({
    open: false,
    x: 0,
    y: 0,
    tab: null,
});

function openTabMenu(e, tab) {
    tabMenu.tab = tab;
    tabMenu.x = e.clientX;
    tabMenu.y = e.clientY;

    // reopen reliably
    tabMenu.open = false;
    requestAnimationFrame(() => (tabMenu.open = true));
}

function switchDrawer() {
    userStore.setDrawer();
}

function goTab(t) {
  tabsStore.setActive(t.key);
  router.push({ name: t.key });
}

function closeTab(tab) {
    const nextPath = tabsStore.close(tab.key);
    if (nextPath) router.push({ name: nextPath });
}

function closeOthers(tab) {
    const nextPath = tabsStore.closeOthers(tab.key); // add this action in store
    if (nextPath) router.push({ name: nextPath });
}
</script>