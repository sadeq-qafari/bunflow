<template>
  <div class="q-pa-md">
    <tab-layout v-model="modelName" :page-title="pageTitle" :tabs="tabs" :on-tab-change="updateRoute">

      <!-- pricing -->
      <div v-if="modelName === 'Pricing'">
        <div v-if="!isLoading" class="column full-width">

          <!-- input fields -->
          <div class="full-width">
            <s-model-component ref="pricingForm" v-model="pricing" service-name="Tenant" model-name="Pricing" flat/>
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

      <!-- pricing detail -->
      <div v-else-if="service && model">
        <s-data-grid :service="service" :model="model" :defaultFilters="defaultFilter"
                     :use-add="modelName !== 'Pricing'"/>
      </div>

    </tab-layout>
  </div>
</template>

<script>
import TabLayout from "../../components/layout/TabLayout";
import SModelComponent from "../../components/shared/SModelComponent";
import SDataGrid from "../../components/shared/SDataGrid";

export default {
  name: "PricingInfo",
  components: {TabLayout, SModelComponent, SDataGrid},
  data: () => ({
    isLoading: false,
    serviceName: "Tenant",
    modelName: "Pricing",
    pricing: {},
    tabsData: [
      {name: 'Pricing', icon: 'sell', label: 'تعرفه'},
      {name: 'PricingDetail', icon: 'shopping_cart', label: 'جزییات تعرفه'}
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
      return (this.id > 0 ? this.pricing?.title : 'تعرفه جدید')
    },
    tabs() {
      return this.tabsData.map(x => Object.assign(x, {disabled: x.name !== 'Pricing' && this.id <= 0}))
    },
    defaultFilter() {
      return [['pricingId', 'in', [this.id]]]
    },
  },
  methods: {
    async submit() {
      if (await this.$refs.pricingForm.validate()) {
        // data
        let data = {
          id: this.id,
          applicationId: this.pricing.applicationId,
          title: this.pricing.title,
          price: this.pricing.price,
          finalPrice: this.pricing.finalPrice,
          giftAmount: this.pricing.giftAmount,
          description: this.pricing.description,
          duration: this.pricing.duration,
          isActive: this.pricing.isActive
        }
        // insert
        if (this.id === 0) {
          const res = await this.$axios.post(`${process.env.API_URL}/tenant/pricing`, data)
          // route update
          if (res.data.result > 0) {
            await this.$router.replace({
              path: this.$route.path,
              query: {id: res.data.result}
            })
          }
        }
        // update
        else {
          const res = await this.$axios.put(`${process.env.API_URL}/tenant/pricing`, data)
        }
      }
    },
    async loadPricingInfo() {
      if (this.id > 0) {
        this.isLoading = true
        const res = await this.$axios.get(`${process.env.API_URL}/tenant/pricing/${this.id}`)
        this.pricing = res.data.result
        this.isLoading = false
      }
    },
    async updateRoute() {
      this.isLoading = true
      if (!!this.$route.query.tab)
        await this.$router.replace({
          path: this.$route.path,
          query: Object.assign({}, {id: this.$route.query.id})
        })
      this.isLoading = false
    }
  },
  async mounted() {
    await this.loadPricingInfo()
  }
}
</script>

<style scoped>

</style>

