<template>
  <q-select
    :value="valueObject"
    v-bind="$attrs"
    @input="onInput"
    use-input
    use-chips
    multiple
    hide-dropdown-icon
    input-debounce="0"
    new-value-mode="add-unique"
  ></q-select>
</template>

<script>
export default {
  name: "SStringChips",
  props: {
    value: Array | String | null,
    options: Array,
  },
  computed: {
    valueObject() {
      if (typeof this.value == "string" && this.value.length > 0)
        return this.value.split(',')
      else if (typeof this.value == "object")
        return this.value
      else return []
    }
  },
  methods: {
    focus() {
      this.$refs.component.focus()
    },
    getComponent() {
      return this.$refs.component
    },
    onInput($event) {
      this.$emit('input', $event?.filter(x => x.length > 0)?.join(','))
    },
  }
}
</script>

<style scoped>

</style>

