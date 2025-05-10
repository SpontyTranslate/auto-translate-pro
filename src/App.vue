<template>
  <div id="app">
    <header>
      <h1>AutoTranslate Pro</h1>
    </header>
    <main>
      <router-view/>
    </main>
    <footer>
      <p>&copy; 2025 AutoTranslate Pro</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
header {
  padding: 20px 0;
  border-bottom: 1px solid #ddd;
}
main {
  padding: 20px 0;
  min-height: calc(100vh - 180px);
}
footer {
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid #ddd;
  margin-top: 20px;
}
</style>