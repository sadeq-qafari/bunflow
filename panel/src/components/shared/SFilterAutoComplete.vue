<template>
  <q-select outlined
            use-input
            input-debounce="500"
            :model-value="valueObject"
            v-bind="$attrs"
            :label="hideLabel?undefined:$attrs.label"
            @update:model-value="onInput"
            :dense="dense"
            :options="localOptions"
            multiple
            use-chips
            @filter="filterFn"
            @filter-abort="abortFilterFn"
  >
    <template v-slot:prepend>
      <q-tooltip>{{ filterLabel }}</q-tooltip>
      <q-btn-dropdown size="xs" class="q-pr-none" :dropdown-icon="filterIcon" unelevated stretch padding="0px" dense style="right: -12px;
    border-radius: 3px !important; border-left: 1px solid silver">
        <q-list>
          <q-item class="items-center" dense clickable v-close-popup v-for="op in operands" @click="updateOperand(op[0])"
                  :key="op[0]">
            <q-item-label>
              <q-icon :name="op[2]"/>&nbsp;{{ op[1] }}
            </q-item-label>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          موردی یافت نشد
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:option="scope">
      <slot name="option" :opt="scope.opt" :index="scope.index" :itemProps="scope.itemProps" :itemEvents="scope.itemEvents">
        <q-item v-bind="scope.itemProps" v-close-popup
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <template v-if="scope.opt.details">
              <q-item-label caption class="q-gutter-xs">
                <q-badge v-for="key in Object.keys(scope.opt.details).filter(x => x !== 'title')" color="grey-7" :key="key">
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
  name: 'SFilterAutoComplete',
  props: {
    getLabel: Function,
    getValue: Function,
    getCaption: Function,
    dense: Boolean,
    url: String,
    options: Array,
    value: Number | undefined,
    hideLabel: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    valueObject() {
      return this.localOptions.filter(x => this.value.value.map(y => y.toString()).includes(x.value.toString()))
    },
    filterLabel() {
      const op = this.operands.find(x => x[0] === this.value.type)
      return !op ? 'نامشخص' : op[1]
    },
    filterIcon() {
      let op = this.operands.find(x => x[0] === this.value.type)
      if (!op) {
        this.value.type = this.operands[0][0]
        op = this.operands[0]
      }
      return !op ? 'warning' : op[2]
    }
  },
  data: () => ({
    localOptions: [],
    operands: [['in', 'شامل', 'search'], ['not in', 'به جز', 'search_off']]
  }),
  methods: {
    updateOperand(operand) {
      let exists = this.operands.find(x => x[0] === operand) != null;
      if (!exists) operand = this.operands[0]
      this.value.type = operand
      this.update(0, this.value.value[0])
    },
    async filterFn(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      const hasUrl = !!this.url
      const filters = typeof this.filters === 'function' ? this.filters() : this.filters
      const res = hasUrl
        ? await this.$api.serviceProvider.getDropdown(this.url, val, null, filters)
        : this.options.filter(x => x.label.includes(val));
      update(() => {
        if (res) {
          this.localOptions = hasUrl
            ? res.map(x => ({
              details: x.label,
              label: x.label.title,
              value: x.value,
            }))
            : res
        } else {
          this.localOptions = []
        }
      })
    },

    abortFilterFn() {
      // console.log('delayed filter aborted')
    },

    onInput($event) {
      if ($event) {
        const arg = {
          value: $event.map(x => x.value),
          elementType: this.value.elementType,
          type: this.value.type
        }
        this.$emit('input', arg)
      } else {
        this.$emit('input', $event)
      }
    },
    async refresh() {
      const items = await this.$api.serviceProvider.getDropdown(this.url, null, this.value.value.join(','))
      if (Array.isArray(items)) {
        this.localOptions = items.map(x => ({
          details: x.label,
          label: x.label.title,
          value: x.value
        }))
      }
    }
  },
  async mounted() {
    if (!this.operands.find(x => x[0] === this.value.type)) {
      this.value.type = this.operands[0][0]
    }
    if (!this.options) await this.refresh()
    else this.localOptions = this.options
  }
}
</script>

<style scoped>

</style>

