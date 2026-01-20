<template>
    <v-app>
        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useUserStore } from './stores/user';
import { useRoute } from 'vue-router';
import { PROFILE } from './js/api';

const userStore = useUserStore();
const route = useRoute();
const isLoggedIn = computed(() => userStore.isLoggedIn);

watch(
	() => route.path,
	() => {
		userStore.setCurrentRoute(route.name);
	},
	{ immediate: true, deep: true }
)

onMounted(() => {
	window.addEventListener('resize', () => {
		userStore.setInnerWidth();
    });

	if (isLoggedIn.value) {
		PROFILE();
	}
})
</script>

<style scoped></style>
