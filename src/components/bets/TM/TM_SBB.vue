<template>
    <div>
        <v-card :elevation="0" max-width="900">
            <div class="text-h6 mb-2">波色</div>
            <div v-for="(item, index) in colorItems" :key="index" cols="12" sm="6" md="4" lg="3">
                <div class="bet-item d-flex align-center justify-space-between pa-2 rounded cursor-pointer border-primary mb-2" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
                    
                    <div v-if="item.name == '红'" class="d-flex align-center">
                        <div class="mr-2">{{ item.name }}</div>
                        <div v-for="(num, i) in colorNumbers.red" :key="i" class="d-flex align-center">
                            <div class="circle-wrapper mr-2">
                                <v-img :src="getImg('red')" width="33" height="33" cover/>
                                <div class="circle-text">{{ num.padStart(2, '0') }}</div>
                            </div>
                        </div>
                    </div>
                    <div v-if="item.name == '蓝'" class="d-flex align-center">
                        <div class="mr-2">{{ item.name }}</div>
                        <div v-for="(num, i) in colorNumbers.blue" :key="i" class="d-flex align-center">
                            <div class="circle-wrapper mr-2">
                                <v-img :src="getImg('blue')" width="33" height="33" cover/>
                                <div class="circle-text">{{ num.padStart(2, '0') }}</div>
                            </div>
                        </div>
                    </div>
                    <div v-if="item.name == '绿'" class="d-flex align-center">
                        <div class="mr-2">{{ item.name }}</div>
                        <div v-for="(num, i) in colorNumbers.green" :key="i" class="d-flex align-center">
                            <div class="circle-wrapper mr-2">
                                <v-img :src="getImg('green')" width="33" height="33" cover/>
                                <div class="circle-text">{{ num.padStart(2, '0') }}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex align-center">
                        <div class="text-primary text-caption mr-2">{{ item.odds }}</div>
                        <input type="number" v-model="item.betAmount" class="bet-input"/>
                    </div>
                </div>
            </div>
        </v-card>

        <v-divider class="mt-3 mb-5"></v-divider>

        <v-card :elevation="0" max-width="900">
            <div class="text-h6 mb-2">半波</div>
            <v-row dense>
                <v-col v-for="(item, index) in bigSmallItems" :key="index" cols="12" sm="6" md="4" lg="3">
                    <div class="bet-item d-flex align-center justify-space-between pa-2 rounded cursor-pointer border-primary" @click="toggleItem(item)" :class="{ 'active': selectedItems.includes(item) }">
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
import { onMounted, ref, watch, computed } from 'vue';
import { useZodiacStore } from '../../../stores/zodiac';
import { useCartStore } from '../../../stores/bet';

const cartStore = useCartStore();
const isAddedToCart = computed(() => cartStore.getAddedToCart);
const zodiacStore = useZodiacStore();
const colorNumbers = zodiacStore.getColorNumbers;
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
const colorItems = ref([]);
const bigSmallItems = ref([]);

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
        colorItems.value = newItems.filter(i => i.sub_group === '波色');
        bigSmallItems.value = newItems.filter(i => i.sub_group === '半波');
    },
    { immediate: true }
);

watch(
    () => isAddedToCart.value,
    (newVal) => {
        selectedItems.value = [];
    },
    { immediate: true }
)
</script>