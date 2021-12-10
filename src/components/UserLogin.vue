<template>
  <div class="__login">
    <h3 v-if="!activeUser">
      Login
    </h3>
    <h3 v-if="activeUser">
      Logged in as
    </h3>
    <div
      v-if="!activeUser"
      class="__form"
    >
      <div class="__email">
        <div class="__heading">
          Email
        </div>
        <input
          v-model="email"
          type="email"
        >
      </div>
      <div class="__password">
        <div class="__heading">
          Password
        </div>
        <input
          v-model="password"
          type="password"
        >
      </div>
    </div>
    <div
      v-if="activeUser"
      class="__activeUser"
    >
      <div class="__image">
        <img :src="activeUser.photoURL">
      </div>
      <div class="__name">
        {{ activeUser.displayName }}
      </div>
      <div class="__email">
        <a :href="`mailto:${activeUser.email}`">{{ activeUser.email }}</a>
      </div>
      <div class="__role">
        {{ activeUser.role }}
      </div>
    </div>
    <div class="__buttons">
      <Button
        v-if="!activeUser"
        :type="ButtonType.PRIMARY"
        @click="login({email, password})"
      >
        Login
      </Button>
      <Button
        v-if="activeUser"
        :type="ButtonType.DANGER"
        @click="logout()"
      >
        Logout
      </Button>
    </div>
    <hr v-if="!activeUser">
    <div
      v-if="!activeUser"
      class="__availableUsers"
    >
      <h3>Available Users</h3>
      <div
        v-for="u in users"
        :key="u.uid"
        class="__availableUser"
        @click="login({email: u.email, password: u.password})"
      >
        <div class="__image">
          <span class="material-icons-outlined">account_circle</span>
        </div>
        <div class="__right">
          <div class="__name">
            {{ u.name }}
          </div>
          <div class="__email">
            <a href="#">{{ u.email }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'UserLogin',
  data: function () {
    return {
      email: '',
      password: ''
    }
  },
  computed: {
    ...mapState('users', ['activeUser', 'users'])
  },
  methods: {
    ...mapActions('users', ['login', 'logout'])
  }
}
</script>

<style scoped>
h3 {
  margin-top: 0;
}

.__heading{
  font-weight: bold;
}

.__email, .__password {
  display: flex;
  flex-direction: column;
}

.__email > input, .__password > input {
  flex: 1;
  margin: 0.5rem 0;
}

.__buttons {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.__buttons > button {
  flex: 1;
}

.__activeUser {
  text-align: center;
}

.__activeUser  .__image {
  width: 5rem;
  margin: 0 auto;
}

.__activeUser .__image > img {
  width: 100%;
  height: 100%;
}

.__activeUser .__name {
  font-weight: bold;
  font-size: 1rem;
  padding: 0.2rem 0 0 0;
}

.__activeUser .__email {
  padding: 0 0 0.5rem 0;
}

.__activeUser .__role {
  text-transform: capitalize;
}

.__availableUsers {
  margin-top: 1rem;
}

.__availableUser {
  display: flex;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
}

.__availableUser:hover {
  display: flex;
  cursor: pointer;
  background-color: var(--hover);
}

.__availableUser:hover a {
  color: var(--text-light);
}

.__availableUser .__name {
  font-size: 0.9rem;
  font-weight: bold;
}

.__availableUser > .__image {
  margin-right: 1rem;
}

.__availableUser > .__image > span {
  font-size: 3rem;
}

.__availableUser > .__right {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
