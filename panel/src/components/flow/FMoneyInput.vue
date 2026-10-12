<template>
  <q-input v-else :value="moneyValue" class="col" v-bind="$attrs" outlined dense @input="onInput($event)"
           @click="selectItem()"/>
</template>

<script>
export default {
  name: "FMoneyInput",
  props: {
    value: Object | null
  },
  computed: {
    moneyValue() {
      return this.value?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || ''
    }
  },
  methods: {
    selectItem() {
      this.$emit('select-item')
    },
    onInput(event) {
      this.$emit('input', event?.split(',').join(''))
    }
  }
}
</script>

<style scoped>
.border-medium {
  border: 2px solid lightgrey;
}
</style>

