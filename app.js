const { createApp } = Vue;
createApp({
    data() {
        return {
            currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
            alarms: [],
            newAlarm: { time: '08:00', date: '', label: '' },
            alertMessage: null,

            regForm: { name: '', email: '', password: '', gender: 'male', dob: '' },
            loginForm: { email: '', password: '' }
        }
    },
    methods: {
        async register() {
            try {
                const res = await axios.post('http://localhost:3000/register', this.regForm);
                this.currentUser = res.data;
                localStorage.setItem('currentUser', JSON.stringify(res.data));
                window.location.href = 'profile.html';
            } catch (error) {
                alert('Помилка реєстрації: Можливо, користувач з таким Email вже існує.');
            }
        },
        async login() {
            try {
                const res = await axios.post('http://localhost:3000/login', this.loginForm);
                this.currentUser = res.data;
                localStorage.setItem('currentUser', JSON.stringify(res.data));
                window.location.href = 'profile.html';
            } catch (error) {
                alert('Помилка входу: Невірний email або пароль.');
            }
        },
        logout() {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        },
        async fetchAlarms() {
            if (!this.currentUser) return;
            try {
                const res = await axios.get(`http://localhost:3000/alarms/${this.currentUser.email}`);
                this.alarms = res.data;
                this.alarms.forEach(a => a.isActive = !!a.isActive);
            } catch (error) {
                console.error("Помилка завантаження будильників", error);
            }
        },
        async addAlarm() {
            if (!this.newAlarm.time) return;
            const payload = { ...this.newAlarm, userEmail: this.currentUser.email, isActive: true };
            try {
                const res = await axios.post('http://localhost:3000/alarms', payload);
                const addedAlarm = res.data;
                addedAlarm.isActive = !!addedAlarm.isActive;
                this.alarms.push(addedAlarm);
                this.newAlarm = { time: '08:00', date: '', label: '' }; // Очищення форми
            } catch (error) {
                console.error("Помилка додавання", error);
            }
        },
        async toggleAlarm(alarm) {
            alarm.isActive = !alarm.isActive;
            try {
                await axios.put(`http://localhost:3000/alarms/${alarm.id}`, { isActive: alarm.isActive });
            } catch (error) {
                console.error("Помилка оновлення статусу", error);
                alarm.isActive = !alarm.isActive; 
            }
        },
        closeAlert() {
            this.alertMessage = null;
        },
        checkAlarms() {
            if (!this.currentUser || this.alarms.length === 0) return;
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}`;
            const currentDate = now.toISOString().split('T')[0];
            
            if (now.getSeconds() === 0) {
                this.alarms.forEach(alarm => {
                    if (alarm.isActive && alarm.time === currentTime && (!alarm.date || alarm.date === currentDate)) {
                        this.alertMessage = `Спрацював ваш будильник на ${alarm.time} (${alarm.label || 'Без назви'})`;
                        this.toggleAlarm(alarm); 
                    }
                });
            }
        }
    },
    mounted() {
        this.fetchAlarms();
        setInterval(() => this.checkAlarms(), 1000);
    }
}).mount('#app');
