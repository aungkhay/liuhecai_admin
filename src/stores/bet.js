import { defineStore } from 'pinia'
import { useZodiacStore } from './zodiac';
import { orderZodiac } from '../js/common';

const addRulePrefix = (key, obj) => {
    const resetObj = {}
    for (const k in obj) {
        resetObj[`${key}_${k}`] = obj[k];
    }
    return resetObj;
}
const RED = [1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46];
const BLUE = [3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48];
const GREEN = [5,6,11,16,17,21,22,27,28,32,33,38,39,43,44,49];
const isOdd = n => n % 2 === 1;
const isEven = n => n % 2 === 0;
const isBig = n => n >= 25;
const isSmall = n => n <= 24;
const sumDigits = (n) => n.toString().split('').reduce((a, b) => a + Number(b), 0);

export const useCartStore = defineStore('cart', {
    state: () => ({
        carts: JSON.parse(localStorage.getItem('_carts_')) || [],
        added_to_cart: false,
        ordered_zodiac: {},
        TM_WX_RULES: {
            TM_WX_JIN: [3, 4, 11, 12, 25, 26, 33, 34, 41, 42],
            TM_WX_MU: [7, 8, 13, 14, 17, 18, 23, 24, 27, 28],
            TM_WX_SHUI: [2, 3, 6, 7, 8, 12, 13, 17, 18, 22, 23, 27, 28],
            TM_WX_HUO: [1, 6, 9, 10, 15, 16, 19, 20, 21, 26, 29, 30, 33, 34, 37, 38, 39, 40],
            TM_WX_TU: [5, 6, 11, 12, 25, 26, 35, 36, 45, 46, 49],
        },
    }),
    actions: {
        setCarts(payload) {
            this.carts = payload;
            localStorage.setItem('_carts_', JSON.stringify(this.carts));
            this.added_to_cart = true;
            setTimeout(() => {
                this.added_to_cart = false;
            }, 500);
        },
        removeCart(index) {
            this.carts.splice(index, 1);
            localStorage.setItem('_carts_', JSON.stringify(this.carts));
        },
        clearCarts() {
            this.carts = [];
            localStorage.removeItem('_carts_');
            this.added_to_cart = false;
        },
        updateCart(code, betAmount) {
            const cart = this.carts.find(c => c.code === code);
            if (cart) {
                cart.betAmount = betAmount;
                localStorage.setItem('_carts_', JSON.stringify(this.carts));
            }
        },
        orderedZodiac() {
            const zodiacStore = useZodiacStore();
            const zodiac = zodiacStore.getZodiacs;
            const years = zodiacStore.getZodiacYears;
            const comparisons = zodiacStore.getComparisons;
            const numbers = zodiacStore.getNumbers;

            const currentDate = new Date();
            const yearData = years.find(y => {
                const fromDate = new Date(y.from_date);
                const toDate = new Date(y.to_date);
                return currentDate >= fromDate && currentDate <= toDate;
            });
            const animal = yearData.animal;

            const currentZodiac = zodiac.find(z => z.key == animal);
            const arr = orderZodiac(currentZodiac.id);
            for (let i = 0; i < arr.length; i++) {
                const zodiacId = arr[i];
                const z = zodiac.find(z => z.id == zodiacId);
                const comparison = comparisons.find(c => c.id == i + 1);
                
                comparison.numbers.forEach(num => {
                    const index = numbers.findIndex(n => n.id === num);
                    if (index !== -1) {
                        if (!this.ordered_zodiac[z.code]) {
                            this.ordered_zodiac[z.code] = [];
                        }
                        this.ordered_zodiac[z.code].push(numbers[index].id);
                    }
                });
            }
        }
    },
    getters: {
        getCarts: (state) => state.carts,
        getAddedToCart: (state) => state.added_to_cart,
        get_TM_SM_RULES: (state) => {
            const numbers = Array.from({ length: 28 }, (_, i) => i + 1);
            
            return {
                TM_SM_DA: numbers.filter(n => n <= 14),
                TM_SM_XIAO: numbers.filter(n => n > 14),

                TM_SM_DAN: numbers.filter(n => n % 2 === 1),
                TM_SM_SHUANG: numbers.filter(n => n % 2 === 0),

                TM_SM_HEDA: numbers.filter(n => sumDigits(n) >= 10),
                TM_SM_HEXIAO: numbers.filter(n => sumDigits(n) <= 9),

                TM_SM_HEDAN: numbers.filter(n => sumDigits(n) % 2 === 1),
                TM_SM_HESHUANG: numbers.filter(n => sumDigits(n) % 2 === 0),

                TM_SM_TIANXIAO: numbers.filter(n => (n - 1) % 4 === 0),
                TM_SM_DIXIAO: numbers.filter(n => (n - 2) % 4 === 0),
                TM_SM_QIANXIAO: numbers.filter(n => (n - 3) % 4 === 0),
                TM_SM_HOUXIAO: numbers.filter(n => n % 4 === 0),

                TM_SM_JIAXIAO: numbers.filter(n => (n - 5) % 4 === 0),
                TM_SM_YEXIAO: numbers.filter(n => (n - 6) % 4 === 0),

                TM_SM_WEIDA: numbers.filter(n => n % 10 >= 5),
                TM_SM_WEIXIAO: numbers.filter(n => n % 10 <= 4),

                TM_SM_DADAN: numbers.filter(n => n <= 14 && n % 2 === 1),
                TM_SM_DASHUANG: numbers.filter(n => n <= 14 && n % 2 === 0),

                TM_SM_XIAODAN: numbers.filter(n => n > 14 && n % 2 === 1),
                TM_SM_XIAOSHUANG: numbers.filter(n => n > 14 && n % 2 === 0),
            }
        },
        get_TM_SBB_RULES: (state) => {
            const colors = {
                HONG: RED,
                LAN: BLUE,
                LV: GREEN
            };
            const newObject = {};
            for (const colorName in colors) {
                if (!Object.hasOwn(colors, colorName)) continue;
                
                const numbers = colors[colorName];
                newObject[`TM_SBB_${colorName}_DAN`] = numbers.filter(isOdd);
                newObject[`TM_SBB_${colorName}_SHUANG`] = numbers.filter(isEven);

                newObject[`TM_SBB_${colorName}_DA`] = numbers.filter(isBig);
                newObject[`TM_SBB_${colorName}_XIAO`] = numbers.filter(isSmall);

                newObject[`TM_SBB_${colorName}_DA_DAN`] = numbers.filter(n => isBig(n) && isOdd(n));
                newObject[`TM_SBB_${colorName}_DA_SHUANG`] = numbers.filter(n => isBig(n) && isEven(n));

                newObject[`TM_SBB_${colorName}_XIAO_DAN`] = numbers.filter(n => isSmall(n) && isOdd(n));
                newObject[`TM_SBB_${colorName}_XIAO_SHUANG`] = numbers.filter(n => isSmall(n) && isEven(n));
            }

            return {
                TM_SBB_HONG: RED,
                TM_SBB_LAN: BLUE,
                TM_SBB_LV: GREEN,
                ...newObject
            }
        },
        get_TM_TXTWS_RULES: (state) => {
            const TM_TXTWS = addRulePrefix('TM_TXTWS', state.ordered_zodiac);
            const numbers = Array.from({ length: 49 }, (_, i) => i + 1);
            const rules = {};
            // 头 (tens digit)
            for (let i = 0; i <= 4; i++) {
                rules[`TM_TXTWS_${i}TOU`] = numbers.filter(n => Math.floor(n / 10) === i);
            }
            // 尾 (last digit)
            for (let i = 0; i <= 9; i++) {
                rules[`TM_TXTWS_${i}WEI`] = numbers.filter(n => n % 10 === i);
            }
            return {
                ...TM_TXTWS,
                ...rules,
            }
        },
        get_TM_HX_RULES: (state) => {
            const TM_HX = addRulePrefix('TM_HX', state.ordered_zodiac);
            return {
                ...TM_HX,
            }
        },
        get_TM_WX_RULES: (state) => state.TM_WX_RULES,
        get_ZM_ZM16_RULES: (state) => {
            const numbers = Array.from({ length: 49 }, (_, i) => i + 1);

            const obj = {};
            const DAN = numbers.filter(isOdd);
            const SHUANG = numbers.filter(isEven);
            const DA = numbers.filter(isBig);
            const XIAO = numbers.filter(isSmall);
            const HEDAN = numbers.filter(n => sumDigits(n) % 2 === 1);
            const HESHUANG = numbers.filter(n => sumDigits(n) % 2 === 0);
            const HEDA = numbers.filter(n => sumDigits(n) >= 7);
            const HEXIAO = numbers.filter(n => sumDigits(n) <= 6);
            const WEIDA = numbers.filter(n => n > 24);
            const WEIXIAO = numbers.filter(n => n <= 24);

            for (let i = 1; i < 7; i++) {
                // DAN,SHUANG,DA,XIAO,HEDAN,HESHUANG,HEDA,HEXIAO,WEIDA,WEIXIAO,HONG,LAN,LV
                obj[`ZM_ZM16_${i}_DAN`] = DAN;
                obj[`ZM_ZM16_${i}_SHUANG`] = SHUANG;
                obj[`ZM_ZM16_${i}_DA`] = DA;
                obj[`ZM_ZM16_${i}_XIAO`] = XIAO;
                obj[`ZM_ZM16_${i}_HEDAN`] = HEDAN;
                obj[`ZM_ZM16_${i}_HESHUANG`] = HESHUANG;
                obj[`ZM_ZM16_${i}_HEDA`] = HEDA;
                obj[`ZM_ZM16_${i}_HEXIAO`] = HEXIAO;
                obj[`ZM_ZM16_${i}_WEIDA`] = WEIDA;
                obj[`ZM_ZM16_${i}_WEIXIAO`] = WEIXIAO;
                obj[`ZM_ZM16_${i}_HONG`] = RED;
                obj[`ZM_ZM16_${i}_LAN`] = BLUE;
                obj[`ZM_ZM16_${i}_LV`] = GREEN;
            }
            return obj;
        },
        get_ZM_ZXQSB_RULES: (state) => {
            const ZM_ZXQSB = addRulePrefix('ZM_ZXQSB', state.ordered_zodiac);
            return {
                ...ZM_ZXQSB,
                ZM_ZXQSB_HONG: RED,
                ZM_ZXQSB_LAN: BLUE,
                ZM_ZXQSB_LV: GREEN.filter(n => n != 49),
                ZM_ZXQSB_HE: [49],
            }
        },
        get_LXLW_RULES: (state) => {
            let obj = {};
            for (let i = 2; i <= 5; i++) {
                const LXLW = addRulePrefix(`LXLW_${i}LX`, state.ordered_zodiac);
                obj = {
                    ...obj,
                    ...LXLW,
                }
            }
            const numbers = Array.from({ length: 49 }, (_, i) => i + 1);
            for (let i = 2; i <= 5; i++) {
                for (let j = 0; j <= 9; j++) {
                    obj[`LXLW_${i}LW_${j}`] = numbers.filter(n => n % 10 === j);
                }
            }
            return obj;
        },
        get_YXZXPTWS_RULES: (state) => {
            let obj = {};
            const YXZXPTWS_YX = addRulePrefix(`YXZXPTWS_YX`, state.ordered_zodiac);
            obj = {
                ...YXZXPTWS_YX
            }
            const numbers = Array.from({ length: 49 }, (_, i) => i + 1);
            for (let j = 0; j <= 9; j++) {
                obj[`YXZXPTWS_WS_${j}`] = numbers.filter(n => n % 10 === j);
            }
            return obj;
        },
        get_ZH_RULES: (state) => {
            const numbers = Array.from({ length: 49 }, (_, i) => i + 1);
            const obj = {
                ZH_DA: numbers.filter(isBig),
                ZH_XIAO: numbers.filter(isSmall),
                ZH_DAN: numbers.filter(isOdd),
                ZH_SHUANG: numbers.filter(isEven),
                // 大(无和)
                ZH_DA_WH: numbers.filter(n => n >= 25 && n != 49),
                // 小(无和)
                ZH_XIAO_WH: numbers.filter(n => n <= 24 && n != 49),
                // ZH_DAN_WH
                ZH_DAN_WH: numbers.filter(n => n % 2 === 1 && n != 49),
                // ZH_SHUANG_WH
                ZH_SHUANG_WH: numbers.filter(n => n % 2 === 0 && n != 49),
            }
            return obj;
        }
    },
})