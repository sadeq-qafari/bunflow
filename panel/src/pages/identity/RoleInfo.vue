<template>
  <div class="q-gutter-md q-pa-md">
    <div v-if="service && model">
      <q-card v-if="values">
        <q-card-section>
          <div class="text-bold">{{ roleId.value > 0 ? 'ویرایش' : 'افزودن' }} {{ model.title }}</div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="flex row items-start justify-start q-col-gutter-sm">
          <s-input v-for="(item,index) of components" :model="item.model" :property="item.property" ref="components"
                   :key="item.property.name" :visible="item.visible == null ? true : item.visible" @input="executeController"/>
        </q-card-section>
        <q-separator inset=""/>
        <q-card-section>
          <div class="text-bold">دسترسی ها</div>
        </q-card-section>
        <q-card-section v-if="permissionCheckList">
          <div class="">
            <q-list bordered dense>
              <q-expansion-item dense v-for="(models, service, index) in permissionCheckList" group="somegroup"  :key="index"
                                icon="local_police"
                                :label="service"
                                :header-class="['text-bold',
                                getServiceValue(models)===true?
                                'text-green':
                                getServiceValue(models)===false?
                                'text-black':'text-blue']">
                <q-card>
                  <q-card-section>
                    <div class="text-bold flex row">
                      <q-checkbox :model-value="getServiceValue(models)" @update:model-value="setServiceValue(models)" :label="service"
                                  color="indigo" class="col-3"/>
                      <q-checkbox :model-value="getServiceKeyValue(models,'create')" @update:model-value="setServiceKeyValue(models,'create')"
                                  label="allCreates" color="indigo" class="col-2"/>
                      <q-checkbox :model-value="getServiceKeyValue(models,'read')" @update:model-value="setServiceKeyValue(models,'read')"
                                  label="allReads" color="indigo" class="col-2"/>
                      <q-checkbox :model-value="getServiceKeyValue(models,'update')" @update:model-value="setServiceKeyValue(models,'update')"
                                  label="allUpdates" color="indigo" class="col-2"/>
                      <q-checkbox :model-value="getServiceKeyValue(models,'delete')" @update:model-value="setServiceKeyValue(models,'delete')"
                                  label="allDeletes" color="indigo" class="col-2"/>
                    </div>
                    <div v-for="(permissions, model, index) in models" class="full-width flex row items-center">
                      <div class="col-3">
                        <q-checkbox :model-value="getModelValue(permissions)" @update:model-value="setModelValue(permissions)" :label="model"
                                    color="blue"/>
                      </div>
                      <div v-for="(value,permission) of permissions" class="col-2">
                        <q-checkbox v-model="permissions[permission]" :label="permission" color="cyan"/>
                      </div>
                    </div>
                    <q-separator/>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </div>
        </q-card-section>
        <q-inner-loading :showing="isLoading">
          <q-spinner-dots size="50px" color="primary"/>
        </q-inner-loading>
      </q-card>

    </div>
    <div v-if="service && model">
      <q-card v-if="values">
        <q-card-section class="flex row items-start justify-between q-col-gutter-sm">
          <div class="col-12 col-md-3 flex row justify-around">
            <q-btn unelevated @click="submit" label="ثبت" color="positive" class="col-5"></q-btn>
            <q-btn unelevated @click="$navigateBack" color="secondary" label="بازگشت"
                   class="col-5"></q-btn>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import {defineComponent, ref} from 'vue'
import SDataGrid from "components/shared/SDataGrid.vue";
import SInput from "../../components/shared/SInput";

export default defineComponent({
  name: 'RoleInfo',
  components: {SInput, SDataGrid},
  data: () => ({
    serviceName: "Identity",
    modelName: "Role",
    roleId: ref(null),
    components: [],
    values: {},
    permissionCheckList: null,
    isLoading: false,
    numberInput: false,
    serviceTab: null
  }),
  meta() {
    return this.meta
  },
  computed: {
    service() {
      return this.$store.getters.getService(this.serviceName)
    },
    model() {
      return this.$store.getters.getServiceModel(this.serviceName, this.modelName)
    },
    meta() {
      return {title: (this.service && this.model && this.model.title)}
    },
    defaultFilter() {
      return [['roleId', 'in', [this.roleId.value]]]
    },
    properties() {
      let model = this.$store.getters.getServiceModel(this.serviceName, this.modelName)
      let properties = []
      if (this.roleId.value > 0) {
        properties = model.properties.filter(x => x.updatable)
      } else {
        properties = model.properties.filter(x => x.insertable)
      }
      return properties
    },
  },
  methods: {
    getModelValue(permissions) {
      let perms = []
      for (let key in permissions) {
        perms.push(permissions[key])
      }
      let res = null
      if (perms.every(x => x === true)) res = true
      if (perms.every(x => x === false)) res = false
      return res
    },
    setModelValue(permissions) {
      let status = this.getModelValue(permissions)
      if (status === true) {
        for (let key in permissions) {
          permissions[key] = false
        }
      } else {
        for (let key in permissions) {
          permissions[key] = true
        }
      }
    },
    getServiceValue(models) {
      let perms = []
      for (let mKey in models) {
        for (let pKey in models[mKey]) {
          perms.push(models[mKey][pKey])
        }
      }
      let res = null
      if (perms.every(x => x === true)) res = true
      if (perms.every(x => x === false)) res = false
      return res
    },
    setServiceValue(models) {
      let status = this.getServiceValue(models)
      if (status === true) {
        for (let mKey in models) {
          for (let pKey in models[mKey]) {
            models[mKey][pKey] = false
          }
        }
      } else {
        for (let mKey in models) {
          for (let pKey in models[mKey]) {
            models[mKey][pKey] = true
          }
        }
      }
    },
    getServiceKeyValue(models, pKey) {
      let perms = []
      for (let mKey in models) {
        perms.push(models[mKey][pKey])
      }
      let res = null
      if (perms.every(x => x === true)) res = true
      if (perms.every(x => x === false)) res = false
      return res
    },
    setServiceKeyValue(models, pKey) {
      let status = this.getServiceKeyValue(models, pKey)
      if (status === true) {
        for (let mKey in models) {
          console.log('if', status, models[mKey].hasOwnProperty(pKey))
          if (models[mKey].hasOwnProperty(pKey))
            models[mKey][pKey] = false
        }
      } else {
        for (let mKey in models) {
          console.log('else', status, models[mKey].hasOwnProperty(pKey))
          if (models[mKey].hasOwnProperty(pKey))
            models[mKey][pKey] = true
        }
      }
    },
    async submit() {
      this.isLoading = true;
      // Form Validation
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
        this.isLoading = false;
        return
      }
      // Data Object Building
      let data = {};
      for (let key in this.values) {
        data[key] = this.values[key].value
      }
      data['id'] = this.roleId?.value
      data['permissionCheckList'] = this.permissionCheckList
      // Update
      if (this.roleId?.value > 0) {
        this.$axios.put(`${process.env.API_URL}/Identity/Role`, data).then(res => {
          if (res.data.success) {
            this.load()
          }
          this.isLoading = false;
        }).catch(() => {
          this.isLoading = false;
        })
      } else { // Insert
        this.$axios.post(`${process.env.API_URL}/Identity/Role`, data).then(res => {
          if (res.data.success) {
            this.roleId = ref(res.data.result)
            this.$router.push({path: this.$route.path, query: {id: res.data.result}})
            this.load()
          }
          this.isLoading = false;
        }).catch(() => {
          this.isLoading = false;
        })
      }
    },
    load() {
      if (this.isLoading) return
      this.isLoading = true;
      let id = this.roleId?.value ?? 0
      this.$axios.get(`${process.env.API_URL}/Identity/Role/${id}`)
        .then(res => {
          this.isLoading = false;
          this.buildComponents(res.data.result)
          this.permissionCheckList = res.data.result.permissionCheckList
        }).catch(() => {
        this.isLoading = false;
      })
    },
    buildComponents(data) {
      this.properties.forEach(p => {
        const property = Object.assign({}, p)
        if (p.relatedModelProperty != null) {
          property.relatedModelPropertyModel = this.values[p.relatedModelProperty.name]
        }
        if (data) {
          this.values[p.name] = ref(data[p.name])
        } else {
          this.values[p.name] = this.getDefaultModelValue(p.element && p.element.type || p.type, p.defaultValue)
        }
        this.components.push({
          property: property,
          model: this.values[p.name],
          events: null,
          visible: true
        })
      })
      this.executeController()

    },
    getDefaultModelValue(type, defaultValue = null) {
      switch (type) {
        case 'image':
          return ref(defaultValue && JSON.parse(defaultValue) || {})
        case 'bool':
          return ref(defaultValue && defaultValue.toString().toLowerCase() === 'true' || false)
        case 'lookup':
          return ref(defaultValue && parseInt(defaultValue) || null)
        case 'dropdown':
          return ref(defaultValue && (!isNaN(defaultValue) ? parseInt(defaultValue) : defaultValue) || null)
        case 'autocomplete':
          return ref(defaultValue || null)
        default:
          return ref(defaultValue)
      }
    },
    async executeController() {
      if (this.model.controllerFn == null) return
      await this.model.controllerFn({components: this.components, axios: this.$axios, ctx: this})
    },
  },
  mounted() {
    this.roleId = ref(+this.$route.query.id)
    this.load()
  }
})
</script>

