<template>
    <v-card :elevation="0" max-width="1000">
        <div class="number-grid">
            <div
                v-for="item in items"
                :key="item.num"
                class="number-item"
            >
                <div class="bet-item d-flex align-center justify-space-between pa-1 rounded cursor-pointer border-primary" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
                    <div class="circle-wrapper mr-2">
                        <v-img :src="getImg(Number(item.name))" width="33" height="33" cover/>
                        <div class="circle-text">{{ item.name.padStart(2, '0') }}</div>
                    </div>
                    <div class="d-flex align-center">
                        <div class="text-primary text-caption mr-2">{{ item.odds }}</div>
                        <input type="number" v-model="item.betAmount" class="bet-input"/>
                    </div>
                </div>
            </div>
        </div>
    </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useZodiacStore } from '../../stores/zodiac';
import { useCartStore } from '../../stores/bet';

const cartStore = useCartStore();
const isAddedToCart = computed(() => cartStore.getAddedToCart);
const zodiacStore = useZodiacStore();
const numbers = zodiacStore.xNumbers;

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
const getImg = (num) => {
    const index = numbers.findIndex(n => n.id === num);
    if (index === -1) return '';
    return new URL(`../../assets/${numbers[index].color}-circle.png`, import.meta.url).href
}

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

onMounted(() => {
    zodiacStore.orderZodiac(); 
});
</script>

<style scoped>
.number-grid {
    display: grid;
    grid-auto-flow: column;          /* 🔥 fill DOWN first */
    grid-template-rows: repeat(10, auto); /* 10 rows per column */
    gap: 5px 5px;
}
</style>