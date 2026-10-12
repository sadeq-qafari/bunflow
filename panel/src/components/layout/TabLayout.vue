<template>
  <div class="column full-width">

    <!-- header -->
    <div class="row full-width border-radius bg-white q-mb-md q-pa-md justify-between items-center">

      <!-- title -->
      <div class="row q-gutter-x-md items-center">

        <!-- model -->
        <div class="text-subtitle1 text-weight-regular text-grey-9">
          {{ pageTitle }}
        </div>

      </div>

      <!-- return -->
      <div class="col-4 col-md-1">
        <q-btn class="full-width border-radius" color="red-2" text-color="red-7" label="بازگشت" unelevated
               @click="$navigateBack"/>
      </div>

    </div>

    <!-- body -->
    <div class="column full-width border-radius bg-white overflow-hidden">

      <!-- tabs -->
      <q-tabs
        class="full-width"
        :value="value"
        align="justify"
        active-color="primary"
        indicator-color="primary"
        content-class="text-blue-grey"
        no-caps
        outside-arrows
        mobile-arrows
        inline-label
        @input="onInput"
      >
        <q-tab v-for="tab of tabs" :name="tab.name" :icon="tab.icon" :label="tab.label" :ripple="false"
               :disable="tab.disabled != null && tab.disabled === true" :key="JSON.stringify(tab)"/>
      </q-tabs>

      <q-separator/>

      <!-- tab content -->
      <div class="full-width q-pa-md">
        <slot/>
      </div>

    </div>

  </div>
</template>

<script>
export default {
  name: "TabLayout",
  props: {
    value: String | null,
    pageTitle: String | null,
    tabs: Array | null,
    onTabChange: Function | null
  },
  data: () => ({}),
  watch: {
    async '$route.query.tab'(to, from) {
      await this.$emit('input', to)
    }
  },
  methods: {
    async onInput(tab) {
      if (this.onTabChange)
        this.onTabChange()
      await this.$router.replace({
        path: this.$route.path,
        query: Object.assign({}, this.$route.query || {}, {tab})
      }).catch(() => {
      })
    }
  },
  async mounted() {
    if (this.$route.query.tab)
      await this.$emit('input', this.$route.query.tab)
    else
      await this.$emit('input', this.tabs[0].name)
  },
}
</script>

