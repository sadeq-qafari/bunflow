<template>
  <div :class="`col-xs-12 col-sm-6 col-md-${property.viewSize || 4} col-lg-${property.viewSize || 3}`">
    <div class="row">
      <component class="col-12" :is="componentName" v-bind="props" v-on="events"
                 :value="model ? model.value : undefined"
                 @input="onInput"/>
    </div>
  </div>
</template>

<script>
import SFilterDate from "./SFilterDate";
import SFilterString from "./SFilterString";
import SFilterNumber from "./SFilterNumber";
import SFilterAutoComplete from "./SFilterAutoComplete";
import SFilterBoolean from "components/shared/SFilterBoolean";

export default {
  name: 'SFilterInput',
  components: {
    SFilterBoolean,
    SFilterDate,
    SFilterString,
    SFilterNumber,
    SFilterAutoComplete
  },
  props: {
    property: Object,
    model: Object | String | Number | Array,
    events: Object,
    hideLabel: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    componentName() {
      const elementType = this.property.element && this.property.element.type || this.property.type
      switch (elementType.toString()) {
        case "string":
          return 's-filter-string'
        case "int":
        case "tinyint":
        case "smallint":
        case "decimal":
        case "float":
        case "double":
        case "long":
        case "index":
          return 's-filter-number'
        case "date":
        case "datetime":
          return 's-filter-date'
        case 'lookup':
        case 'dropdown':
        case 'chips':
          return 's-filter-auto-complete'
        case 'bool':
          return 's-filter-boolean'
        default:
          return 's-filter-string'
      }
    },
    props() {
      const elementProps = JSON.parse((this.property.element && this.property.element.attributes) || '{}')
      const elementType = this.property.element && this.property.element.type || this.property.type
      switch (String(elementType)) {
        case "string":
        case "int":
        case "tinyint":
        case "smallint":
        case "decimal":
        case "float":
        case "double":
        case "long":
        case "date":
          return {
            dense: true,
            label: this.property.title,
            outlined: true,
            hideLabel: this.hideLabel
          }
        case "bool":
          return {
            label: this.property.title,
            dense: true,
            hideLabel: this.hideLabel
          }
        case 'dropdown':
        case 'chips':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title,
            hideLabel: this.hideLabel,
            url: this.property.relatedModelUrl,
          })
        case 'lookup':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title,
            hideLabel: this.hideLabel,
            options: this.property.lookupOptions.map(x => ({
              label: x.title,
              value: x.value,
              details: [x.value]
            })).sort((a, b) => b.value - a.value)
          })
        default:
          return Object.assign(elementProps, {
            dense: true,
            outlined: true,
            label: this.property.title,
            hideLabel: this.hideLabel
          })
      }
    }
  },
  data: () => ({}),
  methods: {
    onInput(val) {
      this.$emit('input', this.model && (this.model.value = val) || undefined)
    }
  },
  async mounted() {
  }
}
</script>

<style>
[dir=rtl] .q-btn-dropdown--simple .q-btn-dropdown__arrow {
  padding: 0 !important;
  margin: 0 !important;
}

[dir=rtl] .q-field--dense .q-field__before, [dir=rtl] .q-field--dense .q-field__prepend {
  padding: 0 !important;
  margin: 0 !important;
}
</style>

