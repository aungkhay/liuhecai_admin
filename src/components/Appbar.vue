<template>
    <div>
        <v-app-bar :elevation="0">
            <v-app-bar-nav-icon @click="switchDrawer"></v-app-bar-nav-icon>
            <v-app-bar-title class="font-weight-bold">{{ barTitle }}</v-app-bar-title>
            <v-btn icon="mdi-account" variant="flat" color="primary" class="ml-4" size="small" @click="dialog = true"></v-btn>

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
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const profile = computed(() => userStore.profile);
const dialog = ref(false);

const barTitle = computed(() => userStore.barTitle);

function switchDrawer() {
    userStore.setDrawer();
}

onMounted(() => {

})
</script>