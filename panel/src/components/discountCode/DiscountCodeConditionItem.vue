<template>
  <div class="row full-width bg-grey-2 border-radius q-pa-md q-gutter-x-md items-center">

    <!-- target -->
    <div class="col-2 q-ml-none">
      <s-auto-complete v-model="detailItem.modelId" class="bg-white" :url="`${baseUrl}/crm/discountModelProperty/model`"
                       label="هدف" dense
                       @input="save"/>
    </div>

    <!-- property -->
    <div class="col-2">
      <s-auto-complete v-model="detailItem.modelPropertyId" class="bg-white"
                       :url="`${baseUrl}/crm/discountModelProperty`"
                       label="ویژگی" :filters="[{name: 'modelId', value: detailItem.modelId}]"
                       dense @input="save"/>
    </div>

    <!-- properties selection -->
    <div class="col">
            <s-chips v-if="detailItem && detailItem.modelId && detailItem.modelPropertyId && modelProperty" v-model="detailItem.propertySelectedOptions"
                     v-bind="modelProperty"
                     bg-color="white" @input="save"/>
    </div>

    <!-- delete -->
    <div class="col-auto items-center">
      <div>
        <q-btn class="rounded-borders" size="12px" color="pink-2" text-color="pink-7" icon="delete" unelevated
               dense @click="deleteItem"/>
      </div>
    </div>

  </div>
</template>

<script>
import SAutoComplete from "../shared/SAutoComplete";
import SChips from "../shared/SChips";
import SInput from "../shared/SInput";
import {ref} from "vue";

export default {
  name: "DiscountCodeConditionItem",
  components: {SInput, SAutoComplete, SChips},
  props: {
    value: Object | null
  },
  data: () => ({
    baseUrl: process.env.API_URL,
    detailItem: null,
    error: null,
    validation: false,
    hasErrors: false
  }),
  computed: {
    modelProperty() {
      let mp = Object.assign({}, this.$store.getters.getModelProperty(this.detailItem.modelId, this.detailItem.modelPropertyId), {
        type: 'chips', element:
          {
            attributes: "{}",
            id: 0,
            name: "chips",
            type: "chips"
          }
      })
      const elementProps = JSON.parse((mp.element && mp.element.attributes) || '{}')
      let filterFunc = null
      if (elementProps.url != null) {
        mp.relatedModelUrl = process.env.API_URL + '/' + elementProps.url;
      }
      if (mp.relatedModelPropertyModel != null) {
        filterFunc = () => {
          let defaultFilters = []
          if (typeof elementProps.filters === 'string') {
            defaultFilters = JSON.parse(elementProps.filters)
          }
          const filters = defaultFilters || []
          filters.push({
            name: mp.relatedModelProperty.name,
            value: mp.relatedModelPropertyModel.value
          })
          return filters
        }
      }
      return Object.assign(elementProps, {
        dense: true,
        label: mp.title + (mp.isRequired ? '*' : ''),
        url: mp.relatedModelUrl,
        options: mp.lookupOptions ? mp.lookupOptions.map(x=>({label:x.title,value:x.value})) : [],
        filters: filterFunc,
        rules: undefined
      })
    },
  },
  methods: {
    async validate() {
      this.hasErrors = false
      let errors = []

      // target
      if (!this.detailItem.modelId) {
        this.hasErrors = true
        this.detailItem.modelPropertyId = null
        errors.push('هدف')
      }

      // property
      if (!this.detailItem.modelPropertyId) {
        this.hasErrors = true
        errors.push('ویژگی')
      }

      // property
      // if (!(this.detailItem.propertySelectedOptions.length > 0)) {
      //   this.hasErrors = true
      //   errors.push('ویژگی‌ها')
      // }

      switch (errors.length) {
        case 1 :
          this.error = errors[0]
          break;
        case 2:
          this.error = errors.join(' و ')
          break;
        default:
          this.error = errors.slice(0, errors.length - 1).join('، ') + ' و ' + errors[errors.length - 1]
      }

      this.error += ' به درستی وارد نشده است.'

    },
    async save() {
      await this.validate()
      if (!this.hasErrors) {
        this.$emit('input', this.detailItem)
        this.backupData = this.detailItem && JSON.parse(JSON.stringify(this.detailItem)) || {}
        this.edit = false
      } else {
        this.validation = true
      }
    },
    cancelEdit() {
      this.edit = false
    },
    editItem() {
      this.edit = true
    },
    deleteItem() {
      this.$emit('delete', this.backupData)
    }
  },
  beforeMount() {
    this.detailItem = this.value && Object.assign({}, this.value) || {}
  },
  mounted() {
    this.backupData = this.detailItem && Object.assign({}, this.detailItem) || {}
    if (!(this.detailItem.id > 0)) {
      this.edit = true
    }
  }
}
</script>

