<template>
  <q-table v-if="formData" class="border-radius" v-bind="$attrs" :rows="data" :columns="cols" flat dense>

    <!-- no data -->
    <template v-slot:no-data>
      <div class="row q-px-md q-pa-md q-gutter-x-sm justify-center items-center text-grey-7">

        <!-- spinner (loading) -->
        <q-spinner-tail v-if="isLoading" size="sm"/>

        <!-- text -->
        <div class="text-subtitle2">
          {{ isLoading ? ('در حال دریافت اطلاعات') : ('موردی برای نمایش وجود ندارد') }}
        </div>

      </div>
    </template>

    <!-- header -->
    <template v-slot:top>
      <div v-if="!hideHeader"
           class="no-margin full-width rounded-borders row justify-between items-center q-py-xs text-weight-bold bg-blue-grey-2">
        <div class="q-px-sm" v-if="showCheckbox">
          <q-checkbox dense :model-value="totalCheck" @update:model-value="totalCheckToggle($event)"/>
        </div>
        <div class="q-px-sm">
          {{ formData.title }}
        </div>
        <q-space/>
        <div class="q-px-sm">
          <q-btn flat padding="0" icon="open_in_new" dense :to="`/flow/${formName}?filter=${searchValue}`"/>
        </div>
      </div>
    </template>

    <!-- cell -->
    <template v-for="col in cols" v-slot:[`body-cell-${col.name}`]="props">
      <q-td class="text-center">
        <span class="grid-cell">
          <span v-if="showCheckbox && col.name=='checkbox_field'" class="flex">
            <q-checkbox dense :model-value="!!props.value" @update:model-value="checkToggle(props,$event)"/>
          </span>
          <span v-else-if="col.property && col.property.type=='decimal'">
            {{ props.value && props.value.replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}
          </span>
          <span v-else-if="col.property && col.property.type=='boolean'">
            {{ props.value == 'True' ? '✔️' : '❌' }}
          </span>
          <span v-else>
            {{ props.value }}
          </span>
        </span>
      </q-td>
    </template>

  </q-table>
</template>

<script lang="ts">
import {IForm, IFormAction, IFormProperty} from "./models";
import {defineComponent} from "vue";

export default defineComponent({
  name: "FSimpleDataGrid",
  //===========DATA==============//
  data: () => ({
    cols: [] as Array<any>,
    form: {} as IForm,
    isLoading: false,
    totalCheck: false,
    pagination: {
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: null,
      rowsNumber: 0
    }
  }),
  //===========PROPS=============//
  props: {
    formName: String,
    data: [] as Array<any>,
    searchValue: String,
    hideHeader: {
      type: Boolean,
      default: false
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
  },

  //===========COMPUTED==========//
  computed: {
    //@ts-ignore
    formData(): Object<any> {
      return this.$store.getters.getFormByName(this.formName)
    },
  },
  //===========METHODS===========//
  methods: {
    //#region grid-builder-methods
    buildColumns() {
      this.cols = this.formData.properties.map((property: IFormProperty) => ({
        name: this.getFieldName(property),
        label: property.title,
        field: this.getFieldName(property),
        sortable: this.isSortable(property),
        align: 'center',
        format: (v: any, r: object) => this.formatField(v, r, property),
        style: 'max-width: 100px',
        headerStyle: 'max-width: 100px',
        property
      }))
      if (this.showCheckbox)
        this.cols.unshift({
          name: 'checkbox_field',
          label: 'انتخاب',
          field: 'is_checked',
          sortable: false,
          align: 'left',
          style: 'width: 50px',
          headerStyle: 'width: 50px'
        })
    },
    getFieldName(property: any) {
      if (property.relatedFormId > 0) {
        return `${property.relatedFormName}${property.relatedFormPropertyName}`
      } else if (property.lookupId > 0) {
        return `${property.name}Title`
      } else {
        return property.name
      }
    },
    checkToggle(props: any, val: boolean) {
      this.$emit('setCheck', {
        value: val,
        id: props.row.Id,
        index: props.rowIndex,
        formName: this.formName
      })
      this.calculateTotalCheck()
    },
    totalCheckToggle(val: boolean) {
      this.$emit('setTotalCheck', {
        value: val,
        totalCheck: this.totalCheck,
        formName: this.formName
      })
      this.calculateTotalCheck()
    },
    calculateTotalCheck(){
      let checkList = (this.data as any).map((x: any) => !!x.is_checked)
      console.log(checkList)
      //@ts-ignore
      this.totalCheck = null
      if (checkList.every((x: boolean) => x)) this.totalCheck = true
      if (checkList.every((x: boolean) => !x)) this.totalCheck = false
    },
    isSortable(field: IFormProperty) {
      return true
    },
    formatField(value: any, row: object, field: IFormProperty) {
      return value
    },
    //#endregion grid-builder-methods

    logProps(props: any) {
      console.dir(props)
    }
  },
  //===========BEFORE-MOUNT======//
  async beforeMount() {
    this.buildColumns()
  },
  //===========MOUNTED===========//
  async mounted() {
    let tds: any = (document.getElementsByClassName('grid-cell') as any)
    if (tds)
      for (let i = 0; i < tds.length; i++) {
        if (tds[i].innerHTML.includes(this.searchValue))
          tds[i].classList.add('highlight')
        else tds[i].classList.remove('highlight')
      }
  }
})
</script>

<style lang="scss">
.highlight {
  font-weight: 500;
  background-color: yellow;
}
.grid-cell {
  max-width: 100px;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>

