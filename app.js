const { createApp } = Vue;

createApp({
    data() {
        return {
            currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
            users: JSON.parse(localStorage.getItem('users')) || [],
            alarms: JSON.parse(localStorage.getItem('alarms')) || [],
            newAlarm: { time: '08:00', date: '', label: '' },
            alertMessage: null,
            regForm: { name: '', email: '', password: '', gender: 'male', dob: '' },
            loginForm: { email: '', password: '' }
        }
    },
    methods: {
        register() {
            const exists = this.users.find(u => u.email === this.regForm.email);
            if (exists) {
                console.error("Registration error: User already exists");
                alert('Помилка реєстрації: Можливо, користувач з таким Email вже існує.');
                return;
            }
            const newUser = { ...this.regForm, id: Date.now() };
            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));
            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            console.log("User registered successfully");
            window.location.href = 'profile.html';
        },
        login() {
            const user = this.users.find(u => u.email === this.loginForm.email && u.password === this.loginForm.password);
            if (!user) {
                console.error("Login failed: Invalid credentials");
                alert('Помилка входу: Невірний email або пароль.');
                return;
            }
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log("User logged in successfully");
            window.location.href = 'profile.html';
        },
        logout() {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            console.log("User logged out");
            window.location.href = 'login.html';
        },
        addAlarm() {
            if (!this.newAlarm.time) return;
            const alarm = {
                ...this.newAlarm,
                id: Date.now(),
                userEmail: this.currentUser.email,
                isActive: true
            };
            this.alarms.push(alarm);
            this.saveAlarms();
            this.newAlarm = { time: '08:00', date: '', label: '' };
            console.log("Alarm added successfully");
        },
        toggleAlarm(alarm) {
            alarm.isActive = !alarm.isActive;
            this.saveAlarms();
            console.log("Alarm status toggled");
        },
        saveAlarms() {
            localStorage.setItem('alarms', JSON.stringify(this.alarms));
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
                    if (alarm.isActive && alarm.userEmail === this.currentUser.email && alarm.time === currentTime && (!alarm.date || alarm.date === currentDate)) {
                        this.alertMessage = `Спрацював ваш будильник на ${alarm.time} (${alarm.label || 'Без назви'})`;
                        this.toggleAlarm(alarm);
                    }
                });
            }
        }
    },
    mounted() {
        setInterval(() => this.checkAlarms(), 1000);
        console.log("Application mounted successfully");
    }
}).mount('#app');
