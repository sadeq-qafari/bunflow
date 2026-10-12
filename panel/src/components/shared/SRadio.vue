<template>
    <q-option-group class="q-py-sm"
      :value="value"
      :options="options"
      inline
      v-bind="$attrs"
      @input="onInput"
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

