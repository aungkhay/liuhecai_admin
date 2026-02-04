<template>
    <v-card :elevation="0" max-width="800">
        <v-row dense>
            <v-col cols="12" sm="6" md="4" lg="3" v-for="(item, index) in items" :key="index">
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
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useZodiacStore } from '../../../stores/zodiac';
import { useCartStore } from '../../../stores/bet';

const zodiacStore = useZodiacStore();
const numbers = zodiacStore.xNumbers;
const cartStore = useCartStore();
const isAddedToCart = computed(() => cartStore.getAddedToCart);

const selectedItems = ref([]);

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

const getImg = (num) => {
    const index = numbers.findIndex(n => n.id === num);
    if (index === -1) return '';
    return new URL(`../../../assets/${numbers[index].color}-circle.png`, import.meta.url).href
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
)
</script>