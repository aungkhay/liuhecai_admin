import { defineStore } from 'pinia'
import { orderZodiac } from '../js/common';

export const useZodiacStore = defineStore('zodiac', {
    state: () => ({
        currentYear: '',
        currentZodiac: '',
        zodiacYears: [
            { animal: "rat", from_date: "2020-01-25", to_date: "2021-02-11" },
            { animal: "ox", from_date: "2021-02-12", to_date: "2022-01-31" },
            { animal: "tiger", from_date: "2022-02-01", to_date: "2023-01-21" },
            { animal: "rabbit", from_date: "2023-01-22", to_date: "2024-02-09" },
            { animal: "dragon", from_date: "2024-02-10", to_date: "2025-01-28" },
            { animal: "snake", from_date: "2025-01-29", to_date: "2026-02-16" },
            { animal: "horse", from_date: "2026-02-17", to_date: "2027-02-05" },
            { animal: "goat", from_date: "2027-02-06", to_date: "2028-01-25" },
            { animal: "monkey", from_date: "2028-01-26", to_date: "2029-02-12" },
            { animal: "rooster", from_date: "2029-02-13", to_date: "2030-02-02" },
            { animal: "dog", from_date: "2030-02-03", to_date: "2031-01-22" }
        ],
        zodiacPerYear: {},
        xZodiacs: [
            { id: 1, name: '鼠', key: 'rat' },
            { id: 2, name: '牛', key: 'ox' },
            { id: 3, name: '虎', key: 'tiger' },
            { id: 4, name: '兔', key: 'rabbit' },
            { id: 5, name: '龙', key: 'dragon' },
            { id: 6, name: '蛇', key: 'snake' },
            { id: 7, name: '马', key: 'horse' },
            { id: 8, name: '羊', key: 'goat' },
            { id: 9, name: '猴', key: 'monkey' },
            { id: 10, name: '鸡', key: 'rooster' },
            { id: 11, name: '狗', key: 'dog' },
            { id: 12, name: '猪', key: 'pig' }
        ],
        xComparisons: [
            { id: 1, numbers: [1, 13, 25, 37, 49] },
            { id: 2, numbers: [2, 14, 26, 38] },
            { id: 3, numbers: [3, 15, 27, 39] },
            { id: 4, numbers: [4, 16, 28, 40] },
            { id: 5, numbers: [5, 17, 29, 41] },
            { id: 6, numbers: [6, 18, 30, 42] },
            { id: 7, numbers: [7, 19, 31, 43] },
            { id: 8, numbers: [8, 20, 32, 44] },
            { id: 9, numbers: [9, 21, 33, 45] },
            { id: 10, numbers: [10, 22, 34, 46] },
            { id: 11, numbers: [11, 23, 35, 47] },
            { id: 12, numbers: [12, 24, 36, 48] }
        ],
        xNumbers: [
            { id: 1, num: "01", wuxing: "火", color: "red", old_even: "odd" },
            { id: 2, num: "02", wuxing: "火", color: "red", old_even: "even" },
            { id: 3, num: "03", wuxing: "金", color: "blue", old_even: "odd" },
            { id: 4, num: "04", wuxing: "金", color: "blue", old_even: "even" },
            { id: 5, num: "05", wuxing: "土", color: "green", old_even: "odd" },
            { id: 6, num: "06", wuxing: "土", color: "green", old_even: "even" },
            { id: 7, num: "07", wuxing: "木", color: "red", old_even: "odd" },
            { id: 8, num: "08", wuxing: "木", color: "red", old_even: "even" },
            { id: 9, num: "09", wuxing: "火", color: "blue", old_even: "odd" },
            { id: 10, num: "10", wuxing: "火", color: "blue", old_even: "odd" },
            { id: 11, num: "11", wuxing: "金", color: "green", old_even: "even" },
            { id: 12, num: "12", wuxing: "金", color: "red", old_even: "odd" },
            { id: 13, num: "13", wuxing: "水", color: "red", old_even: "even" },
            { id: 14, num: "14", wuxing: "水", color: "blue", old_even: "odd" },
            { id: 15, num: "15", wuxing: "木", color: "blue", old_even: "even" },
            { id: 16, num: "16", wuxing: "木", color: "green", old_even: "odd" },
            { id: 17, num: "17", wuxing: "火", color: "green", old_even: "even" },
            { id: 18, num: "18", wuxing: "火", color: "red", old_even: "odd" },
            { id: 19, num: "19", wuxing: "土", color: "red", old_even: "even" },
            { id: 20, num: "20", wuxing: "土", color: "blue", old_even: "even" },
            { id: 21, num: "21", wuxing: "水", color: "green", old_even: "odd" },
            { id: 22, num: "22", wuxing: "水", color: "green", old_even: "even" },
            { id: 23, num: "23", wuxing: "木", color: "red", old_even: "odd" },
            { id: 24, num: "24", wuxing: "木", color: "red", old_even: "even" },
            { id: 25, num: "25", wuxing: "金", color: "blue", old_even: "odd" },
            { id: 26, num: "26", wuxing: "金", color: "blue", old_even: "even" },
            { id: 27, num: "27", wuxing: "土", color: "green", old_even: "odd" },
            { id: 28, num: "28", wuxing: "土", color: "green", old_even: "even" },
            { id: 29, num: "29", wuxing: "水", color: "red", old_even: "odd" },
            { id: 30, num: "30", wuxing: "水", color: "red", old_even: "odd" },
            { id: 31, num: "31", wuxing: "火", color: "blue", old_even: "even" },
            { id: 32, num: "32", wuxing: "火", color: "green", old_even: "odd" },
            { id: 33, num: "33", wuxing: "金", color: "green", old_even: "even" },
            { id: 34, num: "34", wuxing: "金", color: "red", old_even: "odd" },
            { id: 35, num: "35", wuxing: "土", color: "red", old_even: "even" },
            { id: 36, num: "36", wuxing: "土", color: "blue", old_even: "odd" },
            { id: 37, num: "37", wuxing: "木", color: "blue", old_even: "even" },
            { id: 38, num: "38", wuxing: "木", color: "green", old_even: "odd" },
            { id: 39, num: "39", wuxing: "火", color: "green", old_even: "even" },
            { id: 40, num: "40", wuxing: "火", color: "red", old_even: "even" },
            { id: 41, num: "41", wuxing: "金", color: "blue", old_even: "odd" },
            { id: 42, num: "42", wuxing: "金", color: "blue", old_even: "even" },
            { id: 43, num: "43", wuxing: "水", color: "green", old_even: "odd" },
            { id: 44, num: "44", wuxing: "水", color: "green", old_even: "even" },
            { id: 45, num: "45", wuxing: "木", color: "red", old_even: "odd" },
            { id: 46, num: "46", wuxing: "木", color: "red", old_even: "even" },
            { id: 47, num: "47", wuxing: "火", color: "blue", old_even: "odd" },
            { id: 48, num: "48", wuxing: "火", color: "blue", old_even: "even" },
            { id: 49, num: "49", wuxing: "土", color: "green", old_even: "odd" }
        ],
        xAttributes: [
            { attribute_name: "家禽", zodiacs: ["牛","马","羊","鸡","狗","猪"] },
            { attribute_name: "野兽", zodiacs: ["鼠","虎","兔","龙","蛇","猴"] },
            { attribute_name: "吉美", zodiacs: ["兔","龙","蛇","马","羊","鸡"] },
            { attribute_name: "凶丑", zodiacs: ["鼠","牛","虎","猴","狗","猪"] },
            { attribute_name: "阴肖", zodiacs: ["鼠","龙","蛇","马","狗","猪"] },
            { attribute_name: "阳肖", zodiacs: ["牛","虎","兔","羊","猴","鸡"] },
            { attribute_name: "单笔", zodiacs: ["鼠","龙","马","蛇","鸡","猪"] },
            { attribute_name: "双笔", zodiacs: ["虎","猴","狗","兔","羊","牛"] },
            { attribute_name: "天肖", zodiacs: ["兔","马","猴","猪","牛","龙"] },
            { attribute_name: "地肖", zodiacs: ["蛇","羊","鸡","狗","鼠","虎"] },
            { attribute_name: "白肖", zodiacs: ["鼠","牛","虎","鸡","狗","猪"] },
            { attribute_name: "黑肖", zodiacs: ["兔","龙","蛇","马","羊","猴"] },
            { attribute_name: "女肖", zodiacs: ["兔","蛇","羊","鸡","猪"] },
            { attribute_name: "男肖", zodiacs: ["鼠","牛","虎","龙","马","猴","狗"] },
            { attribute_name: "琴肖", zodiacs: ["兔","蛇","鸡"] },
            { attribute_name: "棋肖", zodiacs: ["鼠","牛","狗"] },
            { attribute_name: "书肖", zodiacs: ["虎","龙","马"] },
            { attribute_name: "画肖", zodiacs: ["羊","猴","猪"] },
            { attribute_name: "五福", zodiacs: ["鼠","虎","兔","蛇","猴","龙"] },
            { attribute_name: "红肖", zodiacs: ["马","兔","鼠","鸡"] },
            { attribute_name: "蓝肖", zodiacs: ["蛇","虎","猪","猴"] },
            { attribute_name: "绿肖", zodiacs: ["羊","龙","牛","狗"] },
            { attribute_name: "文肖", zodiacs: ["鼠","兔","龙","羊","鸡","猪"] },
            { attribute_name: "武肖", zodiacs: ["牛","虎","蛇","马","猴","狗"] },
            { attribute_name: "前肖", zodiacs: ["鼠","牛","虎","兔","龙","蛇"] },
            { attribute_name: "后肖", zodiacs: ["马","羊","猴","鸡","狗","猪"] },
            { attribute_name: "吴国", zodiacs: ["虎","兔","龙","蛇"] },
            { attribute_name: "蜀国", zodiacs: ["马","羊","猴","鸡"] },
            { attribute_name: "魏国", zodiacs: ["鼠","牛","狗","猪"] },
            { attribute_name: "独肖", zodiacs: ["鼠","牛","虎","兔","马","羊"] },
            { attribute_name: "合肖", zodiacs: ["龙","蛇","猴","鸡","狗","猪"] },
            { attribute_name: "春肖", zodiacs: ["兔","虎","龙"] },
            { attribute_name: "夏肖", zodiacs: ["羊","蛇","马"] },
            { attribute_name: "秋肖", zodiacs: ["狗","鸡","猴"] },
            { attribute_name: "冬肖", zodiacs: ["猪","牛","鼠"] },
            { attribute_name: "胆大", zodiacs: ["牛","虎","马","猴","狗","猪"] },
            { attribute_name: "胆小", zodiacs: ["鼠","兔","龙","蛇","羊","鸡"] },
            { attribute_name: "三合1", zodiacs: ["鼠","龙","猴"] },
            { attribute_name: "三合2", zodiacs: ["牛","蛇","鸡"] },
            { attribute_name: "三合3", zodiacs: ["虎","马","狗"] },
            { attribute_name: "三合4", zodiacs: ["兔","羊","猪"] },
            { attribute_name: "六合1", zodiacs: ["鼠","牛"] },
            { attribute_name: "六合2", zodiacs: ["龙","鸡"] },
            { attribute_name: "六合3", zodiacs: ["虎","猪"] },
            { attribute_name: "六合4", zodiacs: ["蛇","猴"] },
            { attribute_name: "六合5", zodiacs: ["兔","狗"] },
            { attribute_name: "六合6", zodiacs: ["马","羊"] },
            { attribute_name: "大肖", zodiacs: ["牛","虎","马","羊","狗","猪"] },
            { attribute_name: "小肖", zodiacs: ["鼠","兔","龙","蛇","猴","鸡"] },
            { attribute_name: "1号汉奸汪精卫", zodiacs: ["猪","狗","鼠"] },
            { attribute_name: "2号汉奸陈公博", zodiacs: ["牛","虎","蛇"] },
            { attribute_name: "3号汉奸周佛海", zodiacs: ["马","兔","羊"] },
            { attribute_name: "4号汉奸梁鸿志", zodiacs: ["龙","鸡","猴"] }
        ]
    }),
    actions: {
        setCurrentYear() {
            const currentDate = new Date();
            const currentYearData = this.zodiacYears.find(y => {
                const fromDate = new Date(y.from_date);
                const toDate = new Date(y.to_date);
                return currentDate >= fromDate && currentDate <= toDate;
            });
            if (currentYearData) {
                this.currentYear = parseInt(currentYearData.from_date.split('-')[0]);
                this.currentZodiac = currentYearData.animal;
            }
            console.log('Current Year:', this.currentYear);
            console.log('Current Zodiac:', this.currentZodiac);
        },

        orderZodiac() {
            const zodiacList = [];
            const currentZodiac = this.xZodiacs.find(z => z.key == this.currentZodiac);
            const arr = orderZodiac(currentZodiac.id);
            for (let i = 0; i < arr.length; i++) {
                const zodiacId = arr[i];
                const zodiac = this.xZodiacs.find(z => z.id == zodiacId);
                const comparison = this.xComparisons.find(c => c.id == i + 1);
                const obj = {
                    id: zodiac.id,
                    name: zodiac.name,
                    key: zodiac.key,
                    numbers: [],
                }
                comparison.numbers.forEach(num => {
                    const index = this.xNumbers.findIndex(n => n.id === num);
                    if (index !== -1) {
                        obj.numbers.push(this.xNumbers[index]);
                    }
                });
                zodiacList.push(obj);
            }
            this.zodiacPerYear = { [`${this.currentYear}`]: zodiacList }
        },
    },
    getters: {
        getNumbers: (state) => state.xNumbers,
        getZodiacs: (state) => state.xZodiacs,
        getComparisons: (state) => state.xComparisons,
        getCurrentYear: (state) => state.currentYear,
        getCurrentZodiac: (state) => state.currentZodiac,
        getOrderedZodiacs: (state) => state.zodiacPerYear[state.currentYear],
        getZodiacYears: (state) => state.zodiacYears,
        getWuXingNumbers: (state) => {
            return {
                jin: state.xNumbers.filter(num => num.wuxing === '金').map(n => { return { num: n.num, color: n.color } }),
                mu: state.xNumbers.filter(num => num.wuxing === '木').map(n => { return { num: n.num, color: n.color } }),
                shui: state.xNumbers.filter(num => num.wuxing === '水').map(n => { return { num: n.num, color: n.color } }),
                huo: state.xNumbers.filter(num => num.wuxing === '火').map(n => { return { num: n.num, color: n.color } }),
                tu: state.xNumbers.filter(num => num.wuxing === '土').map(n => { return { num: n.num, color: n.color } }),
            }
        },
        getColorNumbers: (state) => {
            return {
                red: state.xNumbers.filter(num => num.color === 'red').map(n => n.num),
                blue: state.xNumbers.filter(num => num.color === 'blue').map(n => n.num),
                green: state.xNumbers.filter(num => num.color === 'green').map(n => n.num),
            }
        },
        getOddEvenNumbers: (state) => {
            return {
                odd: state.xNumbers.filter(n => n.old_even == 'odd').map(n => { return { num: n.num, color: n.color } }),
                even: state.xNumbers.filter(n => n.old_even == 'even').map(n => { return { num: n.num, color: n.color } }),
            }
        },
        getXAttributes: (state) => state.xAttributes,
    }
})