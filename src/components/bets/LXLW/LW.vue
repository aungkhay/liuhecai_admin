<template>
    <v-card :elevation="0" max-width="500">
        <v-row dense>
            <v-col cols="12" sm="6" v-for="(item, index) in items" :key="index">
                <div class="bet-item d-flex align-center justify-space-between pa-2 rounded cursor-pointer border-primary border" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
                    <div>{{ item.name }}</div>
                    <div class="text-primary text-caption mr-2">{{ item.odds }}</div>
                </div>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';

const props = defineProps({
    items: {
        type: Array,
        required: true,
    }
});
const selectedItems = ref([]);

const toggleItem = (item) => {
    const index = selectedItems.value.indexOf(item);
    if (index === -1) {
        selectedItems.value.push(item);
    } else {
        selectedItems.value.splice(index, 1);
    }
};
</script>