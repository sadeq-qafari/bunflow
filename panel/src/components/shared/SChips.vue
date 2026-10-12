<template>
  <q-select outlined
            :dense="dense"
            multiple
            use-input
            use-chips
            input-debounce="500"
            :value="valueObject"
            v-bind="$attrs"
            @input="onInput"
            :options="localOptions"
            @filter="filterFn"
            @filter-abort="abortFilterFn"
            @clear="value=null"
            @remove="removeFromSelectedItems"
            ref="component"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          {{ noOptionLabel || 'موردی یافت نشد' }}
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:option="scope">
      <slot name="option" :opt="scope.opt" :index="scope.index" :itemProps="scope.itemProps" :itemEvents="scope.itemEvents">
        <q-item v-close-popup
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <template v-if="scope.opt.details">
              <q-item-label caption class="q-gutter-xs">
                <q-badge v-for="key in Object.keys(scope.opt.details).filter(x => x !== 'title' && !!scope.opt.details[x])"
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
  name: 'SChips',
  props: {
    getLabel: Function,
    getValue: Function,
    getCaption: Function,
    dense: Boolean,
    url: String,
    value: Array | null,
    options: Array,
    filters: Function | Object | null,
    customFilter: Function | null,
    noOptionLabel: String
  },
  computed: {
    valueObject() {
      let options = this.localOptions
      this.selectedItems.forEach(item => {
        let i = options.findIndex(x => x.value === item.value)
        if (i === -1) {
          options.push(item)
        }
      })
      return options.filter(x => this.value?.includes(x.value))
    }
  },
  data: () => ({
    localOptions: [],
    selectedItems: [],
  }),
  methods: {
    removeFromSelectedItems() {
      this.selectedItems = this.selectedItems.filter(x => this.value?.includes(x.value))
    },
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
            finalResult = finalResult.filter(this.customFilter)
          }
          this.localOptions = finalResult
        } else {
          this.localOptions = []
        }
      })
    },

    abortFilterFn() {
      // console.log('delayed filter aborted')
    },
    async refresh() {
      if (this.value) {
        const items = await this.$api.serviceProvider.getDropdown(this.url, null, this.value?.join())
        if (Array.isArray(items) && items.length > 0) {
          this.selectedItems = items.map(item => ({
            details: item?.label,
            label: item?.label.title,
            value: item?.value
          }))
          this.localOptions = [this.selectedItems]
        }
      } else {
        setTimeout(() => {
          this.refresh()
        }, 1500)

      }

    },
    getComponent() {
      return this.$refs.component
    },

    onInput($event) {
      if ($event && $event[$event.length-1]?.value) {
        let index = this.localOptions.findIndex(x => x.value === $event[$event.length-1].value)
        this.selectedItems.push(this.localOptions[index])
      }
      this.$emit('input', $event.map(x => x.value))
      this.$emit('inputItem', $event)
    },
  },
  async mounted() {
    if (!this.options || this.options.length<=0) {
      await this.refresh()
    } else this.localOptions = this.options
  }
}
</script>

<style scoped>

</style>

