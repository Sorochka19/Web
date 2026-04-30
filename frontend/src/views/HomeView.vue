<template>
  <div v-if="currentUser">
    <div v-if="alertMessage" class="alert alert-warning alert-dismissible fade show" role="alert">
      <h4 class="alert-heading"><i class="bi bi-bell-fill"></i> Час вийшов!</h4>
      <p>{{ alertMessage }}</p>
      <button type="button" class="btn-close" @click="closeAlert"></button>
    </div>
    <div class="row">
      <div class="col-md-5 mb-4">
        <div class="card shadow-sm">
          <div class="card-header bg-white"><h5 class="mb-0">Новий будильник</h5></div>
          <div class="card-body">
            <form @submit.prevent="addAlarm">
              <div class="mb-3">
                <label class="form-label">Час</label>
                <input type="time" class="form-control" v-model="newAlarm.time" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Дата (опціонально)</label>
                <input type="date" class="form-control" v-model="newAlarm.date">
              </div>
              <div class="mb-3">
                <label class="form-label">Назва/Нотатка</label>
                <input type="text" class="form-control" v-model="newAlarm.label">
              </div>
              <button type="submit" class="btn btn-primary w-100">Додати</button>
            </form>
          </div>
        </div>
      </div>
      <div class="col-md-7">
        <h4 class="mb-3">Заведені будильники</h4>
        <div class="list-group shadow-sm">
          <p v-if="alarms.length === 0" class="p-3 text-muted mb-0">Немає заведених будильників</p>
          <div v-for="alarm in alarms" :key="alarm.id" class="list-group-item d-flex justify-content-between align-items-center p-3">
            <div>
              <h2 class="mb-0" :class="{'text-muted': !alarm.isActive}">{{ alarm.time }}</h2>
              <small class="text-muted">{{ alarm.date ? alarm.date + ' | ' : 'Щодня | ' }}{{ alarm.label }}</small>
            </div>
            <div class="form-check form-switch fs-4">
              <input class="form-check-input toggle-btn" type="checkbox" role="switch" :checked="alarm.isActive" @change="toggleAlarm(alarm)">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center mt-5">
    <h3 class="mb-3">Доступ заборонено</h3>
    <p class="text-muted mb-4">Будь ласка, увійдіть в акаунт.</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
      alarms: [],
      newAlarm: { time: '08:00', date: '', label: '' },
      alertMessage: null,
      timerInterval: null
    }
  },
  methods: {
    async fetchAlarms() {
      if (!this.currentUser) return;
      try {
        const res = await axios.get(`http://localhost:3000/alarms/${this.currentUser.email}`);
        this.alarms = res.data;
        this.alarms.forEach(a => a.isActive = !!a.isActive);
      } catch (error) {
        console.error("Fetch Error");
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
        this.newAlarm = { time: '08:00', date: '', label: '' };
      } catch (error) {
        console.error("Add Alarm Error");
      }
    },
    async toggleAlarm(alarm) {
      alarm.isActive = !alarm.isActive;
      try {
        await axios.put(`http://localhost:3000/alarms/${alarm.id}`, { isActive: alarm.isActive });
      } catch (error) {
        console.error("Toggle Alarm Error");
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
    if (!this.currentUser) {
      this.$router.push('/login');
    } else {
      this.fetchAlarms();
      this.timerInterval = setInterval(() => this.checkAlarms(), 1000);
    }
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
</script>