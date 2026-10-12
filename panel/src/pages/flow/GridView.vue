<template>
  <q-page class="q-pa-md column">
    <f-data-grid :form-name="formName" v-if="show && formsLoaded"/>
    <q-skeleton v-else height="300px" width="100%" class="bg-blue-grey-1 full-width border-radius"></q-skeleton>
  </q-page>
</template>

<script>
import FDataGrid from "../../components/flow/FDataGrid";
import FlowMenu from "../../components/flow/menu/FlowMenu";

export default {
  name: "GridView",
  components: {FlowMenu, FDataGrid},
  data: () => ({
    show: true
  }),
  computed: {
    formName() {
      return this.$route.params.formName?.toString()
    },
    formsLoaded() {
      return this.$store.state.forms && this.$store.state.forms.length > 0
    }
  },
  watch: {
    formName(to, from) {
      this.show = false
      setTimeout(() => {
        this.show = true
      }, 50)
    }
  }
}
</script>

<style scoped>

</style>

