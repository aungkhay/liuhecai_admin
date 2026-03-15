<template>
    <v-card :elevation="0">
        <v-row dense>
            <v-col cols="4" sm="2" md="1" v-for="item in items" :key="item.num">
                <div class="bet-item d-flex align-center justify-center pa-1 rounded cursor-pointer border-primary border" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
                    <div class="circle-wrapper mr-2">
                        <v-img :src="getImg(Number(item.name))" width="33" height="33" cover/>
                        <div class="circle-text">{{ item.name.padStart(2, '0') }}</div>
                    </div>
                </div>
            </v-col>
        </v-row>
        <div class="mt-3 text-caption"><span class="text-red">1</span>单<span class="text-red">{{ groupCombinations.length }}</span>组<span class="text-red">{{ props.betAmount * groupCombinations.length }}</span>元</div>
    </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useZodiacStore } from '../../stores/zodiac';
import { combinations } from '../../js/common';
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


const getImg = (num) => {
    const index = numbers.findIndex(n => n.id === num);
    if (index === -1) return '';
    return new URL(`../../assets/${numbers[index].color}-circle.png`, import.meta.url).href
}

const toggleItem = (item) => {
    const index = selectedItems.value.indexOf(item);
    if (index === -1) {
        selectedItems.value.push(item);
    } else {
        selectedItems.value.splice(index, 1);
    }
    emit('update:selectedItems', selectedItems.value, groupCombinations.value);
};

watch(
    () => isAddedToCart.value,
    (newVal) => {
        selectedItems.value = [];
        emit('update:selectedItems', selectedItems.value, groupCombinations.value);
    },
    { immediate: true }
);

onMounted(() => {
    zodiacStore.orderZodiac(); 
});
</script>