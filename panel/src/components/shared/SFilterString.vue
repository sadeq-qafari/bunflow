<template>
  <q-input :label="hideLabel?undefined:label" :outlined="outlined" :placeholder="placeholder" :dense="dense"
           :debounce="500" v-model="value.value[0]" @input="update(0, $event)" input-style="padding:0">
    <template v-slot:prepend>
      <q-tooltip>{{ filterLabel }}</q-tooltip>
      <q-btn-dropdown size="xs" class="q-pr-none" :dropdown-icon="filterIcon" unelevated stretch padding="0px" dense style="right: -12px;
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
</template>

<script>
export default {
  name: 'SFilterString',
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
      let op = this.operands.find(x => x[0] === this.value.type)
      if (!op) {
        this.value.type = this.operands[0][0]
        op = this.operands[0]
      }
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
      operands: [['like', 'شامل', 'search'], ['=', 'مساوی', 'drag_handle'], ['!=', 'نامساوی', 'code']]
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
      let isOperandValid = this.operands.find(x => x[0] === this.value.type)
      if (!isOperandValid) this.value.type = this.operands[0][0]
      console.log('string filter:',this.value)
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

<style>

</style>

