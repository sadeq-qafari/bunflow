<template>
  <q-dialog
    v-model="showDialog"
    persistent
    :maximized="maximizedToggle"
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-hide="closed"
    @show="onShow"
    @hide="onHide"
  >
    <q-card class="bg-grey-2" :style="maximizedToggle ? {} : {width: width, maxWidth: width}">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon color="grey-8" name="o_turned_in_not" style="font-size: 24px;"/>
          <small>{{ title }}</small>
        </q-toolbar-title>

        <q-btn dense flat icon="fullscreen_exit" color="primary" @click="maximizedToggle = false" v-if="maximizedToggle">
          <q-tooltip v-if="maximizedToggle">کوچک نمایی</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="fullscreen" color="primary" @click="maximizedToggle = true" v-if="!maximizedToggle">
          <q-tooltip v-if="!maximizedToggle">تمام صفحه</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="close" color="negative" v-close-popup>
          <q-tooltip>بستن</q-tooltip>
        </q-btn>
      </q-toolbar>

      <q-separator color="grey-4"/>

      <q-card-section class="row q-col-gutter-sm items-start">
        <slot>
          <s-input v-for="(item,index) in components" :property="item.property" :model="item.model" @input="executeController"
                   :event="item.events" :visible="item.visible == null ? true : item.visible" :disable="item.disable"
                   ref="components" :key="index"/>
        </slot>
      </q-card-section>

      <q-card-section class="row q-pa-none">
        <slot name="extra-section" v-bind:models="models">

        </slot>
      </q-card-section>

      <q-separator color="grey-4"/>

      <q-card-section class="q-pt-none q-mt-sm q-gutter-sm">
        <slot name="actions">
          <q-btn :label="okLabel" :loading="loading" unelevated color="positive" @click="submit"/>
          <q-btn :label="cancelLabel" unelevated outline color="negative" v-close-popup/>
        </slot>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import SInput from 'components/shared/SInput'
import {ref} from "vue";

export default {
  name: 'SModelDialog',
  components: {
    SInput,
  },
  props: {
    description: String,
    size: {
      type: String,
      default: 'sm'
    },
    defaultFilters: {
      type: Array,
      default: Array
    },
    okLabel: {
      type: String,
      default: 'ثبت'
    },
    cancelLabel: {
      type: String,
      default: 'انصراف'
    },
    serviceName: String,
    modelName: String
  },
  computed: {
    service() {
      return this.$store.getters.getService(this.serviceName)
    },
    model() {
      return this.$store.getters.getServiceModel(this.serviceName, this.modelName)
    },
    controller() {
      return this.model.controllerFn
    },
    width() {
      switch (this.size) {
        case 'sm':
          return '450px';
        case 'md':
          return '750px';
        case 'lg':
          return '950px';
        case 'full':
          return '100%';
        default:
          return '450px';
      }
    }
  },
  data: () => ({
    showDialog: false,
    maximizedToggle: false,
    resolve: null,
    func: Function,
    loading: false,
    apiUrl: process.env.API_URL,
    components: [],
    title: '',
    models: {},
    initialData: {}
  }),
  methods: {
    async executeController() {
      if (this.controller == null) return
      await this.controller({components: this.components, axios: this.$axios, ctx: this})

    },
    open(func, data = {}) {
      if (Object.keys(data).length > 0) {
        this.initialData = data
      }
      this.func = func
      return new Promise((resolve, reject) => {
        this.showDialog = true
        this.resolve = resolve
      })
    },

    async submit() {
      this.loading = true;
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
      if (hasValidationError) {
        this.loading = false;
        return
      }
      let data = {}
      for (let key in this.models) {
        let dataType = this.model.properties.find(x => x.name === key).type;
        switch (dataType) {
          case 'int':
          case 'tinyint':
          case 'smallint':
          case 'bigint':
            data[key] = parseInt(this.models[key].value)
            break;
          case 'float':
          case 'double':
          case 'decimal':
          case 'money':
            data[key] = parseFloat(this.models[key].value)
            break;
          default:
            data[key] = this.models[key].value
        }
        const defaultFilter = this.defaultFilters.find(x => x[0] === key);
        if (defaultFilter) {
          data[key] = defaultFilter[2][0]
        }
      }

      const res = await this.func(data)
      if (res) {
        this.resolve(true)
        this.resolve = null
        this.showDialog = false
      }
      this.loading = false;
    },

    close() {
      this.showDialog = false
    },

    closed() {
      this.showDialog = false
      if (this.resolve != null) {
        this.resolve(false)
      }
    },
    keydown(e) {
      if (this.disableListenKey || e.repeat) return
      if (e.key === "Escape") {
        //this.close()
      } else if (e.key === "Enter" && e.ctrlKey) {
        this.submit()
      }
    },
    buildComponents() {
      this.title = this.model.title
      const properties = this.model.properties.filter(x => x.insertable)
      this.components = []
      this.models = {}
      for (let p of properties) {
        const elementType = p.element && p.element.type || p.type
        this.models[p.name] = this.getDefaultModelValue(elementType, this.initialData[p.name] && this.initialData[p.name].toString() || p.defaultValue, null)
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
          return ref(defaultValue && JSON.parse(defaultValue) || {})
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
    onShow() {
      this.buildComponents()
      this.executeController()
      this.$emit('show')
      document.addEventListener('keydown', this.keydown);
    },
    onHide() {
      this.initialData = {}
      this.$emit('hide')
      document.removeEventListener('keydown', this.keydown);
    }
  },
}
</script>

<style scoped>

</style>

