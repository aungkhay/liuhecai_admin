<template>
    <v-card :elevation="0" max-width="600">
        <div class="number-grid">
            <div
                v-for="item in specialItems"
                :key="item.num"
                class="number-item"
            >
                <div class="bet-item d-flex align-center justify-space-between pa-1 rounded cursor-pointer border-primary border" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
                    <div class="d-flex align-center">
                        <div class="mr-2">{{ item.name }}</div>
                        <div v-for="(num, i) in item.numbers" :key="i" class="d-flex align-center">
                            <div class="circle-wrapper mr-2">
                                <v-img :src="getImg(num.color)" width="33" height="33" cover/>
                                <div class="circle-text">{{ num.num }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="text-primary text-caption mr-2">{{ item.odds }}</div>
                </div>
            </div>
        </div>
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
    sub: {
        type: Object,
        required: true,
    },
});
const emit = defineEmits(['update:selectedItems']);
const selectedItems = ref([]);
const specialItems = ref([]);

const groupCombinations = computed(() => {
    return combinations(selectedItems.value, props.sub?.limit_bet_count);
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
    emit('update:selectedItems', selectedItems.value, groupCombinations.value);
};

watch(
    () => props.items,
    (newItems) => {
        const specials = [];
        for (const item of newItems) {
            if (zodiacs.value) {
                const zodiac = zodiacs.value.find(z => z.name === item.name);
                if (zodiac) {
                    item.numbers = zodiac.numbers;
                    specials.push(item);
                }
            }
        }
        specialItems.value = specials;
    },
    { immediate: true }
);

watch(
    () => props.sub,
    (newSub) => {
        // Clear selected items when sub changes
        selectedItems.value = [];
        emit('update:selectedItems', selectedItems.value, groupCombinations.value);
    },
    { immediate: true }
);

onMounted(() => {
    zodiacStore.orderZodiac();
});

watch(
    () => isAddedToCart.value,
    (newVal) => {
        selectedItems.value = [];
        emit('update:selectedItems', selectedItems.value, groupCombinations.value);
    },
    { immediate: true }
);
</script>

<style scoped>
.number-grid {
    display: grid;
    grid-auto-flow: column;          /* 🔥 fill DOWN first */
    grid-template-rows: repeat(6, auto); /* 6 rows per column */
    gap: 5px 5px;
}
</style>