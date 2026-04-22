import { defineStore } from "pinia";

// Tab shape (for reference):
// { key: string, title: string, fullPath: string, name?: string }

export const useTabsStore = defineStore("tabs", {
    state: () => ({
        tabs: [],
        activeKey: "",
    }),

    actions: {
        open(tab) {
            const idx = this.tabs.findIndex((t) => t.key === tab.key);
            if (idx === -1) this.tabs.push(tab);
            else this.tabs[idx] = { ...this.tabs[idx], ...tab }; // refresh title/fullPath

            this.activeKey = tab.key;
        },

        close(key) {
            const idx = this.tabs.findIndex((t) => t.key === key);
            if (idx === -1) return undefined;

            const wasActive = this.activeKey === key;
            this.tabs.splice(idx, 1);

            if (wasActive) {
                const next = this.tabs[idx] || this.tabs[idx - 1]; // next-right else left
                this.activeKey = next ? next.key : "";
                return next ? next.fullPath : undefined; // caller navigates to this
            }

            return undefined;
        },

        setActive(key) {
            this.activeKey = key;
        },

        closeOthers(activeKey) {
            this.tabs = this.tabs.filter((t) => t.key === activeKey);
            this.activeKey = activeKey;
        },

        closeAll() {
            this.tabs = [];
            this.activeKey = "";
        },
    },
});