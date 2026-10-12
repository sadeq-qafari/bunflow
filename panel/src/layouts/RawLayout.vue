<template>
  <q-layout view="hHh LpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  mounted () {
    this.$i18n.locale = 'fa-ir'
  }
}
</script>

