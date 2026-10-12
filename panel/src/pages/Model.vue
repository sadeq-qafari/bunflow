<template>
  <div class="q-gutter-md q-pa-md">
    <s-data-grid v-if="service && model" :service="service" :model="model">
    </s-data-grid>
  </div>
</template>

<script>
import {defineComponent, ref} from '@vue/composition-api'
import SDataGrid from "components/shared/SDataGrid.vue";

export default defineComponent({
  name: 'PageModel',
  components: {SDataGrid},
  data: () => ({}),
  meta() {
    return this.meta
  },
  computed: {
    service() {
      return this.$store.getters.getService(this.$route.params.serviceName)
    },
    model() {
      return this.$store.getters.getServiceModel(this.$route.params.serviceName, this.$route.params.modelName)
    },
    meta() {
      return {title: (this.service && this.model && this.model.title)}
    }
  },
  methods: {},
  mounted() {
  },

})
</script>

