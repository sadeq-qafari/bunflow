<template>
    <q-option-group class="q-py-sm"
      :model-value="value"
      :options="options"
      inline
      v-bind="$attrs"
      @update:model-value="onInput"
    />
</template>

<script>
export default {
  name: "SRadio",
  props: {
    value: Number | String | Object | null,
    options: Array | null
  },
  methods: {
    onInput(e) {
      this.$emit('input', e)
    }
  }
}
</script>

