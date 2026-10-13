<template>
  <q-input :model-value="moneyValue" class="col" v-bind="$attrs" outlined dense @update:model-value="onInput($event)"
           @click="selectItem()"/>
</template>

<script>
export default {
  name: "FMoneyInput",
  props: {
    modelValue: Object | null
  },
  computed: {
    moneyValue() {
      return this.modelValue?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || ''
    }
  },
  methods: {
    selectItem() {
      this.$emit('select-item')
    },
    onInput(event) {
      this.$emit('update:modelValue', event?.split(',').join(''))
    }
  }
}
</script>

<style scoped>
.border-medium {
  border: 2px solid lightgrey;
}
</style>

