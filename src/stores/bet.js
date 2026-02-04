import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
    state: () => ({
        carts: JSON.parse(localStorage.getItem('_carts_')) || [],
        added_to_cart: false,
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
        }
    },
    getters: {
        getCarts: (state) => state.carts,
        getAddedToCart: (state) => state.added_to_cart,
    },
})