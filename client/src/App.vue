<template>
  <div class="app-container">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-text">Loading...</div>
    </div>
    
    <div v-else-if="error" class="error-state">
      <div class="error-title">Oops!</div>
      <div class="error-message">Something went wrong</div>
      <div class="error-sub-message">{{ error.message }}</div>
    </div>
    
    <div v-else class="main-card-wrapper">
      <img 
        src="https://cdn.auth0.com/quantum-assets/dist/latest/logos/auth0/auth0-lockup-en-ondark.png" 
        alt="Auth0 Logo" 
        class="auth0-logo"
        @error="handleImageError"
      />
      <h1 class="main-title">Welcome to Vue0</h1>
      
      <div v-if="isAuthenticated" class="logged-in-section">
        <div class="logged-in-message">✅ Successfully authenticated!</div>
        <h2 class="profile-section-title">Your Profile</h2>
        <div class="profile-card">
          <UserProfile />
        </div>
        <TestApi />
        <LogoutButton />
      </div>
      
      <div v-else class="action-card">
        <p class="action-text">Get started by signing in to your account</p>
        <LoginButton />
      </div>
    </div>
  </div>
</template>

<script setup >
import { useAuth0 } from '@auth0/auth0-vue'
// components
import LoginButton from './components/LoginButton.vue'
import LogoutButton from './components/LogoutButton.vue'
import UserProfile from './components/UserProfile.vue'
import TestApi from './components/TestApi.vue'

const { isAuthenticated, isLoading, error } = useAuth0()

const handleImageError = (e) => {
  const target = e.target
  target.style.display = 'none'
}

</script>

<style>
  @import './style/style.css';
  @import './style/animation.css';
</style>
