<template>
  <div class="q-gutter-md q-pa-md">

    <!-- data grid -->
    <s-data-grid ref="dataGrid" v-if="service && model" :service="service" :model="model">
      <template v-slot:actions-append="props">
        <q-btn v-if="props.props.row.statusLookup != 3" class="rounded-borders q-mx-xs" icon="check"
               color="light-blue-2" text-color="light-blue-7" size="0.9rem"
               unelevated dense @click="updateTenantStatus(props.props.row.id)">
          <q-tooltip>تغییر وضعیت</q-tooltip>
        </q-btn>
      </template>
    </s-data-grid>

    <!-- status update confirm dialog -->
    <s-dialog ref="confirmDialog" title="تایید نهایی" size="sm" ok-label="تایید" :full-screen-button="false">

      <!-- info -->
      <div class="full-width q-mb-sm">
        <div class="text-subtitle2 text-weight-regular text-center">
          نام انگلیسی سازمان را وارد کنید:
        </div>
      </div>

      <!-- tenant name input -->
      <div class="full-width">
        <q-input v-model="tenantName" class="full-width" input-class="text-center" dir="ltr" outlined dense/>
      </div>

    </s-dialog>

  </div>
</template>

<script>
import SDataGrid from "../../components/shared/SDataGrid";
import SDialog from "../../components/shared/SDialog";

export default {
  name: "TenantRegisterRequest",
  components: {SDataGrid, SDialog},
  data: () => ({
    tenantName: ''
  }),
  meta() {
    return this.meta
  },
  computed: {
    service() {
      return this.$store.getters.getService("Identity")
    },
    model() {
      return this.$store.getters.getServiceModel("Identity", "TenantRegisterRequest")
    },
    meta() {
      return {title: (this.service && this.model && this.model.title)}
    }
  },
  methods: {
    async updateTenantStatus(id) {
      let res = this.$refs.confirmDialog.open(async () => {
        await this.$axios.put(`${process.env.API_URL}/identity/tenantRegisterRequest/changeStatus`, {
          id: id,
          tenantName: this.tenantName
        })
        this.tenantName = ''
        this.$refs.confirmDialog.close()
        this.$refs.dataGrid.movePage(0)
      })
    }
  }
}
</script>

<style scoped>

</style>

