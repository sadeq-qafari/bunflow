<template>
  <q-page class="q-pa-md">
    <div class="row justify-between">
      <q-card class="col-4 " flat>
        <q-card-section class="row justify-between items-center">
          <div class="text-subtitle1">فهرست</div>
          <div>
            <q-btn icon="settings" to="/service/flow/form" padding="9px" flat dense/>
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="q-pa-none">
          <q-scroll-area class="form-list">
            <q-list separator>

              <q-item clickable v-ripple v-for="form of forms" :to="`flow/${form.name}`">
                <q-item-section>
                  <q-item-label>{{ form.title }}</q-item-label>
                  <q-item-label caption>{{ form.description }}</q-item-label>
                </q-item-section>
              </q-item>

            </q-list>
          </q-scroll-area>
        </q-card-section>
      </q-card>
      <flow-search class="overflow-auto"/>
    </div>
  </q-page>
</template>

<script>
import FlowSearch from "./FlowSearch";
import FlowMenu from "../../components/flow/menu/FlowMenu";

export default {
  name: "FlowDashboard",
  components: {FlowMenu, FlowSearch},
  computed: {
    forms() {
      return this.$store.getters.getForms()
    }
  },
  mounted() {
  }

}
</script>

<style scoped>
.form-list {
  height: calc(100vmin - 187px);
}
</style>

