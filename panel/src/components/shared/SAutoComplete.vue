<template>
  <q-select :outlined="outlined"
            :borderless="borderless"
            :dense="dense"
            clearable
            use-input
            hide-selected
            fill-input
            input-debounce="500"
            :model-value="valueObject"
            v-bind="$attrs"
            @update:model-value="onInput"
            :options="localOptions"
            @filter="filterFn"
            @filter-abort="abortFilterFn"
            ref="component"
            @keyup.enter="$emit('onEnterKey', $event)"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          {{ noOptionLabel || 'موردی یافت نشد' }}
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:option="scope">
      <slot name="option" :opt="scope.opt" :index="scope.index" :itemProps="scope.itemProps"
            :itemEvents="scope.itemEvents">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <template v-if="scope.opt.details">
              <q-item-label caption class="q-gutter-xs">
                <q-badge
                  v-for="key in Object.keys(scope.opt.details).filter(x => x !== 'title' && !!scope.opt.details[x])"
                  color="grey-7" :key="key">
                  {{ scope.opt.details[key] }}
                </q-badge>
              </q-item-label>
            </template>
          </q-item-section>
        </q-item>
      </slot>
    </template>
  </q-select>
</template>

<script>
export default {
  name: 'SAutoComplete',
  props: {
    getLabel: Function,
    getValue: Function,
    getCaption: Function,
    dense: Boolean,
    url: String,
    value: Number | String,
    options: Array,
    filters: Function | Object | null,
    customFilter: Function | null,
    noOptionLabel: String,
    outlined: {type: Boolean, default: true},
    borderless: {type: Boolean, default: false}
  },
  computed: {
    valueObject() {
      return this.localOptions.find(x => x.value === this.value) || this.selectedItem
    }
  },
  data: () => ({
    localOptions: [],
    selectedItem: null,
  }),
  methods: {
    focus() {
      this.$refs.component.focus()
    },
    async filterFn(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      const hasUrl = !!this.url
      const filters = typeof this.filters === 'function' ? this.filters() : this.filters
      const res = hasUrl
        ? await this.$api.serviceProvider.getDropdown(this.url, val, null, filters)
        : this.options.filter(x => x.label.includes(val) || x.details?.length > 0 && x.details.join(' ').includes(val)).sort(
          (a, b) => a.label.includes(val) ? -1 : 1
        );
      update(() => {
        if (res) {
          let finalResult = hasUrl
            ? res.map(x => ({
              details: x.label,
              label: x.label.title,
              value: x.value,
            }))
            : res
          if (this.customFilter != null) {
            console.log('customFilter', this.customFilter)
            finalResult = finalResult.filter(this.customFilter)
            console.log('finalResult', finalResult)
          }
          this.localOptions = finalResult
        } else {
          this.localOptions = []
        }

        setTimeout(() => {
          this.getComponent().setOptionIndex(-1) // reset optionIndex in case there is something selected
          this.getComponent().moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
        }, 300)
      })
    },

    abortFilterFn() {
      // console.log('delayed filter aborted')
    },
    async refresh() {
      const items = await this.$api.serviceProvider.getDropdown(this.url, null, this.value)
      if (Array.isArray(items) && items.length > 0 && items[0]?.value == this.value) {
        this.selectedItem = {
          details: items[0]?.label,
          label: items[0]?.label.title,
          value: items[0]?.value
        }
        this.localOptions = [this.selectedItem]
      }
    },
    getComponent() {
      return this.$refs.component
    },

    onInput($event) {
      this.$emit('input', $event && $event.value)
      this.$emit('inputItem', $event)
      this.selectedItem = this.localOptions.find(x => x.value === $event?.value)
    },
    resetValidation() {
      this.$refs.component.resetValidation()
    }
  },
  async mounted() {
    if (!this.options) await this.refresh()
    else this.localOptions = this.options
  }
}
</script>

<style scoped>

</style>

