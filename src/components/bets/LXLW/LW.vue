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
        <div class="mt-3 text-caption"><span class="text-red">1</span>单<span class="text-red">{{ groupCombinations.length }}</span>组<span class="text-red">{{ props.betAmount * groupCombinations.length }}</span>元</div>
    </v-card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { combinations } from '../../../js/common';

const props = defineProps({
    items: {
        type: Array,
        required: true,
    },
    betAmount: {
        type: Number,
        required: true,
    },
    sub: {
        type: Object,
        required: true,
    },
});
const emit = defineEmits(['update:selectedItems']);
const selectedItems = ref([]);
const groupCombinations = computed(() => {
    return combinations(selectedItems.value, props.sub?.limit_bet_count);
});

const toggleItem = (item) => {
    const index = selectedItems.value.indexOf(item);
    if (index === -1) {
        item.betAmount = props.betAmount;
        selectedItems.value.push(item);
    } else {
        selectedItems.value.splice(index, 1);
    }
    emit('update:selectedItems', selectedItems.value);
};

watch(
    () => props.sub,
    (newSub) => {
        // Clear selected items when sub changes
        selectedItems.value = [];
        emit('update:selectedItems', selectedItems.value);
    },
    { immediate: true }
);
</script>