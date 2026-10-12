<template>
  <div class="row full-width justify-between align-items-center">
    <q-input :label="hideLabel?undefined:label" :outlined="outlined" :placeholder="placeholder" :dense="dense"
             :debounce="500" :value="value.value[0]" @input="update(0, $event)"
             :class="value.type.includes('between') ? 'col-6' : 'col-12'">
      <template v-slot:prepend>
        <q-tooltip>{{ filterLabel }}</q-tooltip>
        <q-btn-dropdown size="xs" :dropdown-icon="filterIcon" unelevated stretch padding="0px" dense style="right: -12px;
    border-radius: 3px !important; border-left: 1px solid silver">
          <q-list>
            <q-item class="items-center" dense clickable v-close-popup v-for="op in operands" @click="updateOperand(op[0])"
                    :key="op[0]">
              <q-item-label>
                <q-icon :name="op[2]"/>&nbsp;{{ op[1] }}
              </q-item-label>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>
    </q-input>
    <div v-if="value.type.includes('between')" class="col-1 text-center text-black">تا</div>
    <q-input v-if="value.type.includes('between')" :label="label" :outlined="outlined" :placeholder="placeholder" :dense="dense"
             :value="value.value[1]" @input="update(1, $event)"
             :class="value.type.includes('between') ? 'col-5' : 'col-12'"/>
  </div>
</template>

<script>
export default {
  name: 'SFilterNumber',
  props: {
    rules: Array,
    dense: Boolean,
    outlined: Boolean,
    placeholder: String,
    label: String,
    hideLabel: {
      type: Boolean,
      default: false
    },
    value: null
  },
  computed: {
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
    updateOperand(operand) {
      let exists = this.operands.find(x => x[0] === operand) != null;
      if (!exists) operand = this.operands[0]
      this.value.type = operand
      this.update(0, this.value.value[0])
    },
    update(index, newValue) {
      this.$set(this.value.value, index, parseFloat(newValue) || 0)
      let isOperandValid = this.operands.find(x => x[0] === this.value.type)
      if (!isOperandValid) this.value.type = this.operands[0][0]
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

