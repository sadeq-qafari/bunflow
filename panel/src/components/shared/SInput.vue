<template>
  <div v-show="visible" :class="`col-xs-12 col-sm-6 col-md-${property.viewSize || 3} col-lg-${property.viewSize || 3}`">
    <component class="full-width" :is="componentName" v-bind="props" v-on="events"
               :value="model ? getValue(model.value) : undefined" ref="component" :disable="disable"
               @input="onInput" :style="{'direction':property.isLtr?'ltr':'rtl'}" @blur="$emit('blur')"/>
  </div>
</template>

<script>
import {QInput, QBtn, QDate, QToggle, QCheckbox} from 'quasar'
import SDatePicker from 'components/shared/SDatePicker'
import SAutoComplete from 'components/shared/SAutoComplete'
import SDropDown from 'components/shared/SDropDown'
import SImage from 'components/shared/SImage'
import SInputMoney from 'components/shared/SInputMoney';
import * as moment from 'jalali-moment'
import SInputGeoLocation from "./SInputGeoLocation";
import SInputGeoPolygon from "./SInputGeoPolygon";
import SEditor from "./SEditor";
import SChips from "./SChips";
import SStringChips from "./SStringChips";
import SCodeEditor from "./SCodeEditor";
import SEditorPro from "./SEditorPro";
import SRadio from "./SRadio";
import SFilePicker from "./SFilePicker";

export default {
  name: 'SInput',
  components: {
    SFilePicker,
    SEditorPro,
    SCodeEditor,
    SStringChips,
    SChips,
    SEditor,
    QBtn,
    QDate,
    QInput,
    QToggle,
    QCheckbox,
    SImage,
    SDropDown,
    SInputMoney,
    SDatePicker,
    SAutoComplete,
    SInputGeoLocation,
    SInputGeoPolygon,
    SRadio
  },
  props: {
    property: Object,
    model: Object | String | Number | Array,
    events: Object,
    visible: {
      type: Boolean,
      default: true
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    componentName() {
      switch (this.getElementType()) {
        case 'image':
          return 's-file-picker'
        case 'bool':
          return 'q-checkbox'
        case 'lookup':
        case 'dropdown':
          return 's-auto-complete'
        case 'date':
        case 'date-datetime':
        case 'datetime':
        case 'instant':
        case 'time':
          return 's-date-picker'
        case 'money':
          return 's-input-money'
        case 'geoLocation':
          return 's-input-geo-location'
        case 'geoPolygon':
          return 's-input-geo-polygon'
        case 'textEditor':
          return 's-editor'
        case 'textEditorPro':
          return 's-editor-pro'
        case 'codeEditor':
          return 's-code-editor'
        case 'chips':
          return 's-chips'
        case 'stringChips':
          return 's-string-chips'
        case 'radio':
          return 's-radio'
        default:
          return 'q-input'
      }
    },
    props() {
      const elementProps = JSON.parse((this.property.element && this.property.element.attributes) || '{}')
      Object.assign(elementProps, {
        bottomSlots: true
      })
      switch (this.getElementType()) {
        case 'int':
        case 'float':
        case 'decimal':
        case 'tinyint':
        case 'smallint':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            outlined: true,
            type: 'number',
            rules: this.getInputRules(this.property)
          })
        case 'date':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            outlined: true,
            locale: 'fa-ir',
            type: 'date',
            instant: true,
            rules: this.getInputRules(this.property)
          })
        case 'datetime':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            outlined: true,
            type: 'datetime',
            instant: false,
            rules: this.getInputRules(this.property)
          })
        case 'date-datetime':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            outlined: true,
            type: 'date',
            instant: false,
            rules: this.getInputRules(this.property)
          })
        case 'instant':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            outlined: true,
            type: 'datetime',
            instant: true,
            rules: this.getInputRules(this.property)
          })
        case 'time':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            outlined: true,
            locale: 'fa-ir',
            type: 'time',
            rules: this.getInputRules(this.property)
          })
        case 'string':
        case 'icon':
        case 'stringChips':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            outlined: true,
            rules: this.getInputRules(this.property)
          })
        case 'bool':
          return Object.assign(elementProps, {
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            dense: true,
            class: 'q-pt-sm',
            color: 'positive',
          })
        case 'dropdown':
          let filterFn = null
          if (elementProps.url != null) {
            this.property.relatedModelUrl = process.env.API_URL + '/' + elementProps.url;
          }
          if (this.property.relatedModelPropertyModel != null) {
            filterFn = () => {
              let defaultFilters = []
              if (typeof elementProps.filters === 'string') {
                defaultFilters = JSON.parse(elementProps.filters)
              }
              const filters = defaultFilters || []
              filters.push({
                name: this.property.relatedModelProperty.name,
                value: this.property.relatedModelPropertyModel.value
              })
              return filters
            }
          }
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            url: this.property.relatedModelUrl,
            filters: filterFn || elementProps.filters,
            rules: this.getInputRules(this.property)
          })
        case 'radio':
        case 'lookup':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            options: this.property.lookupOptions.map(x => ({
              label: x.title,
              value: x.value,
              details: [x.value]
            })).sort((a, b) => b.value - a.value),
            rules: this.getInputRules(this.property)
          })
        case 'money':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            outlined: true,
            type: 'text',
            rules: this.getInputRules(this.property)
          })
        case 'geoPolygon':
        case 'geoLocation':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            outlined: true,
            rules: this.getInputRules(this.property)
          })
        case 'textEditor':
          return Object.assign(elementProps, {
            label: this.property.title + (this.property.isRequired ? '*' : ''),
          })
        case 'textEditorPro':
          return Object.assign(elementProps, {
            label: this.property.title + (this.property.isRequired ? '*' : ''),
          })
        case 'codeEditor':
          return Object.assign(elementProps, {
            label: this.property.title + (this.property.isRequired ? '*' : ''),
          })
        case 'chips':
          let filterFunc = null
          if (elementProps.url != null) {
            this.property.relatedModelUrl = process.env.API_URL + '/' + elementProps.url;
          }
          if (this.property.relatedModelPropertyModel != null) {
            filterFunc = () => {
              var defaultFilters = []
              if (typeof elementProps.filters === 'string') {
                defaultFilters = JSON.parse(elementProps.filters)
              }
              const filters = defaultFilters || []
              filters.push({
                name: this.property.relatedModelProperty.name,
                value: this.property.relatedModelPropertyModel.value
              })
              return filters
            }
          }
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            url: this.property.relatedModelUrl,
            filters: filterFunc,
            rules: this.getInputRules(this.property)
          })
        case 'textArea':
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            outlined: true,
            rules: this.getInputRules(this.property),
            counter: true
          })

        default:
          return Object.assign(elementProps, {
            dense: true,
            label: this.property.title + (this.property.isRequired ? '*' : ''),
            outlined: true,
            rules: this.getInputRules(this.property)
          })
      }
    }
  },
  data: () => ({}),
  methods: {
    focus() {
      this.$refs.component.focus()
    },
    getElementType() {
      return (this.property.element && this.property.element.type) || this.property.type
    },
    getValue(value) {
      if (this.model == null)
        return value;

      switch (this.getElementType()) {
        case "money":
          return value?.toNumber()
        default:
          return value;
      }
    },
    onInput($event) {
      if (this.model == null)
        return;
      switch (this.getElementType()) {
        case "int":
        case "tinyint":
        case 'smallint':
          this.model.value = parseInt($event)
          break;
        case "float":
        case "money":
          // DO NOT TOUCH THE OPERATORS!
          if (($event != '' && $event == 0) || !!$event) {
            this.model.value = parseFloat($event.toString().replaceAll(',', ''))
          } else {
            this.model.value = null
          }
          break;
        case "decimal":
          this.model.value = parseFloat($event)
          break;
        case "date":
        case "date-datetime":
          this.model.value = $event
          break
        case "instant":
        case "datetime":
          this.model.value = $event
          break
        case "time":
          this.model.value = $event
          break
        default:
          this.model.value = $event
      }
      this.$emit('input', $event)
    },
    getInputRules(property) {
      let rules = []
      if (property.isRequired) rules.push(val => (val === 0 || !!val) || 'الزامی است')
      if (property.validationRegex && property.validationRegex.trim().length > 0) {
        rules.push(val => new RegExp(property.validationRegex).test(val) || 'ورودی معتبر نیست')
      }
      if (this.getElementType() === 'nationalNumber') {
        rules.push(val => val === null || val.length === 0 || this.validateNationalNumber(val) || 'کد ملی معتبر نیست')
      }
      return rules
    },
    getComponent() {
      return this.$refs.component.getComponent && this.$refs.component.getComponent() || this.$refs.component
    },
    getProperty() {
      return this.property
    },
    validateNationalNumber(val) {
      if (val.length === 10) {
        if (val === '1111111111' || val === '0000000000' || val === '2222222222' || val === '3333333333' || val === '4444444444' || val === '5555555555' || val === '6666666666' || val === '7777777777' || val === '8888888888' || val === '9999999999') {
          return false;
        }
        let c = parseInt(val.charAt(9));
        let n = parseInt(val.charAt(0)) * 10 + parseInt(val.charAt(1)) * 9 + parseInt(val.charAt(2)) * 8 + parseInt(val.charAt(3)) * 7 + parseInt(val.charAt(4)) * 6 + parseInt(val.charAt(5)) * 5 + parseInt(val.charAt(6)) * 4 + parseInt(val.charAt(7)) * 3 + parseInt(val.charAt(8)) * 2;
        let r = n - parseInt(n / 11) * 11;
        return (r === 0 && r === c) || (r === 1 && c === 1) || (r > 1 && c === 11 - r);
      } else {
        return false;
      }
    }
  },
  async mounted() {
  }
}
</script>

<style scoped>

</style>

