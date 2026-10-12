<template>
  <s-dialog size="sm" ref="dialog" title="ستون‌های نمایشی">
    <div class="col">
      <q-option-group
        :value="value"
        @input="$emit('input', $event)"
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
    value: Array,
  },
  computed: {},
  data: () => ({}),
  methods: {}
}
</script>

<style scoped>

</style>

