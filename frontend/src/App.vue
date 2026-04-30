<template>
  <div class="d-flex flex-column min-vh-100">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/"><i class="bi bi-alarm"></i> WebAlarm</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <template v-if="currentUser">
              <li class="nav-item"><router-link class="nav-link" to="/">Мої будильники</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/profile">Профіль</router-link></li>
            </template>
            <template v-else>
              <li class="nav-item"><router-link class="nav-link" to="/login">Вхід</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/register">Реєстрація</router-link></li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
    <main class="container my-5 flex-grow-1">
      <router-view @update-user="checkUser"></router-view>
    </main>
    <footer class="bg-dark text-white text-center py-3 mt-auto">
      <div class="container"><p class="mb-0">&copy; 2026 WebAlarm.</p></div>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentUser: null
    }
  },
  methods: {
    checkUser() {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }
  },
  mounted() {
    this.checkUser();
  }
}
</script>