<template>
  <div class="card shadow-sm mx-auto" style="max-width: 400px;">
    <div class="card-body p-4">
      <h3 class="text-center mb-4">Вхід</h3>
      <form @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" v-model="loginForm.email" required>
        </div>
        <div class="mb-4">
          <label class="form-label">Пароль</label>
          <input type="password" class="form-control" v-model="loginForm.password" required>
        </div>
        <button type="submit" class="btn btn-primary w-100">Увійти</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      loginForm: { email: '', password: '' }
    }
  },
  methods: {
    async login() {
      try {
        const res = await axios.post('http://localhost:3000/login', this.loginForm);
        localStorage.setItem('currentUser', JSON.stringify(res.data));
        this.$emit('update-user');
        this.$router.push('/profile');
      } catch (error) {
        console.error("Login Error");
        alert('Помилка входу: Невірний email або пароль.');
      }
    }
  }
}
</script>