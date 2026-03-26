class AlarmModel {
    constructor(userEmail) {
        this.userEmail = userEmail;
        this.allAlarms = JSON.parse(localStorage.getItem('alarms')) || [];
        this.alarms = this.allAlarms.filter(alarm => alarm.userEmail === this.userEmail);
    }
    bindAlarmsChanged(callback) { this.onAlarmsChanged = callback; }
    commit() {
        this.onAlarmsChanged(this.alarms);
        this.allAlarms = this.allAlarms.filter(alarm => alarm.userEmail !== this.userEmail).concat(this.alarms);
        localStorage.setItem('alarms', JSON.stringify(this.allAlarms));
    }
    addAlarm(time, date, label) {
        const newAlarm = { 
            id: Date.now().toString(), 
            userEmail: this.userEmail,
            time, 
            date, 
            label: label || 'Alarm', 
            isActive: true 
        };
        this.alarms.push(newAlarm);
        this.commit();
        console.log("Alarm added successfully for user: " + this.userEmail);
    }
    toggleAlarm(id) {
        this.alarms = this.alarms.map(alarm => alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm);
        this.commit();
        console.log("Alarm status toggled");
    }
}

class AlarmView {
    constructor() {
        this.form = document.getElementById('alarmForm');
        this.timeInput = document.getElementById('alarmTime');
        this.dateInput = document.getElementById('alarmDate');
        this.labelInput = document.getElementById('alarmLabel');
        this.alarmsList = document.getElementById('alarmsList');
        this.alertContainer = document.getElementById('alertContainer');
    }
    get _time() { return this.timeInput ? this.timeInput.value : ''; }
    get _date() { return this.dateInput ? this.dateInput.value : ''; }
    get _label() { return this.labelInput ? this.labelInput.value : ''; }
    
    resetInput() {
        if(this.timeInput) this.timeInput.value = '08:00';
        if(this.dateInput) this.dateInput.value = '';
        if(this.labelInput) this.labelInput.value = '';
    }
    
    displayAlarms(alarms) {
        if (!this.alarmsList) return;
        this.alarmsList.innerHTML = '';
        if (alarms.length === 0) {
            this.alarmsList.innerHTML = '<p class="p-3 text-muted mb-0">No alarms set</p>';
            return;
        }
        alarms.forEach(alarm => {
            const opacityClass = alarm.isActive ? '' : 'text-muted';
            const dateText = alarm.date ? alarm.date + ' | ' : 'Daily | ';
            const itemHtml = `
                <div class="list-group-item d-flex justify-content-between align-items-center p-3">
                    <div>
                        <h2 class="mb-0 ${opacityClass}">${alarm.time}</h2>
                        <small class="text-muted">${dateText}${alarm.label}</small>
                    </div>
                    <div class="form-check form-switch fs-4">
                        <input class="form-check-input toggle-btn" type="checkbox" role="switch" id="${alarm.id}" ${alarm.isActive ? 'checked' : ''}>
                    </div>
                </div>
            `;
            this.alarmsList.insertAdjacentHTML('beforeend', itemHtml);
        });
    }
    
    bindAddAlarm(handler) {
        if (!this.form) return;
        this.form.addEventListener('submit', event => {
            event.preventDefault();
            if (this._time) {
                handler(this._time, this._date, this._label);
                this.resetInput();
            }
        });
    }
    
    bindToggleAlarm(handler) {
        if (!this.alarmsList) return;
        this.alarmsList.addEventListener('change', event => {
            if (event.target.classList.contains('toggle-btn')) {
                handler(event.target.id);
            }
        });
    }
    
    showAlert(time, label) {
        if (!this.alertContainer) return;
        const alertHtml = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <h4 class="alert-heading"><i class="bi bi-bell-fill"></i> Time is up!</h4>
                <p>Alarm set for <strong>${time}</strong> (${label}).</p>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        this.alertContainer.innerHTML = alertHtml;
        console.log("Alarm triggered: " + time);
    }
}

class AlarmController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.model.bindAlarmsChanged(this.onAlarmsChanged);
        this.view.bindAddAlarm(this.handleAddAlarm);
        this.view.bindToggleAlarm(this.handleToggleAlarm);
        this.onAlarmsChanged(this.model.alarms);
        this.startClock();
    }
    onAlarmsChanged = alarms => { this.view.displayAlarms(alarms); };
    handleAddAlarm = (time, date, label) => { this.model.addAlarm(time, date, label); };
    handleToggleAlarm = id => { this.model.toggleAlarm(id); };
    startClock() {
        setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}`;
            const currentDate = now.toISOString().split('T')[0];
            
            if (now.getSeconds() === 0) {
                this.model.alarms.forEach(alarm => {
                    if (alarm.isActive && alarm.time === currentTime && (!alarm.date || alarm.date === currentDate)) {
                        this.view.showAlert(alarm.time, alarm.label);
                        this.model.toggleAlarm(alarm.id);
                    }
                });
            }
        }, 1000);
    }
}

class UserModel {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }
    register(name, email, gender, dob, password) {
        if (this.users.some(u => u.email === email)) {
            console.log("Registration failed: User already exists");
            return false;
        }
        const newUser = { name, email, gender, dob, password };
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        console.log("User registered and logged in successfully");
        return true;
    }
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            console.log("User logged in successfully");
            return true;
        }
        console.log("Login failed: Invalid credentials");
        return false;
    }
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        console.log("User logged out successfully");
    }
    getCurrentUser() { return this.currentUser; }
}

class AuthView {
    constructor() {
        this.regForm = document.getElementById('regForm');
        this.loginForm = document.getElementById('loginForm');
        this.logoutBtn = document.getElementById('logoutBtn');
    }
    bindRegister(handler) {
        if (!this.regForm) return;
        this.regForm.addEventListener('submit', event => {
            event.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const dob = document.getElementById('regDob').value;
            const password = document.getElementById('regPassword').value;
            let gender = Array.from(document.getElementsByName('gender')).find(r => r.checked)?.value;
            if (name && email && password && gender && dob) {
                handler(name, email, gender, dob, password);
            }
        });
    }
    bindLogin(handler) {
        if (!this.loginForm) return;
        this.loginForm.addEventListener('submit', event => {
            event.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            if (email && password) handler(email, password);
        });
    }
    bindLogout(handler) {
        if (this.logoutBtn) this.logoutBtn.addEventListener('click', () => handler());
    }
    redirect(url) { window.location.href = url; }
}

class ProfileView {
    constructor() { this.profileTable = document.getElementById('profileTable'); }
    displayUser(user) {
        if (this.profileTable && user) {
            this.profileTable.innerHTML = `
                <tbody>
                    <tr><th scope="row" style="width: 30%;">Name</th><td>${user.name}</td></tr>
                    <tr><th scope="row">Email</th><td>${user.email}</td></tr>
                    <tr><th scope="row">Gender</th><td>${user.gender === 'male' ? 'Male' : 'Female'}</td></tr>
                    <tr><th scope="row">Date of Birth</th><td>${user.dob}</td></tr>
                </tbody>
            `;
            console.log("Profile data rendered");
        }
    }
}

class UserController {
    constructor(model, authView, profileView) {
        this.model = model;
        this.authView = authView;
        this.profileView = profileView;
        this.authView.bindRegister(this.handleRegister);
        this.authView.bindLogin(this.handleLogin);
        this.authView.bindLogout(this.handleLogout);
        this.profileView.displayUser(this.model.getCurrentUser());
    }
    handleRegister = (name, email, gender, dob, password) => {
        if (this.model.register(name, email, gender, dob, password)) this.authView.redirect('profile.html');
    };
    handleLogin = (email, password) => {
        if (this.model.login(email, password)) this.authView.redirect('profile.html');
    };
    handleLogout = () => {
        this.model.logout();
        this.authView.redirect('login.html');
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const userModel = new UserModel();
    const currentUser = userModel.getCurrentUser();

    const navAlarms = document.getElementById('nav-alarms');
    const navProfile = document.getElementById('nav-profile');
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');

    if (currentUser) {
        if(navAlarms) navAlarms.style.display = 'block';
        if(navProfile) navProfile.style.display = 'block';
        if(navLogin) navLogin.style.display = 'none';
        if(navRegister) navRegister.style.display = 'none';
    } else {
        if(navAlarms) navAlarms.style.display = 'none';
        if(navProfile) navProfile.style.display = 'none';
        if(navLogin) navLogin.style.display = 'block';
        if(navRegister) navRegister.style.display = 'block';
    }

    new UserController(userModel, new AuthView(), new ProfileView());
    console.log("User Auth initialized");

    const mainElement = document.querySelector('main');
    
    if (document.getElementById('alarmForm') || document.getElementById('alarmsList')) {
        if (currentUser) {
            new AlarmController(new AlarmModel(currentUser.email), new AlarmView());
            console.log("Alarm app initialized for user: " + currentUser.email);
        } else {
            mainElement.innerHTML = `
                <div class="text-center mt-5">
                    <h3 class="mb-3">Access Denied</h3>
                    <p class="text-muted mb-4">Please log in to view and manage your alarms.</p>
                    <a href="login.html" class="btn btn-primary px-4 py-2">Login</a>
                    <a href="register.html" class="btn btn-outline-secondary px-4 py-2 ms-2">Register</a>
                </div>
            `;
            console.log("User not logged in, prompt displayed");
        }
    }

    if (document.getElementById('profileTable') && !currentUser) {
        mainElement.innerHTML = `
            <div class="text-center mt-5">
                <h3 class="mb-3">Access Denied</h3>
                <p class="text-muted mb-4">Please log in or register first.</p>
                <a href="login.html" class="btn btn-primary px-4 py-2">Login</a>
            </div>
        `;
        console.log("Access denied to profile");
    }
});