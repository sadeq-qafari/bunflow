<template>
  <q-table v-if="formData" class="border-radius" v-bind="$attrs" :rows="data" :columns="cols" flat dense
           :loading="isLoading"
           v-model:pagination="pagination" @request="getData">

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
      <q-toolbar class="no-padding">

        <!-- icon, title -->
        <div class="row items-end">

          <!-- icon -->
          <q-icon class="q-py-xs" name="grid_view" size="sm"/>

          <q-separator class="q-mx-sm" vertical inset/>

          <!-- title -->
          <h1 class="no-margin text-subtitle1">{{ formData.title }}</h1>

        </div>

        <q-space/>

        <div class="col-6">
          <q-input borderless v-model:model-value="pagination.filter"
                   :class="['search-input bg-grey-1 q-pr-sm',!!pagination.filter && data.length>0?'positive-border':undefined]"
                   input-class="q-px-md"
                   placeholder="جستجو" clearable
                   dense debounce="300" @update:model-value="getData">
            <template v-slot:append>
              <q-icon name="search"/>
            </template>
          </q-input>
        </div>

        <q-space/>

        <!-- controls -->
        <div class="row">

          <!-- add -->
          <router-link style="text-decoration: none" tag="div" :to="`/flow/${formName}/0`">
            <q-btn class="rounded-borders q-px-md" color="green-2" text-color="green-7" label="افزودن" unelevated
                   dense/>
          </router-link>

          <q-separator inset vertical class="q-mx-sm"/>

          <!-- import excel-->
          <q-file ref="file" v-model:model-value="file" @update:model-value="importData" accept=".xls,.xlsx" style="display: none"/>
          <router-link style="text-decoration: none" tag="div" :to="`/flow/import/${formName}`">
            <q-btn class="rounded-borders" icon="backup" color="teal-2" text-color="teal-7" unelevated dense/>
          </router-link>


          <!-- export excel -->
          <q-btn class="rounded-borders" icon="description" color="teal-2" text-color="teal-7" unelevated
                 @click="excel" :loading="isExcelLoading" dense/>

          <!-- space -->
          <div class="q-pr-xs"/>

          <!-- reload -->
          <q-btn class="rounded-borders" icon="refresh" color="light-blue-2" text-color="light-blue-7" unelevated
                 @click="getData"
                 dense/>

        </div>

      </q-toolbar>
    </template>


    <!-- cell -->
    <template v-for="col in cols" v-slot:[`body-cell-${col.name}`]="props">
      <q-td class="text-center grid-cell">
        <span class="grid-cell">
          <span v-if="col.property && col.property.type=='decimal'">
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

    <!-- row number -->
    <template v-slot:body-cell-rownumber="props">
      <q-td class="text-center">

        {{ props.rowIndex + 1 }}

      </q-td>
    </template>

    <!-- actions -->
    <template v-slot:body-cell-actions="props">
      <q-td class="row full-width q-gutter-x-xs justify-center items-center"
            style="height: fit-content; width: 100px !important;">

        <!-- view -->
        <div>
          <q-btn class="rounded-borders" size="0.9rem" padding="2px 2px" icon="drive_file_rename_outline"
                 color="light-blue-2"
                 text-color="light-blue-7" unelevated dense @click="logProps(props)"
                 :to="`/flow/${formName}/${props.row.Id}`"/>
        </div>

        <!-- delete -->
        <div>
          <q-btn class="rounded-borders" size="0.9rem" padding="2px 2px" icon="delete_forever" color="pink-2"
                 text-color="pink-7" unelevated dense>
            <q-popup-proxy>
              <q-banner dense inline-actions class="items-center">
                <template v-slot:avatar>
                  <q-icon class="q-mt-xs" name="close" color="red"/>
                </template>
                <div class="text-nowrap">
                  آیا از حذف رکورد اطمینان دارید؟
                </div>

                <template v-slot:action>
                  <q-btn unelevated dense class="q-px-sm" color="light-blue" label="انصراف" v-close-popup/>
                  <q-btn unelevated dense class="q-px-sm" color="pink" label="حذف"
                         @click="deleteFormLead(props.row.Id)"/>
                </template>

              </q-banner>
            </q-popup-proxy>
          </q-btn>
        </div>

      </q-td>
    </template>

  </q-table>
</template>

<script lang="ts">
import {IForm, IFormAction, IFormProperty} from "./models";
import {defineComponent} from "vue";
import axios from "axios";

export default defineComponent({
  name: "FDataGrid",
  //===========DATA==============//
  data: () => ({
    data: [] as Array<any>,
    cols: [] as Array<any>,
    form: {} as IForm,
    isLoading: false,
    isExcelLoading: false,
    isImporting: false,
    file: null,
    pagination: {
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: null,
      rowsNumber: 0,
      filter: '' as string | null | undefined
    },
  }),
  //===========PROPS=============//
  props: {
    formName: String
  },
  //===========COMPUTED==========//
  computed: {
    //@ts-ignore
    formData(): Object<any> {
      return this.$store.getters.getFormByName(this.formName)
    }
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
        property
      }))
      this.cols.push({
        name: 'actions',
        label: 'عملیات',
        field: 'actions',
        sortable: false,
        align: 'center',
        headerStyle: 'width: 100px !important'
      })
      this.cols.unshift({
        name: 'rownumber',
        label: 'ردیف',
        field: 'rownumber',
        sortable: false,
        align: 'center',
        headerStyle: 'width: 100px !important'
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
    isSortable(field: IFormProperty) {
      return true
    },
    formatField(value: any, row: object, field: IFormProperty) {
      return value
    },
    //#endregion grid-builder-methods
    async getData(event = null) {
      let requestParams = {}
      requestParams = this.getPagination(event)
      this.isLoading = true

      const res = await this.$api.formProvider.getGrid(process.env.API_URL, (this.formName as string), requestParams)

      this.highlightText()

      this.data = (res as any).items

      await this.setPagination(
        (res as any).pageNo,
        (res as any).pageSize,
        (this.$route.query.sort as string),
        event,
        (res as any).totalCount,
        this.pagination.filter
      )

      this.isLoading = false
    },


    async excel() {
      let requestParams = {}
      requestParams = this.getPagination(null)
      this.isExcelLoading = true

      const response: any = await this.$api.formProvider.getExcel(process.env.API_URL, (this.formName as string), requestParams)

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${this.formName}Report.xlsx`);
      document.body.appendChild(link);
      link.click();

      this.isExcelLoading = false
    },


    async importData() {
      console.log('selected file:', this.file)
      if (this.file == null) return
      this.isImporting = true;
      let data = new FormData()
      data.append('formData', (this.file as any))
      data.append('formName', `${this.formName}`)
      // @ts-ignore
      this.$axios.post(`${process.env.API_URL}/Flow/form/import`, data, {noNotify: true}).then(res => {
        this.isImporting = false;
        this.file = null;
        if (res.data.success)
          this.getData()
      }).catch(() => {
        this.file = null;
        this.isImporting = false;
        console.log('upload failed')
      })
    },


    highlightText() {
      setTimeout(() => {
        let tds: any = (document.getElementsByClassName('grid-cell') as any)
        if (tds)
          for (let i = 0; i < tds.length; i++) {
            if (tds[i].innerHTML.includes(this.pagination.filter))
              tds[i].classList.add('highlight')
            else tds[i].classList.remove('highlight')
          }
      }, 100)
    },


    getPagination(e: any) {
      if ((e as any)?.pagination) {
        this.pagination = e.pagination
        let hasSort = e?.pagination?.sortBy && e.pagination.sortBy != "desc"
        return {
          page: e?.pagination?.page || this.$route.query.page,
          take: e?.pagination?.rowsPerPage || this.$route.query.take,
          sort: hasSort ? `${e.pagination.sortBy}_${e.pagination.descending ? 'DESC' : 'ASC'}` : undefined,
          filter: this.$route.query.filter
        }
      } else {
        let hasSort = this.pagination?.sortBy && this.pagination.sortBy != "desc"
        return {
          page: this.pagination?.page || this.$route.query.page,
          take: this.pagination?.rowsPerPage || this.$route.query.take,
          sort: hasSort ? `${this.pagination.sortBy}_${this.pagination.descending ? 'DESC' : 'ASC'}` : undefined,
          filter: this.pagination?.filter //|| this.$route.query.filter
        }
      }
    },


    async setPagination(page: number, take: number, sort: string | null, e: any, rowsNumber: number, filter: string | null | undefined) {
      console.log((this.$route.query.filter as any)?.trim(), filter?.trim())
      let shouldReplace =
        (this.$route.query.page as any) != page
        || (this.$route.query.take as any) != take
        || (this.$route.query.sort as any) != sort
        || (this.$route.query.filter as any)?.trim() != filter?.trim()

      this.pagination = Object.assign(this.pagination, e?.pagination || {}, {
        page,
        rowsPerPage: take,
        rowsNumber,
        filter: !!filter ? filter : ''
      })
      if (!filter) {
        delete this.pagination.filter
        delete this.$route.query.filter
      }
      console.log('this.pagination:', this.pagination)

      if (shouldReplace)
        await this.$router.replace({
          path: this.$route.path, query: Object.assign({}, this.$route.query, this.getPagination(null))
        })
    },


    async deleteFormLead(formLeadId: number) {
      await this.$api.formProvider.deleteForm(process.env.API_URL, formLeadId)
      await this.getData()
    },


    logProps(props: any) {
      console.dir(props)
    },

  },
  //===========BEFORE-MOUNT======//
  async beforeMount() {
    this.buildColumns()
    if (this.$route.query) {
      this.pagination = Object.assign(this.pagination, this.$route.query)
      console.log('we did replace in before', this.pagination)
    }
  },
  //===========MOUNTED===========//
  async mounted() {
    await this.getData()

  }
})
</script>

<style lang="scss">
.search-input {
  border-radius: 500px !important;
  overflow: hidden;
  border: 1px solid #e1e1e1;
}

.highlight {
  font-weight: 500;
  background-color: yellow;
}

.positive-border {
  border-color: $positive !important;
}

.grid-cell {
  max-width: 100px;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>

