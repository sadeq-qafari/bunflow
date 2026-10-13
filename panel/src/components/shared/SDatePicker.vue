<template>
  <div class="row justify-start">
    <q-input v-if="showDatePicker" v-bind="$attrs" :model-value="dateValue" @update:model-value="onInputDate" mask="date"
             :label="dateLabel"
             :input-style="{direction: 'ltr !important',textAlign:'right'}" ref="dateInput"
             @focusout="refresh('date')"
             :rules="[val => isValidDate || 'تاریخ به درستی وارد نشده است'].concat(rules || [])"
             :class="dateClass">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy ref="qDateProxy" transition-show="jump-down" transition-hide="jump-up" anchor="bottom end"
                         self="top start">
            <q-date calendar="persian" :model-value="dateValue" @update:model-value="onInputDate" :target="$refs.dateInput"
                    :options="limitDate"/>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-input v-if="showTimePicker" v-bind="$attrs" :model-value="timeValue" @update:model-value="onInputTime" mask="time"
             :label="timeLabel" :class="timeClass"
             @focusout="refresh('time')" :input-style="{direction: 'ltr !important',textAlign:'right'}"
             :rules="type === 'time'? rules :[val=> val === '' || !!val || 'ساعت به درستی وارد نشده است']"
             @clear="clearValue"/>
  </div>
</template>

<script>
import * as moment from 'jalali-moment'

export default {
  name: "SDatePicker",
  data: () => ({
    moment,
    isValidDate: true
  }),
  props: {
    value: String | null,
    type: {
      type: String,
      default: 'date',
      validator: function (value) {
        return ['date', 'time', 'datetime'].indexOf(value) !== -1
      }
    },
    label: String | null,
    rules: Array | null,
    instant: {
      type: Boolean,
      default: true
    },
    minDate: String | null | undefined,
    maxDate: String | null | undefined,
  },
  computed: {

    dateClass() {
      switch (this.type) {
        case 'date':
          return 'col-12'
        case 'datetime':
          return 'col-8 q-pr-sm'
      }
    },
    timeClass() {
      switch (this.type) {
        case 'time':
          return 'col-12'
        case 'datetime':
          return 'col-4'
      }
    },
    // isValidDate() {
    //   let res = true
    //   if (this.rules) {
    //     this.rules.forEach(rule => {
    //       if (rule(this.value) !== true) {
    //         res = false
    //       }
    //     })
    //   }
    //   if (!(this.value === '' || this.value == null || moment(this.value).isValid())) res = false
    //   return res
    // },
    dateLabel() {
      switch (this.type) {
        case 'date':
          return this.label
        case 'datetime':
          return `تاریخ ${this.label}`
      }
    },
    timeLabel() {
      switch (this.type) {
        case 'time':
          return this.label
        case 'datetime':
          return `ساعت ${this.label}`
      }
    },
    showDatePicker() {
      return ['date', 'datetime'].indexOf(this.type) !== -1
    },
    showTimePicker() {
      return ['time', 'datetime'].indexOf(this.type) !== -1
    },
    dateValue() {
      return this.g2j(this.value)
    },
    timeValue() {
      switch (this.type) {
        case 'time':
          return this.value || '';
        case 'datetime':
          return this.value?.length > 0 ? `${this.value}${'0000/00/00 00:00:00'.substring(this.value?.length || 0, 19)}`?.substr(11) : '';
      }
    }
  },
  methods: {
    limitDate(date) {
      if (this.minDate == null && this.maxDate == null) {
        return true
      }
      if (this.minDate) {
        if (moment(this.j2g(date)).diff(moment(this.minDate)) < 0) return false
      }
      if (this.maxDate) {
        if (moment(this.j2g(date)).diff(moment(this.maxDate)) > 0) return false
      }
      return true
    },

    validateTheDate(date) {
      try {
        this.isValidDate = moment.from(date, 'fa-ir', 'jYYYY/jMM/jDD').isValid() || date === ''
      } catch (e) {
        this.isValidDate = false
      }
    },
    clearValue() {
      this.$emit('input', '')
    },
    refresh(type) {
      let val = this.value
      switch (type) {
        case 'date':
          if (moment(val).isValid()) {
            this.$emit('input', `1970-01-01 ${this.timeValue}`)
            setTimeout(() => {
              this.$emit('input', val)
            }, 1)
          }
          break
        case 'time':
          this.$emit('input', '')
          setTimeout(() => {
            this.$emit('input', val)
          }, 1)
          break
      }
    },
    onInput(val, type) {
      switch (this.type) {
        case 'date':
          this.$emit('input', `${val}${this.instant ? ' ' : 'T'}00:00:00`)
          break
        case 'time':
          this.$emit('input', val?.length > 1 ? `${val}${'00:00:00'.substring(val?.length || 0, 8)}` : '')
          break
        case 'datetime':
          switch (type) {
            case 'date':
              this.$emit('input', val?.length > 1 ? `${val || '          '}${this.instant ? ' ' : 'T'}${this.value?.length > 11 && this.value?.substring(11) + ':00' || ''}` : '')
              break
            case 'time':
              this.$emit('input', `${this.value?.substring(0, 10)}${this.instant ? ' ' : 'T'}${val}${'00:00:00'.substring(val?.length || 0, 8)}`)
              break
          }
          break

      }
    },
    onInputDate(e) {
      this.validateTheDate(e)
      this.onInput(this.j2g(e), 'date')
      this.$refs.qDateProxy.hide()
    },
    onInputTime(e) {
      this.onInput(e, 'time')
    },
    j2g(val) {
      if (moment.from(val, 'fa-ir', 'jYYYY/jMM/jDD').isValid())
        return moment
          .from(val, 'fa-ir', 'jYYYY/jMM/jDD').locale('en-us').format('YYYY-MM-DD').trim()
      else return ''
    },
    g2j(val) {
      if (moment(val).isValid())
        return moment(val).format('jYYYY/jMM/jDD').trim()
      else return ''
    },
    validate() {//TODO: separate validations for types
      return this.$refs.dateInput?.validate() || true
    },
    getComponent() {
      return this.$refs.dateInput
    },
    resetValidation() {
      this.$refs.dateInput.resetValidation()
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>

