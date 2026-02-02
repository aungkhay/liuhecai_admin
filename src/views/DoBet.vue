<template>
    <div>
        <v-card elevation="0" class="border" color="grey-lighten-4">
            <v-tabs color="primary" v-model="tab">
                <v-tab v-for="(cat, index) in categories" :key="index" :value="cat">{{ cat.name }}</v-tab>
            </v-tabs>
        </v-card>
        <v-radio-group v-if="tab" v-model="sub" inline color="primary" hide-details class="py-1"> 
            <v-radio v-for="(subCat, index) in tab.subCategories" :key="index" :label="subCat.name" :value="subCat"></v-radio>
        </v-radio-group>
        <div v-if="sub" class="border rounded pa-2">
            <TM_SM v-if="sub.code === 'TM_SM'" :items="items" />
            <TM_HM v-if="sub.code === 'TM_HM'" :items="items" />
            <TM_SBB v-if="sub.code === 'TM_SBB'" :items="items" />
            <TM_TXTWS v-if="sub.code === 'TM_TXTWS'" :items="items" />
            <TM_HX v-if="sub.code === 'TM_HX'" :items="items" />
            <TM_WX v-if="sub.code === 'TM_WX'" :items="items" />
            <ZM_RX1 v-if="sub.code === 'ZM_RX1'" :items="items" />
            <ZM_ZM16 v-if="sub.code === 'ZM_ZM16'" :items="items" />
            <ZM_ZXQSB v-if="sub.code === 'ZM_ZXQSB'" :items="items" />
            <ZMT v-if="['ZMT_Z1T', 'ZMT_Z2T', 'ZMT_Z3T', 'ZMT_Z4T', 'ZMT_Z5T', 'ZMT_Z6T'].includes(sub.code)" :items="items" />
            <LX v-if="['LXLW_2LX', 'LXLW_3LX', 'LXLW_4LX', 'LXLW_5LX'].includes(sub.code)" :items="items" />
            <LW v-if="['LXLW_2LW', 'LXLW_3LW', 'LXLW_4LW', 'LXLW_5LW'].includes(sub.code)" :items="items" />
            <LM v-if="['LM_3Z2', 'LM_3QZ', 'LM_2QZ', 'LM_2ZT', 'LM_TC', 'LM_4QZ'].includes(sub.code)" :items="items" />
            <YXZXPTWS_YX v-if="sub.code === 'YXZXPTWS_YX'" :items="items" />
            <YXZXPTWS_ZX v-if="sub.code === 'YXZXPTWS_ZX'" :items="items" />
            <YXZXPTWS_PTWS v-if="sub.code === 'YXZXPTWS_PTWS'" :items="items" />
            <ZH v-if="sub.code === 'ZH'" :items="items" />
            <ZX v-if="sub.code === 'ZX'" :items="items" />
            <ZXBZ v-if="sub.code === 'ZXBZ'" :items="items" />
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, shallowRef, watch } from 'vue';
import { GET_BET_CATEGORIES, GET_BET_ITEMS } from '../js/api';
import TM_SM from '../components/bets/TM/TM_SM.vue';
import TM_HM from '../components/bets/TM/TM_HM.vue';
import TM_SBB from '../components/bets/TM/TM_SBB.vue';
import TM_TXTWS from '../components/bets/TM/TM_TXTWS.vue';
import TM_HX from '../components/bets/TM/TM_HX.vue';
import TM_WX from '../components/bets/TM/TM_WX.vue';
import ZM_RX1 from '../components/bets/ZM/ZM_RX1.vue';
import ZM_ZM16 from '../components/bets/ZM/ZM_ZM16.vue';
import ZM_ZXQSB from '../components/bets/ZM/ZM_ZXQSB.vue';
import ZMT from '../components/bets/ZMT.vue';
import LX from '../components/bets/LXLW/LX.vue';
import LW from '../components/bets/LXLW/LW.vue';
import LM from '../components/bets/LM.vue';
import YXZXPTWS_YX from '../components/bets/YXZXPTWS/YXZXPTWS_YX.vue';
import YXZXPTWS_ZX from '../components/bets/YXZXPTWS/YXZXPTWS_ZX.vue';
import YXZXPTWS_PTWS from '../components/bets/YXZXPTWS/YXZXPTWS_PTWS.vue';
import ZH from '../components/bets/ZH.vue';
import ZX from '../components/bets/ZX.vue';
import ZXBZ from '../components/bets/ZXBZ.vue';

const categories = ref([]);
const tab = shallowRef(null);
const sub = ref(null);
const items = ref([]);

const getCategories = async () => {
    const res = await GET_BET_CATEGORIES();
    if (res && res.data) {
        categories.value = res.data;
        if (categories.value.length > 0) {
            tab.value = categories.value[0];
            if (tab.value.subCategories && tab.value.subCategories.length > 0) {
                sub.value = tab.value.subCategories[0];
            }
        }
    }
}

const getBetItems = async (subId) => {
    const res = await GET_BET_ITEMS(subId);
    if (res && res.data) {
        items.value = res.data;
    }
}

watch(sub, (newSub) => {
    if (newSub) {
        getBetItems(newSub.id);
    }
});

watch(tab, (newTab) => {
    if (newTab && newTab.subCategories && newTab.subCategories.length > 0) {
        sub.value = newTab.subCategories[0];
        getBetItems(sub.value.id);
    }
});

onMounted(() => {
    getCategories();
});

</script>