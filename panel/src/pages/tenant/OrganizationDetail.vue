<template>
  <div class="q-gutter-md q-pa-md">
    <s-data-grid v-if="service && model" :service="service" :model="model"
                 :default-filters="defaultFilters" @reload="reloadTenantInfo">
    </s-data-grid>
  </div>
</template>

<script>
import {defineComponent, ref} from 'vue'
import SDataGrid from "components/shared/SDataGrid.vue";

export default defineComponent({
  name: 'OrganizationDetail',
  components: {SDataGrid},
  data: () => ({}),
  meta() {
    return this.meta
  },
  computed: {
    service() {
      return this.$store.getters.getService('Tenant')
    },
    model() {
      return this.$store.getters.getServiceModel('Tenant', 'OrganizationDetail')
    },
    meta() {
      return {title: (this.service && this.model && this.model.title)}
    },
    tenantInfo() {
      return this.$store.state.tenant
    },
    defaultFilters() {
      return [['applicationName', 'like', [this.tenantInfo.applicationName]]]
    }
  },
  methods: {
    reloadTenantInfo() {
      this.$store.dispatch('loadTenantInfo')
    }
  },
  mounted() {

  },

})
</script>

