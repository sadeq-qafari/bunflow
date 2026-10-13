<template>
    <q-bar class="bg-white text-grey-8">
      <q-btn dense flat color="grey-8" icon="home" size="md" to="/flow"/>
      <q-item dense clickable v-ripple v-for="menu of menus" :key="menu.id">
        <q-item-section>
          {{ menu && menu.title }}
        </q-item-section>
        <flow-sub-menu :menus="menu.children"/>
      </q-item>
      <q-space/>

      <q-btn dense flat color="grey-8" :icon="fullscreen?'fullscreen_exit':'fullscreen'" size="md" @click="toggleFullscreen"/>
    </q-bar>
</template>

<script>
import FlowSubMenu from "./FlowSubMenu";

export default {
  name: "FlowMenu",
  components: {FlowSubMenu},
  data: () => ({
    menus: [],
    fullscreen: false
  }),
  methods: {
    toggleFullscreen() {
      if (this.fullscreen) {
        document.exitFullscreen()
        this.fullscreen = false
      } else {
        document.body.requestFullscreen()
        this.fullscreen = true
      }
    },
    async loadMenu() {
      const res = await this.$axios.get(`${process.env.API_URL}/flow/menu/list`)
      this.menus = res.data.result
    }
  },
  mounted() {
    this.loadMenu()
  }
}
</script>

<style scoped>

</style>

