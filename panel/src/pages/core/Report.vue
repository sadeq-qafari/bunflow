<template>
  <div class="q-gutter-md q-pa-md">
    <s-data-grid v-if="service && model" :service="service" :model="model">
      <template v-slot:actions-append="props">
        <q-btn unelevated dense size="0.9rem" @click="openDesigner(props.props.row.name)"
               icon="report" color="light-blue-2" text-color="light-blue-7" class="rounded-borders q-mx-xs">
          <q-tooltip>ویرایش قالب گزارش</q-tooltip>
        </q-btn>
      </template>
    </s-data-grid>
  </div>
</template>

<script>
import {defineComponent, ref} from '@vue/composition-api'
import SDataGrid from "components/shared/SDataGrid.vue";

export default defineComponent({
  name: 'Report',
  components: {SDataGrid},
  data: () => ({}),
  meta() {
    return this.meta
  },
  computed: {
    service() {
      return this.$store.getters.getService("Core")
    },
    model() {
      return this.$store.getters.getServiceModel("Core", "Report")
    },
    meta() {
      return {title: (this.service && this.model && this.model.title)}
    }
  },
  methods: {
    openDesigner(name) {
      window.open(`${process.env.REPORT_URL}/design/${name}`)
    }
  },
  mounted() {

  },

})
</script>

