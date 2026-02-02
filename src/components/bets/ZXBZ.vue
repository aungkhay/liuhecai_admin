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
    </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useZodiacStore } from '../../stores/zodiac';

const zodiacStore = useZodiacStore();
const numbers = zodiacStore.xNumbers;

const props = defineProps({
    items: {
        type: Array,
        required: true,
    }
});
const selectedItems = ref([]);
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
};

onMounted(() => {
    zodiacStore.orderZodiac(); 
});
</script>