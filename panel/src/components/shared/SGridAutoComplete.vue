<template>
  <q-select :id="id" ref="autoComplete" :value="valueObject" :options="filteredOptions" v-bind="$attrs"
            transition-show="jump-down" transition-hide="jump-up" input-debounce="0" fill-input hide-selected use-input
            borderless dense @filter="filterFnAutoSelect" @input="setValue" @clear="$emit('input',null)"
            virtual-scroll-slice-ratio-before="10" virtual-scroll-sticky-size-start="30"
            options-selected-class="bg-primary text-white" @keyup.enter="$emit('onEnterKey', $event)"
            @keyup="checkBackspace($event)"
  >

    <!-- header -->
    <template v-slot:before-options>
      <div class="header">

        <div class="row bg-grey-1" style="width: 600px">

          <!-- code -->
          <div class="row col-2 q-px-md q-py-xs justify-center text-subtitle2 text-weight-regular">
            کد
          </div>

          <q-separator vertical/>

          <!-- account -->
          <div class="row col q-px-md q-py-xs justify-center text-subtitle2 text-weight-regular">
            معین
          </div>

          <q-separator vertical/>

          <!-- general account -->
          <div class="row col q-px-md q-py-xs justify-center text-subtitle2 text-weight-regular">
            کل
          </div>

        </div>

        <q-separator/>

      </div>
    </template>

    <!-- options -->
    <template v-slot:option="scope">
      <q-item :class="['no-padding', scope.index > 0 ? 'q-virtual-scroll--with-prev' : undefined]" style="width: 600px"
              v-bind="scope.itemProps"
              v-on="scope.itemEvents" dense>
        <div class="row full-width">

          <!-- code -->
          <div class="row col-2 q-px-md q-py-xs justify-center text-subtitle2 text-weight-light">
            {{ scope.opt.code }}
          </div>

          <q-separator vertical/>

          <!-- account title -->
          <div class="row col q-px-md q-py-xs justify-center text-subtitle2 text-weight-light">
            {{ scope.opt.accountTitle }}
          </div>

          <q-separator vertical/>

          <!-- general account title -->
          <div class="row col q-px-md q-py-xs justify-center text-subtitle2 text-weight-light">
            {{ scope.opt.generalAccountTitle }}
          </div>

        </div>
      </q-item>
      <q-separator/>
    </template>

  </q-select>
</template>

<script>
export default {
  name: "SGridAutoComplete",
  props: {
    value: Number | null,
    options: Array | null
  },
  data: () => ({
    filteredOptions: [],
    id: Math.random()
  }),
  computed: {
    valueObject() {
      return this.options.find(item => item.value == this.value)
    }
  },
  methods: {
    filterFnAutoSelect(val, update, abort) {
      update(() => {
        if (val === '') {
          this.filteredOptions = this.options
        } else {
          this.filteredOptions = this.options.filter(item =>
            item.code.toString().startsWith(val) ||
            item.generalAccountTitle.indexOf(val) > -1 ||
            item.accountTitle.indexOf(val) > -1)
        }
      })
      setTimeout(() => {
        if (val?.length > 0) {
          this.$refs.autoComplete.setOptionIndex(-1)
          this.$refs.autoComplete.moveOptionSelection(1, true)
        }
      }, 100)
    },
    checkBackspace(event) {
      if (event.key === 'Backspace') {
        this.$emit('input', null)
      }
    },
    setValue(event) {
      this.$emit('input', event.accountId)
    },
    focus() {
      this.$refs.autoComplete.focus()
    }
  },
  mounted() {
    this.filteredOptions = Object.freeze(this.options)
  }
}
</script>

<style scoped>
.header {
  z-index: 3;
  position: sticky;
  top: 0;
}
</style>

