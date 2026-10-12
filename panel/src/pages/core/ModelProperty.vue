<template>
  <div class="q-gutter-md q-pa-md">
    <s-data-grid v-if="service && model" :service="service" :model="model" use-related-models/>
  </div>
</template>

<script>
import {defineComponent, ref} from '@vue/composition-api'
import SDataGrid from "components/shared/SDataGrid.vue";

export default defineComponent({
  name: 'ModelProperty',
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
      return this.$store.getters.getServiceModel("Core", "ModelProperty")
    },
    meta() {
      return {title: (this.service && this.model && this.model.title)}
    }
  },
  methods: {
  },
  mounted() {

  },

})
</script>

