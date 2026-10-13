<template>
  <q-input :model-value="modelValue" class="col" v-bind="$attrs" outlined dense @update:model-value="onInput($event)"
           @click="selectItem()"/>
</template>

<script>
export default {
  name: "FInput",
  props: {
    modelValue: Object | null
  },
  methods: {
    selectItem() {
      this.$emit('select-item')
    },
    onInput(event) {
      this.$emit('update:modelValue', event)
    }
  }
}
</script>

<style scoped>
.border-medium {
  border: 2px solid lightgrey;
}
</style>

