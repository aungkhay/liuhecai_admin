import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('_token_') ?? '',
        isLoggedIn: localStorage.getItem('_token_') ? true : false,
		filePath: import.meta.env.VITE_FILE_PATH,
        profile: {},
		isSuperAdmin: false,
		permissions: [],
        barTitle: 'Domain',
        isDrawerOpen: 1,
        innerWidth: 0,
        currentRoute: 'domain',
    }),

    actions: {
        setToken(token) {
            this.token = token;
        },
        setIsLoggedIn(payload) {
            this.isLoggedIn = payload;
        },
        setCurrentRoute(path) {
			this.currentRoute = path;
			localStorage.setItem('_pre_route_', path);
		},
        setProfile(payload) {
			this.profile = payload;
			this.isSuperAdmin = payload.id == 1; // Assuming user with ID 1 is super admin
			this.permissions = payload.permissions || [];
		},
		setInnerWidth() {
			if(window.innerWidth < 768 && window.innerWidth > 640) {
				this.isDrawerOpen = 2;
				localStorage.setItem('_drawer_', 2);
			} else if(window.innerWidth < 640) {
				this.isDrawerOpen = 0;
				localStorage.setItem('_drawer_', 0);
			} else {
				this.isDrawerOpen = 1;
				localStorage.setItem('_drawer_', 1);
			}
			this.innerWidth = window.innerWidth
		},
        setDrawer() {
			var innerWidth = window.innerWidth;

			if((innerWidth > 768 && this.isDrawerOpen == 1) || (innerWidth < 768 && innerWidth > 640 && this.isDrawerOpen == 1)) {
				this.isDrawerOpen = 2;
			} else if(innerWidth > 768 && this.isDrawerOpen == 2) {
				this.isDrawerOpen = 1;
			} else if(innerWidth < 768 && this.isDrawerOpen == 1){
				this.isDrawerOpen = 0;
			} else {
				this.isDrawerOpen = 1;
			}

			localStorage.setItem('_drawer_', this.isDrawerOpen);
		},
        closeDrawer() {
			this.isDrawerOpen = 0;
		},
        setBarTitle(title) {
			this.barTitle = title;
		}
    },
    
    getters: {
		getFilePath: (state) => {
			return state.filePath;
		}
    }
});