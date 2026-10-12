<template>
  <q-select
    v-else
    :value="selectedOption"
    @input="onInput"
    clearable
    use-input
    hide-selected
    fill-input
    v-bind="$attrs"
    input-debounce="300"
    :options="options"
    @filter="filterFnAutoselect"
    @filter-abort="abortFilterFn"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          موردی یافت نشد
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
export default {
  name: "FDropdown",
  data: () => ({
    options: [],
    lookupOptions: [],
    selectedOption: null,

    dropdownTypes: {
      none: 0,
      formDropdown: 1,
      lookup: 2
    },
    lookupTypes: {
      options: 1,
      query: 2,
      webService: 3
    }
  }),


  props: {
    value: Object | null,
    lookup: {
      type: Object | null,
      default: null
    },
    formName: {
      type: String | null,
      default: null
    }
  },


  computed: {
    ops() {
      return this.options
    },
    type() {
      if (this.formName && this.formName.length > 0) {
        return this.dropdownTypes.formDropdown
      } else if (this.lookup) {
        return this.dropdownTypes.lookup
      } else {
        return this.dropdownTypes.none
      }
    }
  },


  methods: {
    selectItem() {
      this.$emit('select-item')
    },


    onInput(event) {
      this.selectedOption = event
      this.$emit('input', event?.value)
    },


    async getFormDropdown(val) {
      const res = await this.$axios.get(`${process.env.API_URL}/flow/form/dropdown/${this.formName}?searchValue=${val || ''}`)
      if (res.data.success && res.data.result) {
        let items = res.data.result
        let valueKey = Object.keys(items[0])[0] //|| 'Id'
        let labelKey = Object.keys(items[0])[1] //|| 'Title'
        return [...items.map(item => ({value: item[valueKey], label: item[labelKey], ...item}))]
      } else {
        return []
      }
    },


    getLookupDropdown(val) {
      switch (this.lookup.typeLookup) {
        case this.lookupTypes.options:
          return this.lookup.options?.map(x => ({value: x.value, label: x.title, ...x})).filter(x => x.title.includes(val))

        case this.lookupTypes.query:
        case this.lookupTypes.webService:
          return []
      }
    },


    async getFormDropdownValue() {
      const res = await this.$axios.get(`${process.env.API_URL}/flow/form/dropdown/${this.formName}?Id=${this.value || 0}`)
      if (res.data.success && res.data.result) {
        let item = res.data.result[0] || {}
        let valueKey = Object.keys(item)[0] //|| 'Id'
        let labelKey = Object.keys(item)[1] //|| 'Title'
        this.selectedOption = {value: item[valueKey], label: item[labelKey], ...item}
      } else {
        return []
      }
    },


    getLookupDropdownValue() {
      let item = this.lookup.options.find(x => x.value == this.value)
      this.selectedOption = {value: item.value, label: item.title, ...item}
    },


    async getOptions(val) {
      switch (this.type) {
        case this.dropdownTypes.none:
          return []
        case this.dropdownTypes.formDropdown:
          return await this.getFormDropdown(val)
        case this.dropdownTypes.lookup:
          return this.getLookupDropdown(val)
      }
    },


    async getValue() {
      switch (this.type) {
        case this.dropdownTypes.none:
          return []

        case this.dropdownTypes.formDropdown:
          return await this.getFormDropdownValue()

        case this.dropdownTypes.lookup:
          return this.getLookupDropdownValue()
      }
    },


    async filterFnAutoselect(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      let ops = [...(await this.getOptions(val))]
      update(
        () => {
          this.options = ops
        },

        // next function is available in Quasar v1.7.4+;
        // "ref" is the Vue reference to the QSelect
        ref => {
          if (val !== '' && ref.options.length > 0 && ref.optionIndex === -1) {
            ref.moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
            ref.toggleOption(ref.options[ref.optionIndex], true) // toggle the focused option
          }
        }
      )
    },

    abortFilterFn() {
      // console.log('delayed filter aborted')
    }

  },


  async mounted() {
    if (this.value)
      await this.getValue()
  },


  watch: {
    // async value(to, from) {
    //   if (!from && to > 0) {
    //     await this.getValue()
    //   }
    // }
  }
}
</script>

<style scoped>

</style>

