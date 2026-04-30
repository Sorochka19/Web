<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <h2 class="mb-4 text-center">Профіль користувача</h2>
      <div v-if="currentUser" class="card shadow-sm">
        <div class="card-body">
          <table class="table table-bordered table-striped mt-3">
            <tbody>
              <tr><th scope="row" style="width: 30%;">Ім'я</th><td>{{ currentUser.name }}</td></tr>
              <tr><th scope="row">Email</th><td>{{ currentUser.email }}</td></tr>
              <tr><th scope="row">Стать</th><td>{{ currentUser.gender === 'male' ? 'Чоловіча' : 'Жіноча' }}</td></tr>
              <tr><th scope="row">Дата народження</th><td>{{ currentUser.dob }}</td></tr>
            </tbody>
          </table>
          <div class="text-end mt-3">
            <button type="button" class="btn btn-outline-danger" @click="logout">Вийти</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || null
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('currentUser');
      this.$emit('update-user');
      this.$router.push('/login');
    }
  },
  mounted() {
    if (!this.currentUser) {
      this.$router.push('/login');
    }
  }
}
</script>