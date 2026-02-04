<template>
    <v-card :elevation="0" max-width="600">
        <v-row dense>
            <v-col cols="12" sm="6" v-for="(item, index) in items" :key="index">
                <div class="bet-item d-flex align-center justify-space-between pa-2 rounded cursor-pointer" @click="toggleItem(item)" :class="{ 'active border-primary': selectedItems.includes(item) }">
                    <div>{{ item.name }}</div>
                    <div class="d-flex align-center">
                        <div class="text-primary text-caption mr-2">{{ item.odds }}</div>
                        <input type="number" v-model="item.betAmount" class="bet-input"/>
                    </div>
                </div>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCartStore } from '../../stores/bet';

const cartStore = useCartStore();
const isAddedToCart = computed(() => cartStore.getAddedToCart);

const props = defineProps({
    items: {
        type: Array,
        required: true,
    },
    betAmount: {
        type: Number,
        required: true,
    },
});
const emit = defineEmits(['update:selectedItems']);
const selectedItems = ref([]);

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
    () => isAddedToCart.value,
    (newVal) => {
        selectedItems.value = [];
    },
    { immediate: true }
);
</script>