<template>
  <div class="not-found-container page-container">
    <div class="text-center">
      <h1 class="display-1">404</h1>
      <h2 class="mb-4">Page Not Found</h2>
      <p class="lead mb-5">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      <router-link :to="{ name: 'login' }" class="btn btn-success btn-lg">
        <i class="bi bi-house-door me-2"></i>Go Home
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

h1 {
  font-size: 6rem;
  font-weight: 700;
  color: #4CAF50;
}
</style>