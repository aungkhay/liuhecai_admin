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
        <div v-if="sub?.code != 'ZXBZ' && sub?.limit_bet_count > 1" class="text-primary text-center">
            至少选择 {{ sub.limit_bet_count }} 项
        </div>
        <div v-if="sub?.code == 'ZXBZ'" class="text-primary text-center">
            至少选择 {{ sub.limit_bet_count }}~9 项
        </div>
        <div v-if="sub" class="border rounded pa-2">
            <TM_SM v-if="sub.code === 'TM_SM'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <TM_HM v-if="sub.code === 'TM_HM'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <TM_SBB v-if="sub.code === 'TM_SBB'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <TM_TXTWS v-if="sub.code === 'TM_TXTWS'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <TM_HX v-if="sub.code === 'TM_HX'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <TM_WX v-if="sub.code === 'TM_WX'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <ZM_RX1 v-if="sub.code === 'ZM_RX1'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <ZM_ZM16 v-if="sub.code === 'ZM_ZM16'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <ZM_ZXQSB v-if="sub.code === 'ZM_ZXQSB'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <ZMT v-if="['ZMT_Z1T', 'ZMT_Z2T', 'ZMT_Z3T', 'ZMT_Z4T', 'ZMT_Z5T', 'ZMT_Z6T'].includes(sub.code)" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <LX v-if="['LXLW_2LX', 'LXLW_3LX', 'LXLW_4LX', 'LXLW_5LX'].includes(sub.code)" :items="items" :betAmount="betAmount" :sub="sub" @update:selected-items="updateSelectedItems" />
            <LW v-if="['LXLW_2LW', 'LXLW_3LW', 'LXLW_4LW', 'LXLW_5LW'].includes(sub.code)" :items="items" :betAmount="betAmount" :sub="sub" @update:selected-items="updateSelectedItems" />
            <LM v-if="['LM_3Z2', 'LM_3QZ', 'LM_2QZ', 'LM_2ZT', 'LM_TC', 'LM_4QZ'].includes(sub.code)" :items="items" :betAmount="betAmount" :sub="sub" @update:selected-items="updateSelectedItems" />
            <YXZXPTWS_YX v-if="sub.code === 'YXZXPTWS_YX'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <YXZXPTWS_ZX v-if="sub.code === 'YXZXPTWS_ZX'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <YXZXPTWS_PTWS v-if="sub.code === 'YXZXPTWS_PTWS'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <ZH v-if="sub.code === 'ZH'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <ZX v-if="sub.code === 'ZX'" :items="items" :betAmount="betAmount" @update:selected-items="updateSelectedItems" />
            <ZXBZ v-if="sub.code === 'ZXBZ'" :items="items" :betAmount="betAmount" :sub="sub" @update:selected-items="updateSelectedItems" />
        </div>

        <div class="mt-5">
            <div v-if="!['TM_HX','ZXBZ'].includes(sub?.code) && sub?.odds">
                <div v-for="(odds, key) in sub.odds" :key="key" class="d-flex align-center text-caption mb-1">
                    <div class="mr-2">{{ oddsMap[key] }} :</div>
                    <div>{{ sub.odds[key] }}</div>
                </div>
            </div>
            <div v-if="sub?.code == 'ZXBZ'" class="d-flex align-center text-caption mb-1">
                <div>赔率: </div>
                <div class="ml-2">{{ sub?.odds[`${selectedItems.length}BZ`] }}</div>
            </div>
            <div v-if="sub?.code == 'TM_HX'" class="d-flex align-center text-caption mb-1">
                <div>赔率: </div>
                <div class="ml-2">
                    <div v-if="selectedItems.length == 2">{{ sub?.odds['2HX'] }}</div>
                    <div v-if="selectedItems.length == 3">{{ sub?.odds['3HX'] }}</div>
                    <div v-if="selectedItems.length == 4">{{ sub?.odds['4HX'] }}</div>
                    <div v-if="selectedItems.length == 5">{{ sub?.odds['5HX'] }}</div>
                    <div v-if="selectedItems.length == 6">{{ sub?.odds['6HX'] }}</div>
                    <div v-if="selectedItems.length == 7">{{ sub?.odds['7HX'] }}</div>
                    <div v-if="selectedItems.length == 8">{{ sub?.odds['8HX'] }}</div>
                    <div v-if="selectedItems.length == 9">{{ sub?.odds['9HX'] }}</div>
                    <div v-if="selectedItems.length == 10">{{ sub?.odds['10HX'] }}</div>
                    <div v-if="selectedItems.length == 11">{{ sub?.odds['11HX'] }}</div>
                </div>
            </div>
            <div class="d-flex align-center">
                <div class="d-flex flex-column">
                    <v-btn-group variant="outlined" divided>
                        <v-btn size="small" @click="betAmount = 1" :color="betAmount == 1 ? 'primary' : 'default'">1</v-btn>
                        <v-btn size="small" @click="betAmount = 5" :color="betAmount == 5 ? 'primary' : 'default'">5</v-btn>
                        <v-btn size="small" @click="betAmount = 10" :color="betAmount == 10 ? 'primary' : 'default'">10</v-btn>
                        <v-btn size="small" @click="betAmount = 50" :color="betAmount == 50 ? 'primary' : 'default'">50</v-btn>
                        <v-btn size="small" @click="betAmount = 100" :color="betAmount == 100 ? 'primary' : 'default'">100</v-btn>
                    </v-btn-group>
                </div>
                <div style="width: 100px;" class="ml-1">
                    <v-text-field
                        v-model="betAmount"
                        label="投注金额"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="mt-1"
                    ></v-text-field>
                </div>
                <div class="d-flex flex-column ml-1" v-if="checkPermission('bet-do-bet')">
                    <v-btn-group variant="outlined" divided>
                        <v-btn size="small" @click="addToCart" :disabled="selectedItems.length < sub?.limit_bet_count || (sub?.code === 'ZXBZ' && selectedItems.length > 9)">加入 <v-icon>mdi-forward</v-icon></v-btn>
                        <v-btn size="small" @click="showCart = true">购彩蓝 <span class="text-red mt-1 font-weight-bold">{{ carts.length }}</span></v-btn>
                    </v-btn-group>
                </div>
            </div>
        </div>
        <Cart :dialog="showCart" @update:dialog="val => showCart = val" :isSaving="isSaving" @doBet="doBet" />
    </div>
</template>

<script setup>
import { computed, onMounted, ref, shallowRef, watch } from 'vue';
import { GET_BET_CATEGORIES, GET_BET_ITEMS, DO_BET } from '../js/api';
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
import { useCartStore } from '../stores/bet';
import Cart from '../components/Cart.vue';
import { useToast } from 'vue-toastification';
import { combinations } from '../js/common';
import { checkPermission } from '../js/common';

const toast = useToast();
const cartStore = useCartStore();
const carts = computed(() => cartStore.getCarts);

const categories = ref([]);
const tab = shallowRef(null);
const sub = ref(null);
const items = ref([]);
const betAmount = ref(10);
const selectedItems = ref([]);
const showCart = ref(false);
const oddsMap = ref({
    Z2: '中二',
    Z3: '中三',
    ZT: '中特',
    TC: '特串',
    '2QZ': '二全中',
    '3QZ': '三全中',
    '4QZ': '四全中',
    '2HX': '2肖',
    '3HX': '3肖',
    '4HX': '4肖',
    '5HX': '5肖',
    '6HX': '6肖',
    '7HX': '7肖',
    '8HX': '8肖',
    '9HX': '9肖',
    '10HX': '10肖',
    '11HX': '11肖',
});
const isSaving = ref(false);
const groupCombinations = ref([]);

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

const updateSelectedItems = (newSelectedItems, newGroupCombinations = []) => {
    selectedItems.value = [];
    selectedItems.value = newSelectedItems;
    groupCombinations.value = newGroupCombinations;
};

const addToCart = () => {
    const data = [];
    // const noInputItems = [
    //     'TM_HX', 
    //     'LXLW_2LX', 'LXLW_3LX', 'LXLW_4LX', 'LXLW_5LX', 'LXLW_2LW', 'LXLW_3LW', 'LXLW_4LW', 'LXLW_5LW',
    //     'LM_3Z2', 'LM_3QZ', 'LM_2QZ', 'LM_2ZT', 'LM_TC', 'LM_4QZ', 
    //     'ZXBZ'
    // ];
    if (groupCombinations.value.length) {
        for (const com of groupCombinations.value) {
            let itemName = '';
            let itemCode = '';
            let odds = 0;
            com.forEach(item => {
                itemName += item.name + ',';
                itemCode += item.code + ',';
                
                if (sub.value.code === 'TM_HX') {
                    odds = sub.value.odds[`${selectedItems.value.length}HX`];
                } else if (['LM_3Z2', 'LM_3QZ', 'LM_2QZ', 'LM_2ZT', 'LM_TC', 'LM_4QZ'].includes(sub.value.code)) {
                    if (sub.value.code === 'LM_3Z2') {
                        odds = sub.value.odds['Z3'];
                    } else if (sub.value.code === 'LM_3QZ') {
                        odds = sub.value.odds['3QZ'];
                    } else if (sub.value.code === 'LM_2QZ') {
                        odds = sub.value.odds['2QZ'];
                    } else if (sub.value.code === 'LM_2ZT') {
                        odds = sub.value.odds['Z2'];
                    } else if (sub.value.code === 'LM_TC') {
                        odds = sub.value.odds['TC'];
                    } else if (sub.value.code === 'LM_4QZ') {
                        odds = sub.value.odds['4QZ'];
                    }
                } else if (['LXLW_2LX', 'LXLW_3LX', 'LXLW_4LX', 'LXLW_5LX', 'LXLW_2LW', 'LXLW_3LW', 'LXLW_4LW', 'LXLW_5LW'].includes(sub.value.code)) {
                    odds = selectedItems.value.length > 0 ? selectedItems.value[0].odds : 0;
                } else if (sub.value.code === 'ZXBZ') {
                    odds = sub.value.odds[`${selectedItems.value.length}BZ`];
                }
            });
            data.push({
                categoryId: tab.value.id,
                categoryName: tab.value.name,
                subCategoryId: sub.value.id,
                subCategoryName: sub.value.name,
                name: itemName.slice(0, -1),
                code: itemCode.slice(0, -1),
                odds: odds,
                betAmount: betAmount.value,
            });
        }
    } else {
        selectedItems.value.forEach(item => {
            // check code exists in cart
            const exists = cartStore.getCarts.find(c => c.code === item.code);
            if (exists) {
                // increase betAmount
                cartStore.updateCart(item.code, Number(exists.betAmount) + Number(betAmount.value));
                return;
            }

            data.push({
                categoryId: tab.value.id,
                categoryName: tab.value.name,
                subCategoryId: sub.value.id,
                subCategoryName: sub.value.name,
                name: item.name,
                code: item.code,
                odds: item.odds,
                betAmount: item.betAmount,
            });
        });
    }
    
    cartStore.setCarts([...cartStore.getCarts, ...data]);

    // reset input empty
    selectedItems.value.forEach(item => {
        item.betAmount = '';
    });
};

const doBet = async (data) => {
    if (isSaving.value) return;

    isSaving.value = true;
    try {
        const res = await DO_BET({ bets: data});
        if (res && res.code == 1000) {
            cartStore.clearCarts();
            showCart.value = false;
            toast.success('下注成功');
        } else if (res.code == 1002) {
            res.errors.forEach(err => {
                toast.error(err.msg);
            });
        } else {
            toast.error(res.message || '投注失败');
        }
    } catch (error) {
        console.error('Betting failed:', error);
    } finally {
        isSaving.value = false;
    }
};

onMounted(() => {
    getCategories();
});

</script>