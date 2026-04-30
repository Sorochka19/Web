<template>
  <div class="card shadow-sm mx-auto" style="max-width: 500px;">
    <div class="card-body p-4">
      <h3 class="text-center mb-4">Реєстрація</h3>
      <form @submit.prevent="register">
        <div class="mb-3">
          <label class="form-label">Ім'я</label>
          <input type="text" class="form-control" v-model="regForm.name" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" v-model="regForm.email" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Пароль</label>
          <input type="password" class="form-control" v-model="regForm.password" required>
        </div>
        <div class="mb-3">
          <label class="form-label d-block">Стать</label>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" value="male" v-model="regForm.gender" required>
            <label class="form-check-label">Чоловіча</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" value="female" v-model="regForm.gender" required>
            <label class="form-check-label">Жіноча</label>
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label">Дата народження</label>
          <input type="date" class="form-control" v-model="regForm.dob" required>
        </div>
        <button type="submit" class="btn btn-primary w-100">Зареєструватися</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      regForm: { name: '', email: '', password: '', gender: 'male', dob: '' }
    }
  },
  methods: {
    async register() {
      try {
        const res = await axios.post('http://localhost:3000/register', this.regForm);
        localStorage.setItem('currentUser', JSON.stringify(res.data));
        this.$emit('update-user');
        this.$router.push('/profile');
      } catch (error) {
        console.error("Registration Error");
        alert('Помилка реєстрації: Можливо, користувач з таким Email вже існує.');
      }
    }
  }
}
</script>