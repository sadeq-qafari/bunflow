<template>
  <s-dialog size="sm" ref="dialog" title="ستون‌های نمایشی">
    <div class="col">
      <q-option-group
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :options="options"
        type="toggle"
      />
    </div>
  </s-dialog>
</template>

<script>
import SDialog from "./SDialog";

export default {
  name: 'SDataGridVisibleColumnsDialog',
  components: {SDialog},
  props: {
    modelValue: Array,
  },
  computed: {},
  data: () => ({}),
  methods: {}
}
</script>

<style scoped>

</style>

