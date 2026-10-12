<template>
  <q-card v-bind="$attrs" v-if="service && model">
    <q-card-section class="row q-mt-none q-col-gutter-sm items-start q-pa-none">
      <s-input v-for="(item,index) in components" :property="item.property" :model="item.model" @input="onInput"
               :event="item.events" :visible="item.visible == null ? true : item.visible" :disable="item.disable"
               ref="components" :key="index"/>
      <slot name="fields-append"/>
    </q-card-section>

    <q-card-section class="row q-pa-none">
      <slot/>
    </q-card-section>
  </q-card>
</template>

<script>
import SInput from 'components/shared/SInput'
import {ref} from "@vue/composition-api";

export default {
  name: 'SModelComponent',
  components: {
    SInput,
  },
  props: {
    value: Object | null,
    serviceName: String,
    modelName: String,
    defaultFilters: {
      type: Array,
      default: Array
    },
  },
  computed: {
    controller() {
      return this.model.controllerFn
    },
  },
  data: () => ({
    resolve: null,
    func: Function,
    loading: false,
    apiUrl: process.env.API_URL,
    components: [],
    models: {},
    initialData: {},
    service: null,
    model: null
  }),
  methods: {
    async validate() {
      let hasValidationError = false;
      for (let component of this.$refs.components || []) {
        const cmp = component.getComponent()
        if (cmp.validate && !(await cmp.validate())) {
          hasValidationError = true
          this.$q.notify({
            type: 'negative',
            message: 'خطای اعتبارسنجی',
            caption: component.getProperty().title
          })
        }
      }
      return !hasValidationError;
    },
    onInput() {
      this.executeController()
      this.$emit('input', this.components.map(x => ({label: x.property.name, value: x.model.value}))
        .reduce((result, current) => {
          result[current.label] = current.value
          return result
        }, {}))
    },
    async executeController() {
      if (this.controller == null) return
      await this.controller({components: this.components, axios: this.$axios, ctx: this})
    },
    buildComponents() {
      const properties = this.model.properties.filter(x => x.insertable)
      this.components = []
      this.models = {}
      for (let p of properties) {
        const elementType = p.element && p.element.type || p.type
        if (Object.keys(this.initialData).includes(p.name)) {
          this.models[p.name] = this.getDefaultModelValue(elementType, this.initialData[p.name], null)
        } else {
          this.models[p.name] = this.getDefaultModelValue(elementType, p.defaultValue, null)
        }
        const defaultFilter = this.defaultFilters.find(x => x[0] === p.name);
        if (defaultFilter) {
          this.models[p.name] = ref(defaultFilter[2][0])
        }
      }

      for (let p of properties) {
        const property = Object.assign({}, p)
        if (p.relatedModelProperty != null) {
          property.relatedModelPropertyModel = this.models[p.relatedModelProperty.name]
        }
        const defaultFilter = this.defaultFilters.find(x => x[0] === property.name);
        this.components.push({
          property: property,
          visible: defaultFilter == null,
          model: this.models[p.name],
          events: null
        })
      }
    },
    getDefaultModelValue(type, defaultValue = null, filterValue = null) {
      switch (type) {
        case 'image':
          return ref(defaultValue && (typeof defaultValue == "string" ? JSON.parse(defaultValue) : defaultValue) || {})
        case 'bool':
          if (filterValue && typeof filterValue.value.value[0] === 'boolean') return ref(filterValue.value.value[0])
          return ref(defaultValue && defaultValue.toString().toLowerCase() === 'true' || false)
        case 'radio':
        case 'lookup':
          if (filterValue && typeof filterValue.value.value[0] === 'number') return ref(filterValue.value.value[0])
          return ref(defaultValue && parseInt(defaultValue) || null)
        case 'dropdown':
          return ref(defaultValue && (!isNaN(defaultValue) ? parseInt(defaultValue) : defaultValue) || filterValue?.value.value[0] || null)
        case 'autocomplete':
          return ref(defaultValue || null)
        default:
          return ref(filterValue && filterValue.value.value[0] || defaultValue)
      }
    },
  },
  watch: {
    value(to, from) {
      if (to != null)
        this.components.forEach(cmp => {
          cmp.model = ref(to[cmp.property.name])
        })
    }
  },
  beforeMount() {
    this.initialData = this.value || {}
  },
  async mounted() {
    this.service = await this.$store.getters.getService(this.serviceName)
    this.model = await this.$store.getters.getServiceModel(this.serviceName, this.modelName)
    this.buildComponents()
    this.executeController()
  },
  beforeDestroy() {
    this.initialData = {}
  }
}
</script>

<style scoped>

</style>

