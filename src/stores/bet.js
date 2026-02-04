import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
    state: () => ({
        carts: JSON.parse(localStorage.getItem('_carts_')) || [],
    }),
    actions: {
        setCarts(payload) {
            this.carts = payload;
            localStorage.setItem('_carts_', JSON.stringify(this.carts));
        },
        removeCart(index) {
            this.carts.splice(index, 1);
            localStorage.setItem('_carts_', JSON.stringify(this.carts));
        },
        clearCarts() {
            this.carts = [];
            localStorage.removeItem('_carts_');
        }
    },
    getters: {
        getCarts: (state) => state.carts,
    },
})