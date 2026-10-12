<template>
  <q-input v-else :value="value" class="col" v-bind="$attrs" outlined dense @input="onInput($event)"
           @click="selectItem()"/>
</template>

<script>
export default {
  name: "FInput",
  props: {
    value: Object | null
  },
  methods: {
    selectItem() {
      this.$emit('select-item')
    },
    onInput(event) {
      this.$emit('input', event)
    }
  }
}
</script>

<style scoped>
.border-medium {
  border: 2px solid lightgrey;
}
</style>

