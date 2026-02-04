<template>
    <v-card :elevation="0">
        <div class="d-flex align-center mb-3">
            <div v-for="x in [2,3,4,5,6,7,8,9,10,11]" :key="x" class="mr-2 border px-3 py-1 rounded text-center cursor-pointer" :class="{ 'border-primary text-primary': limit === x }" @click="limit = x">
                {{ x }}肖
            </div>
        </div>
        <v-row dense>
            <v-col v-for="(item, index) in items" :key="index" cols="12" sm="4" lg="3">
                <div class="bet-item d-flex align-center justify-space-between pa-2 rounded cursor-pointer border-primary" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
                
                    <div class="d-flex align-center">
                        <div class="mr-2">{{ item.name }}</div>
                        <div v-for="(num, i) in item.numbers" :key="i" class="d-flex align-center">
                            <div class="circle-wrapper mr-2">
                                <v-img :src="getImg(num.color)" width="33" height="33" cover/>
                                <div class="circle-text">{{ num.num }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </v-col>
        </v-row>
        <div class="mt-3 text-caption"><span class="text-red">1</span>单<span class="text-red">{{ groupCombinations.length }}</span>组<span class="text-red">{{ props.betAmount * groupCombinations.length }}</span>元</div>
    </v-card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useZodiacStore } from '../../../stores/zodiac';
import { combinations } from '../../../js/common';
import { useCartStore } from '../../../stores/bet';

const cartStore = useCartStore();
const isAddedToCart = computed(() => cartStore.getAddedToCart);
const zodiacStore = useZodiacStore();
const zodiacs = computed(() => zodiacStore.getOrderedZodiacs);

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
const limit = ref(2);
const groupCombinations = computed(() => {
    return combinations(selectedItems.value, limit.value);
});

const getImg = (color) => {
    return new URL(`../../../assets/${color}-circle.png`, import.meta.url).href
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
    () => props.items,
    (newItems) => {
        for (const item of newItems) {
            if (zodiacs.value) {
                const zodiac = zodiacs.value.find(z => z.name === item.name);
                if (zodiac) {
                    const numbers = zodiac.numbers.filter(n => n.id != 49);
                    item.numbers = numbers;
                }
            }
        }
    },
    { immediate: true }
);

onMounted(() => {
    zodiacStore.orderZodiac();
})

watch(
    () => isAddedToCart.value,
    (newVal) => {
        selectedItems.value = [];
    },
    { immediate: true }
);
</script>