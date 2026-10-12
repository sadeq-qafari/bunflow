<template>
  <div class="q-pa-md">
    <tab-layout v-model="modelName" :page-title="pageTitle" :tabs="tabs" :on-tab-change="updateRoute">
      <template v-slot:default>

        <!-- organization -->
        <div v-if="modelName === 'Organization' && !isLoading">
          <div class="column full-width">

            <!-- input fields -->
            <div class="full-width q-mb-md">
              <s-model-component ref="organizationForm" v-model="organization" service-name="Tenant" model-name="Organization"
                                 flat/>
            </div>

            <!-- submit -->
            <div class="row full-width justify-end">
              <div class="col-4 col-md-1">
                <q-btn class="full-width border-radius" color="green-2" text-color="green-7" label="ثبت" unelevated
                       @click="submit"/>
              </div>
            </div>

          </div>
        </div>

        <!-- the rest -->
        <div v-else-if="!isLoading && service && model">
          <div class="column full-width">

            <!-- input fields -->
            <div class="full-width q-mb-md">
              <s-model-component ref="organizationDetailForm" v-model="organizationDetail" service-name="Tenant"
                                 :model-name="organizationDetailModelName" flat/>
            </div>

            <!-- submit -->
            <div class="row full-width justify-end">
              <div class="col-4 col-md-1">
                <q-btn class="full-width border-radius" color="green-2" text-color="green-7" label="ثبت" unelevated
                       @click="organizationDetailSubmit"/>
              </div>
            </div>

          </div>

        </div>
        <div v-else-if="isLoading">
          <div class="row full-width justify-center">

          <q-spinner-dots size="xl"/>
        </div>
        </div>

      </template>
    </tab-layout>
  </div>
</template>

<script>
import TabLayout from "../../components/layout/TabLayout";
import SModelComponent from "../../components/shared/SModelComponent";
import SDataGrid from "../../components/shared/SDataGrid";

export default {
  name: "OrganizationInfo",
  components: {TabLayout, SModelComponent, SDataGrid},
  data: () => ({
    isLoading: false,
    serviceName: "Tenant",
    modelName: "Organization",
    organization: {},
    organizationDetail: {},
    tabsData: [
      {name: 'Organization', icon: 'description', label: 'اطلاعات سازمان'},
      {name: 'OrganizationDetail', icon: 'home', label: 'اطلاعات تکمیلی'}
    ]
  }),
  computed: {
    id() {
      return +this.$route.query.id
    },
    service() {
      return this.$store.getters.getService(this.serviceName)
    },
    model() {
      return this.$store.getters.getServiceModel(this.serviceName, this.modelName)
    },
    pageTitle() {
      return (this.id > 0 ? this.organization?.title : 'سازمان جدید')
    },
    tabs() {
      return this.tabsData.map(x => Object.assign(x, {disabled: x.name !== 'Organization' && this.id <= 0}))
    },
    organizationDetailModelName() {
      return `Organization${this.organization.applicationName}`
    }
  },
  methods: {
    async submit() {
      if (await this.$refs.organizationForm.validate()) {
        const res = await this.$axios.put(`${process.env.API_URL}/tenant/organization`,
          Object.assign({}, this.organization, {id: this.id})
        )
        if (this.id === 0 && res.data.result > 0)
          await this.$router.replace({
            path: this.$route.path,
            query: {id: res.data.result}
          })
      }
    },
    async organizationDetailSubmit() {
      if (await this.$refs.organizationDetailForm.validate()) {
        const res = await this.$axios.post(`${process.env.API_URL}/tenant/organizationDetail/upsert`, {
          organizationId: this.id,
          details: this.organizationDetail
        })
        if (this.id === 0 && res.data.result > 0)
          await this.$router.replace({
            path: this.$route.path,
            query: {id: res.data.result}
          })
      }
    },
    async loadOrganizationInfo() {
      const res = await this.$axios.get(`${process.env.API_URL}/tenant/organization/${this.id}`)
      this.organization = res.data.result
    },
    async loadOrganizationDetail() {
      const res = await this.$axios.get(`${process.env.API_URL}/tenant/organizationDetail/${this.id}`)
      this.organizationDetail = res.data.result
    },
    async updateRoute() {
      this.isLoading = true
      if (!!this.$route.query.tab)
        await this.$router.replace({
          path: this.$route.path,
          query: Object.assign({}, {id: this.$route.query.id})
        })
      setTimeout(()=>{
        this.isLoading = false
      },300)

    }
  },
  async mounted() {
    if (this.id > 0) {
      this.isLoading = true
      await this.loadOrganizationInfo()
      await this.loadOrganizationDetail()
      this.isLoading = false
    }
  }
}
</script>

