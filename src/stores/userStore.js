// src/stores/userStore.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        username: '',
        email: '',
        token: ''
    }),
    persist: true,
    actions: {
        setUserInfo(username, email, token) {
            this.username = username
            this.email = email
            this.token = token
        },
        logout() {
            this.username = ''
            this.email = ''
            this.token = ''
        }
    }
})
