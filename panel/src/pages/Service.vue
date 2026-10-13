<template>
  <div class="q-ma-lg flex row wrap q-gutter-md justify-around">
    <div class="col-md-1 col-5" v-if="parentMenu != null" >
      <q-btn outline color="grey-4" text-color="black" @click="parentMenu = null" style="width: 120px; height: 120px">
        <div class="column items-center justify-center text-center no-wrap">
          <q-icon name="arrow_upward" size="lg"/>
          <div class="text-center">
            بازگشت
          </div>
        </div>
      </q-btn>
    </div>
    <div class="col-md-1 col-5" v-for="item in menu" :key="JSON.stringify(item)">
      <q-btn outline color="grey-4"
             @click="item.link?$router.push(`/service/${item.link}`) : parentMenu = item" style="width: 120px; height: 120px">
        <div class="column items-center justify-center text-center no-wrap">
          <q-icon :name="item.icon" size="lg" :style="{color:`#${item.colorHex} !important`}"/>
          <div class="text-center text-black">
            {{ item.title }}
          </div>
        </div>
      </q-btn>
    </div>


  </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'PageService',
  components: {},
  data: () => ({
    parentMenu: null
  }),
  methods: {
    setParentMenu(item) {
      console.log(item)
      this.parentMenu = item
    },
    getServiceModels() {
      return this.$store.getters.getServiceModels(this.$route.params.serviceName)
    }
  },
  computed: {
    menu() {
      if (this.$store.state.menus) {
        return this.parentMenu ? this.parentMenu.children : this.$store.state.menus.filter(x => x.name === this.$route.params.serviceName)[0].children.filter(x => x.isActive)
      }
    },
  },
  mounted() {

  }
})
</script>

