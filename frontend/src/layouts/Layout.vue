<template>
  <div class="app-container">
    <main>
      <router-view />
    </main>
  </div>
</template>



<script>
export default {
  name: 'MainLayout'
}
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex-grow: 1;
}
</style> 