<template>
  <div>
    <q-input dir="ltr" v-bind="$attrs" :model-value="getValue(value)" @update:model-value="onInput" :borderless="borderless" :dense="dense"
             :bottom-slots="bottomSlots">
      <template v-if="bottomSlots" v-slot:hint>
        {{ num2persian(value) }}
      </template>
    </q-input>
  </div>
</template>

<script>
import Num2persian from 'num2persian'

export default {
  name: 'SInputMoney',
  props: {
    value: String | Number | null,
    bottomSlots: {type: Boolean, default: true},
    borderless: Boolean,
    dense: Boolean,
    currencyCode: {type: String, default: 'IRR'},
  },
  computed: {
    currency() {
      switch (this.currencyCode) {
        case 'IRR':
          return {
            unit1: ' تومان',
            unit2: ' ریال',
            modVal: 10,
            decimalPlaces: 0
          }
        case 'USD': {
          return {
            unit1: ' دلار',
            unit2: ' سنت',
            modVal: 1,
            decimalPlaces: 2
          }
        }
        case 'EUR': {
          return {
            unit1: ' یورو',
            unit2: ' سنت',
            modVal: 1,
            decimalPlaces: 2
          }
        }
      }
    },
  },
  data: () => ({}),
  methods: {
    getValue(value) {
      if (value == null)
        return null;
      return value.toNumber()
    },
    onInput($event) {
      // DO NOT TOUCH THE OPERATORS!
      if (($event != '' && $event == 0) || !!$event) {
        const money = parseFloat($event.toString().replaceAll(',', ''))
        this.$emit('input', isNaN(money) ? null : Math.round(money * Math.pow(10, this.currency.decimalPlaces)) / Math.pow(10, this.currency.decimalPlaces))
      } else {
        this.$emit('input', null)
      }
    },
    num2persian(num) {
      if (num == null) return null
      num = parseFloat(num.toString().replaceAll(',', ''))
      if (num < 10) return null

      let str = Num2persian(Math.floor(num / this.currency.modVal)) + this.currency.unit1
      const mod = (num * 100 % (this.currency.modVal * 100)) / (100 / Math.pow(10, this.currency.decimalPlaces))
      if (mod > 0) str += ' و ' + Num2persian(mod) + this.currency.unit2

      return str
    }
  },
  async mounted() {
  }
}
</script>

<style scoped>

</style>

