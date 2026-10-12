<template>
  <div class="row">
    <!-- loading state -->
    <q-skeleton v-if="loading" type="rect" class="col bg-grey-3" height="40px"/>

    <component v-else class="col" :is="property.componentName" v-bind="props" v-on="events"/>
  </div>
</template>

<script>
import FInput from "./FInput";
import FDropdown from "./FDropdown";
import {QInput, QBtn, QDate, QToggle, QCheckbox} from 'quasar'
import FMoneyInput from "./FMoneyInput";
import FMultiDropdown from "./FMultiDropdown";

export default {
  name: "FFormProperty",
  components: {FMultiDropdown, FMoneyInput, FDropdown, FInput, QInput, QBtn, QDate, QToggle, QCheckbox},
  data: () => ({
    formProperty: {},
    formProps: {},
    events: {}
  }),
  computed: {
    property() {
      return {
        ...this.formProperty,
      }
    },
    props() {
      return {
        ...this.formProps,
        loading: this.loading,
        value: this.getValue(this.value),
      }
    }
  },
  props: {
    propertyId: Number,
    value: Object | String | Number | Array | Boolean | null,
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getValue(val) {
      switch (this.property?.element?.componentName) {
        case 'q-checkbox':
          return val?.toString().toLowerCase() == 'true'
        case 'f-input':
          return val
        case 'f-multi-dropdown':
        case 'f-dropdown':
          return val
        default:
          return val
      }
    },
    buildProperty() {
      let property = this.$store.getters.getFormProperty(this.propertyId)
      let elementConfig = {}
      if (property.element?.config) {
        elementConfig = JSON.parse(property.element.config)
      }

      this.formProperty = {
        ...property,
        componentName: property.element.componentName
      }

      this.formProps = {
        label: property.title,
        dense: true,
        outlined: true,
        ...this.getElementProps(),
        ...elementConfig
      }
      this.events = {
        input: (val) => this.onInput(val),
        ...this.getElementEvents()
      }
    },
    getElementProps() {
      let defaultProps = {
        // some default props for every element
      }
      switch (this.property.element.componentName) {
        case 'f-input':
          return {
            ...defaultProps
          }
        case 'f-multi-dropdown':
        case 'f-dropdown':
          return {
            ...defaultProps,
            formName: this.property.relatedFormName,
            lookup: this.property.lookup
          }
        case 'f-money-input':
          return {
            ...defaultProps,
          }
        default:
          return defaultProps
      }
    },
    getElementEvents() {
      return {}
    },

    onInput(val) {
      // console.log('input', val)
      this.$emit('input', val)
    }
  },
  mounted() {
    this.buildProperty()

  }
}
</script>

<style scoped>

</style>

