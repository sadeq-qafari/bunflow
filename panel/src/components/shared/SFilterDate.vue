<template>
  <div>
    <q-input mask="####/##/##" :label="hideLabel?undefined:label" :outlined="outlined" :placeholder="placeholder" :dense="dense" :rules="rules"
             :model-value="date1" @update:model-value="update(0, $event)" input-style="padding:0">
      <template v-slot:prepend>
        <div class="flex row full-height items-stretch">
          <div>
            <q-tooltip>{{ filterLabel }}</q-tooltip>
            <q-btn-dropdown size="xs" class="full-height" :dropdown-icon="filterIcon" unelevated stretch padding="0"
                            dense style="right: -12px; border-radius: 3px !important; border-left: 1px solid silver">
              <q-list>
                <q-item class="items-center" dense clickable v-close-popup v-for="op in operands" @click="updateOperand(op[0])"
                        :key="op[0]">
                  <q-item-label>
                    <q-icon :name="op[2]"/>&nbsp;{{ op[1] }}
                  </q-item-label>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
          <div>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date :calendar="locale.toLowerCase() === 'fa-ir' ? 'persian' : 'english'" :model-value="date1"
                        @update:model-value="update(0, $event)" mask="####/##/##">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="بستن" color="primary" flat/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </div>
        </div>

      </template>
    </q-input>
    <q-input v-if="value.type.includes('between')" mask="####/##/##" :label="label" :outlined="outlined"
             :placeholder="placeholder" :dense="dense" :rules="rules"
             :model-value="date2" @update:model-value="update(1, $event)">
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-date :calendar="locale.toLowerCase() === 'fa-ir' ? 'persian' : 'english'" :model-value="date2"
                    @update:model-value="update(1, $event)" mask="####/##/##">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="بستن" color="primary" flat/>
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script>
export default {
  name: 'SFilterDate',
  props: {
    rules: Array,
    dense: Boolean,
    outlined: Boolean,
    placeholder: String,
    label: String,
    locale: {
      type: String,
      required: false,
      default: 'fa-ir'
    },
    hideLabel: {
      type: Boolean,
      default: false
    },
    value: null
  },
  computed: {
    date1() {
      return this.value && this.value.value && this.value.value.length > 0 && this.value.value[0]?.toJalaliDateTime()
    },
    date2() {
      return this.value && this.value.value && this.value.value.length > 0 && this.value.value[1]?.toJalaliDateTime()
    },
    filterLabel() {
      const op = this.operands.find(x => x[0] === this.value.type)
      return !op ? 'نامشخص' : op[1]
    },
    filterIcon() {
      let op = this.operands.find(x => x[0] === this.value.type)
      if (!op) {
        this.value.type = this.operands[0][0]
        op = this.operands[0]
      }
      return !op ? 'warning' : op[2]
    }
  },
  data() {
    return {
      operands: [['=', 'مساوی', 'drag_handle'], ['!=', 'نامساوی', 'code'], ['<', 'کوچک‌تر', 'navigate_before'], ['>', 'بزرگ‌تر', 'navigate_next'], ['between', 'داخل محدوده', 'vertical_align_center'], ['not between', 'خارج محدوده', 'height']]
    }
  },
  methods: {
    clearDate(index) {
      console.log('value=', this.value)
      //this.value.value.splice(index, 1)
      this.update(index, "")
    },
    updateOperand(operand) {
      let exists = this.operands.find(x => x[0] === operand) != null;
      if (!exists) operand = this.operands[0]
      this.value.type = operand
      this.$emit('input', this.value)
      //this.update(0, this.value.value[0])
    },
    update(index, newValue) {
      this.$set(this.value.value, index, newValue?.toGregorianDate())
      this.$emit('input', this.value)
    }
  },
  mounted() {
    if (!this.operands.find(x => x[0] === this.value.type)) {
      this.value.type = this.operands[0][0]
    }
  }
}
</script>

<style scoped>

</style>

