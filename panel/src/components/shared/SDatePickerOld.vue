<template>
  <div class="flex row justify-start">
    <q-input :label="label" :outlined="outlined" :borderless="borderless" :placeholder="placeholder" :dense="dense"
             :rules="rules" ref="component"
             :value="dateModel && dateModel.substring(0, 10)" @input="onInputManual($event,'date')"
             :class="['col-12', type==='datetime' && 'col-sm-6']"
             v-if="type==='datetime' || type==='date'" clearable @clear="$emit('input',null)" v-bind="$attrs">
      <template v-slot:prepend v-if="type==='datetime' || type==='date'">
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale" ref="datePicker">
            <q-date :calendar="locale.toLowerCase() == 'fa-ir' ? 'persian' : 'english'" :value="dateModel"
                    @input="onInput($event,'date')">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="بستن" color="primary" flat/>
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-input :label="label" :outlined="outlined" :borderless="borderless" :placeholder="placeholder" :dense="dense"
             :rules="rules"
             :value="timeModel" @input="onInputManual($event,'time')" ref="component" v-bind="$attrs"
             :class="['col-12', type==='datetime' && 'col-sm-6']" clearable @clear="$emit('input',null)"
             v-if="type==='datetime' || type==='time'">
      <template v-slot:prepend v-if="type==='datetime' || type==='time'">
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale" ref="timePicker">
            <q-time :value="dateModel" @input="onInput($event,'time')" mask="YYYY-MM-DD HH:mm:ss" format24h>
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="بستن" color="primary" flat/>
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>

</template>


<script>
import * as moment from 'jalali-moment'

export default {
  name: 'SDatePickerOld',
  props: {
    rules: Array,
    dense: Boolean,
    outlined: Boolean,
    borderless: Boolean,
    placeholder: String,
    label: String,
    locale: {
      type: String,
      required: false,
      default: 'fa-ir'
    },
    value: null,
    type: String,
    dataType: {
      type: String,
      required: false,
      default: 'string'
    },
  },
  computed: {
    dateModel() {
      if (this.type === 'date' || this.type === 'datetime') {
        return this.value?.toJalaliDateTime()
      }
    },
    timeModel() {
      if (this.value) {
        if (this.type === 'time') {
          return moment.from(this.value, 'en', 'HH:mm:ss').clone().format('HH:mm')
        }
        if (this.type === 'datetime') {
          return moment.from(this.value, 'en').clone().format('HH:mm:ss')
        }
      }
    }
  },
  methods: {
    onInput($event, type) {
      if (type === 'date') {
        if ($event) {
          this.$emit('input', (($event.substring(0, 10) + ' 00:00:00').toGregorianDateTime() || this.value.toGregorianDateTime()))
        }
        this.$refs.datePicker.hide()
      } else {
        if ($event) {
          if (this.type === 'datetime') {
            this.$emit('input', moment(this.value.substring(0, 10) + $event.substring(10)).clone().format('YYYY-MM-DD HH:mm:ss'))
          }
          if (this.type === 'time') {
            this.$emit('input', $event.substring(11))
          }
        }
        this.$refs.timePicker.hide()
      }
    },
    onInputManual($event, type) {
      if (type === 'date' && $event?.length === 10)
        this.$emit('input', (($event.substring(0, 10) + this.timeModel).toGregorianDateTime() || this.value.toGregorianDateTime()))
      else if (type === 'time') {
        if ($event?.length === 4) {
          this.$emit('input', moment(this.value.substring(0, 11) + $event.substring(0, 2) + ':' + $event.substring(2, 4)).clone().format('YYYY-MM-DD HH:mm:ss'))
        } else if ($event?.length === 5) {
          this.$emit('input', moment(this.value.substring(0, 11) + $event).clone().format('YYYY-MM-DD HH:mm:ss'))
        }
      }
    },
    getComponent() {
      return this.$refs.component
    },
  }
}
</script>

<style scoped>

</style>

