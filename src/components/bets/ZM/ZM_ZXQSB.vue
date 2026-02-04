<template>
    <div>
        <v-card :elevation="0" max-width="800">
            <div class="text-h6 mb-2">正肖</div>
            <div class="number-grid">
                <div
                    v-for="item in specialItems"
                    :key="item.num"
                    class="number-item"
                >
                    <div class="bet-item d-flex align-center justify-space-between pa-1 rounded cursor-pointer border-primary" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
                        <div class="d-flex align-center">
                            <div class="mr-2">{{ item.name }}</div>
                            <div v-for="(num, i) in item.numbers" :key="i" class="d-flex align-center">
                                <div class="circle-wrapper mr-2">
                                    <v-img :src="getImg(num.color)" width="33" height="33" cover/>
                                    <div class="circle-text">{{ num.num }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex align-center">
                            <div class="text-primary text-caption mr-2">{{ item.odds }}</div>
                            <input type="number" v-model="item.betAmount" class="bet-input"/>
                        </div>
                    </div>
                </div>
            </div>
        </v-card>

        <v-divider class="mt-5 mb-3"></v-divider>
        
        <v-card :elevation="0" max-width="800">
            <div class="text-h6 mb-2">七色波</div>
            <v-row dense>
                <v-col cols="12" sm="6" md="4" lg="3" v-for="(item, index) in colorItems" :key="index">
                    <div class="bet-item d-flex align-center justify-space-between pa-1 rounded cursor-pointer border-primary" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
                        <div>{{ item.name }}</div>
                        <div class="d-flex align-center">
                            <div class="text-primary text-caption mr-2">{{ item.odds }}</div>
                            <input type="number" v-model="item.betAmount" class="bet-input"/>
                        </div>
                    </div>
                </v-col>
            </v-row>
        </v-card>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useZodiacStore } from '../../../stores/zodiac';
import { useCartStore } from '../../../stores/bet';

const zodiacStore = useZodiacStore();
const zodiacs = computed(() => zodiacStore.getOrderedZodiacs);
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
const specialItems = ref([]);
const colorItems = ref([]);

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
        const specials = [];
        const zhengxiaoItems = newItems.filter(i => i.sub_group === '正肖');
        for (const item of zhengxiaoItems) {
            if (zodiacs.value) {
                const zodiac = zodiacs.value.find(z => z.name === item.name);
                if (zodiac) {
                    item.numbers = zodiac.numbers;
                    specials.push(item);
                }
            }
        }
        specialItems.value = specials;
        colorItems.value = newItems.filter(i => i.sub_group === '七色波');
    },
    { immediate: true }
);

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
    grid-template-rows: repeat(6, auto); /* 6 rows per column */
    gap: 5px 5px;
}
</style>