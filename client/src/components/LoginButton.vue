<template>
  <button 
    @click="handleLogin" 
    class="button login"
    :disabled="isLoading"
  >
    {{ isLoading ? 'Loading...' : 'Log In' }}
  </button>
</template>

<script setup >
import { useAuth0 } from '@auth0/auth0-vue'

const { loginWithRedirect, isLoading } = useAuth0()

const handleLogin = () => {
  loginWithRedirect()
}
</script>