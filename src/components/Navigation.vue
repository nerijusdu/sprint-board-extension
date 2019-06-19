<template>
  <div class="nav-container">
    <div class="nav-sub-container">
      <router-link to="/board" :class="['nav-item', { active: $route.path === '/board' }]">
        Board
      </router-link>
      <router-link to="/settings" :class="['nav-item', { active: $route.path === '/settings' }]">
        Settings
      </router-link>
    </div>
    <div class="nav-sub-container">
      <div class="nav-item" @click="logout">Logout</div>
    </div>
  </div>
</template>

<script>
import AuthService from '../services/authService';

export default {
  methods: {
    logout: () => AuthService.clearUserSession()
  }
};
</script>


<style scoped>
.nav-container {
  background-color: #171c26;
  color: white;
  height: 50px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
}

.nav-sub-container {
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  padding-bottom: 5px;
  padding-left: 10px;
  padding-right: 10px;
  cursor: pointer;
  text-decoration: none;
  color: white;
}

.nav-item:hover {
  background-color: #1f2c46;
}

.nav-item.active {
  border-bottom: 5px solid #3b97ea;
  padding-bottom: 0px;
}
</style>
