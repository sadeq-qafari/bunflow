<template>
  <div class="row full-width justify-between items-center">
    <q-select outlined dense :model-value="inputValue" :options="options" :label="hideLabel?undefined:label" @update:model-value="update(0, $event)"
              class="col-12"/>
  </div>

</template>

<script>
export default {
  name: 'SFilterBoolean',
  props: {
    dense: Boolean,
    label: String,
    value: false,
    hideLabel: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    filterLabel() {
      const op = this.operands.find(x => x[0] === this.value.type)
      return !op ? 'نامشخص' : op[1]
    },
    inputValue() {
      return this.options.find(x => x.value == this.value.value[0])
    }
  },
  data() {
    return {
      operands: [['=', 'مساوی']],
      options: [
        {label:( this.label || '') + ' ✓', value: true},
        {label: (this.label || '') + ' ✕', value: false},
        {label: 'همه موارد', value: null}
      ]
    }
  },
  methods: {
    update(index, newValue) {
      this.value.type = this.operands[0][0];
      this.$set(this.value.value, index, newValue?.value)
      this.$emit('input', this.value)
    }
  },
  mounted() {
    if (!this.operands.find(x => x[0] === this.value.type)) {
      this.value.type = this.operands[0][0]
    }
  }
}
</script>

<style scoped>

</style>

