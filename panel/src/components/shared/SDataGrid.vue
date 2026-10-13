<template>
  <div class="row">
    <q-table
      :class="['col-12 border-radius overflow-hidden',!isMobile?'data-grid-max-height':undefined]"
      dense
      bordered
      flat
      :grid="isMobile"
      :separator="isMobile ? undefined : 'vertical'"
      :loading="loading"
      :title="model && model.title"
      :rows="data"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :visible-columns="visibleColumns"
      @request="onRequest"
      ref="datagrid"
      :pagination-label="getPaginationLabel"
      virtual-scroll
    >
      <template v-slot:top="props">
        <q-tabs dense class="bg-grey-2 full-width" v-if="filterTabs.length>1"
                align="start"
                v-model:model-value="filterTabId"
                @update:model-value="doFilter"
                active-color="primary"
                active-bg-color="white"
                indicator-color="white"
                inline-label
        >
          <q-tab v-for="(tab,index) of filterTabs" :name="tab.value" :label="tab.label" :ripple="false"
                 :key="index"/>
        </q-tabs>

        <q-toolbar v-show="showHeader"
                   :class="['border-radius-bottom text-grey-14 bg-white flex wrap q-pa-none', isMobile ? 'q-mb-sm' : undefined]"
                   style="flex-wrap: wrap;">
          <q-toolbar-title class="col-md-3 col-4 datagrid-header-title">
            <div class="row col-auto q-gutter-x-sm items-center">
              <q-icon v-if="!isMobile" size="sm" name="grid_view"/>
              <q-separator color="grey-5" vertical inset/>
              <span><small>{{ title || model && model.title }}</small></span>
            </div>
          </q-toolbar-title>

          <s-data-grid-filter class="col row justify-center items-center datagrid-header-search"
                              v-show="showHeaderFilters" :components="filterComponents"
                              @filter="doFilter" :filter-chips="filterChips"
                              @addChipFilter="addChipFilter" @removeChipFilter="removeChipFilter"
                              @before-show="buildFilterComponents" @show="disableListenKey = true"
                              @hide="disableListenKey = false" @clear-filters="clearFilters"/>

          <div v-show="showHeaderFilters" class="col-md-3 col-8 flex justify-end">
            <slot name="header-actions-prepend"/>

            <q-btn unelevated dense v-if="model.isReport" color="cyan-2" text-color="cyan-7" icon="filter_alt" class="rounded-borders q-mx-xs"
                   @click="openAddDialog"/>
            <q-btn unelevated dense v-if="useAdd && model.insert" color="cyan-2" text-color="cyan-7" label="افزودن" class="rounded-borders q-mx-xs"
                   padding="0 10px 0 10px"
                   @click="openAddDialog"/>
            <q-btn unelevated dense color="light-blue-2" text-color="light-blue-7" icon="print" class="rounded-borders q-mx-xs"
                   @click="openReportDialog"/>
            <q-btn unelevated dense color="blue-2" text-color="blue-7" icon="download" class="rounded-borders q-mx-xs"
                   @click="exportAsExcel"/>
            <q-btn unelevated dense color="indigo-2" text-color="indigo-7" icon="view_week"
                   class="rounded-borders q-mx-xs">
              <q-popup-proxy anchor="bottom middle" self="top middle">
                <q-card>
                  <q-card-section>
                    <q-option-group
                      v-model:model-value="visibleColumns"
                      :options="visibleColumnsOptions"
                      type="toggle"
                    />
                  </q-card-section>
                </q-card>
              </q-popup-proxy>
            </q-btn>
            <q-btn unelevated dense color="deep-purple-2" text-color="deep-purple-7"
                   class="rounded-borders q-mx-xs" :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                   @click="props.toggleFullscreen" ref="fullScreenBtn"/>
          </div>
        </q-toolbar>


        <s-dialog :size="addComponents.length<3? 'sm':(addComponents.length<10?'md':'lg')" ref="addDialog"
                  :title="dialogTitle"
                  :components="addComponents"
                  :controller="model.controllerFn"
                  @show="disableListenKey = true"
                  @hide="disableListenKey = false">
        </s-dialog>
        <s-dialog size="sm" ref="deleteDialog" title="حذف رکورد" ok-label="تایید" cancel-label="انصراف"
                  @show="disableListenKey = true" @hide="disableListenKey = false">
          <div class="col">
            آیا از حذف رکورد خود اطمینان دارید؟
          </div>
        </s-dialog>
        <s-model-report-dialog :service-name="service.name" :model-name="model.name" ref="reportDialog"
                               :cols="visibleColumnsOptions" :report-params="reportParams"
                               :sort="sortString" :filter="filterString"/>
      </template>
      <template v-slot:header="props">
        <q-tr :props="props" class="data-grid-th-row-first">
          <q-th
            v-for="col in props.cols.filter(x=>x.name!=='actions')"
            :key="col.name"
            :props="props"
            class="bg-primary text-white q-ml-lg">
            <span>{{ col.label }}</span>
            <!--          <q-btn @click="alert('asd')" flat size="sm" icon="search"/>-->
          </q-th>
          <q-th class="text-center sticky-column bg-primary text-white q-ml-lg">
            {{ $t('common.actions') }}
          </q-th>
        </q-tr>
        <q-tr v-show="showHeaderFilters" :props="props" class="data-grid-th-row-second"> <!-- Temporary Removed -->
          <q-td
            v-for="col in props.cols.filter(x=>x.name!=='actions')"
            :key="col.name"
            :props="props"
            class="bg-white text-white" style="max-width: 150px; min-width: 100px">
            <s-filter-input v-if="getHeaderFilterComponent(col.name)"
                            :property="getHeaderFilterComponent(col.name).property || {}"
                            :model="getHeaderFilterComponent(col.name).model"
                            :event="getHeaderFilterComponent(col.name).events"
                            hide-label
                            @input="onHeaderFilterInput"/>
            <div v-else/>
          </q-td>
          <q-td class="text-center sticky-column bg-white text-white q-ml-lg">
            <q-btn flat color="primary" round icon="refresh" @click="movePage(0)">
              <q-tooltip>به روز رسانی</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>

      </template>
      <template v-slot:header-cell-actions="props">
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props"
              :class="[selectedItemIndex === props.rowIndex % pagination.rowsPerPage ? 'bg-light-blue-2' : '','text-center','sticky-column']">
          <slot name="actions-prepend" v-bind="{props}">
          </slot>
          <slot v-bind:actions="props">
            <q-btn unelevated dense v-if="useEdit && model.update" padding="2px 2px" size="0.9rem" icon="edit" color="light-blue-2" text-color="light-blue-7"
                   class="rounded-borders q-mx-xs"
                   @click="openUpdateDialog(props.row)">
              <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
            </q-btn>
            <q-btn unelevated dense v-if="useDelete && model.delete" padding="2px 2px" size="0.9rem" icon="delete_forever" color="pink-2" text-color="pink-7"
                   class="rounded-borders q-mx-xs"
                   @click="openDeleteDialog(props.row)">
              <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
            </q-btn>
            <q-btn v-if="useRelatedModels && model.relatedModels && model.relatedModels.length > 0" padding="2px 2px" unelevated
                   size="0.9rem" icon="more_vert"
                   color="cyan-2" text-color="cyan-7" class="rounded-borders q-mx-xs">
              <q-menu>
                <q-list>
                  <q-item v-for="item in model.relatedModels" clickable :key="JSON.stringify(item)"
                          :to="`/service/${item.serviceName}/${item.name}?page=1&take=10&sort=&filter=${encodeFilter([[item.propertyName, '=', [props.row.id]]])}`">
                    {{ item.title }}
                  </q-item>
                </q-list>
              </q-menu>
              <q-tooltip>{{ $t('common.relatedModels') }}</q-tooltip>
            </q-btn>
          </slot>
          <slot name="actions-append" v-bind="{props}">
          </slot>
        </q-td>
      </template>
      <!-- mobile -->
      <template v-slot:item="props">
        <div class="col-12 border-radius bg-white q-mb-md q-pa-md">
          <!-- data -->
          <div class="text-black q-py-sm"
               v-for="col in model.properties.filter(x=>x.name!=='actions' && x.visible && visibleColumns.includes(x.name) ).slice(0, props.expand ? model.properties.length : 3)"
               style="border-bottom: 1px solid #e1e1e1"
               :key="col.name">
            <div class="row q-pa-none">
              <div class="col-4 text-bold">{{ col.title }}</div>
              <div class="col-8">
                <s-data-grid-cell :col="col" :prop="props" minimal :value="props.row[col.name]"/>
              </div>
            </div>
          </div>
          <!-- actions -->
          <div class="row col-12 q-mt-md justify-between items-center">

            <!-- view more items -->
            <q-btn v-if="props.cols.filter(x=>x.name!=='actions').length>3" color="light-blue-2" text-color="light-blue-7"
                   :label="props.expand ? 'بستن' : 'نمایش بیشتر'"
                   :icon-right="props.expand ? 'expand_less' : 'expand_more'" flat dense
                   @click="props.expand = !props.expand"/>

            <!-- actions -->
            <div v-if="props" class="row col q-pl-md justify-end">
              <slot name="actions-prepend" v-bind="{props}">
              </slot>
              <div v-if="props">
                <q-btn unelevated v-if="useEdit && model.update" size="sm" icon="edit" color="cyan-2" text-color="cyan-7"
                       class="rounded-borders q-mx-xs"
                       @click="openUpdateDialog(props.row)">
                  <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                </q-btn>
                <q-btn unelevated v-if="useDelete && model.delete" size="sm" icon="delete_forever"
                       color="pink-2" text-color="pink-7"
                       class="rounded-borders q-mx-xs"
                       @click="openDeleteDialog(props.row)">
                  <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                </q-btn>
                <q-btn v-if="useRelatedModels && model.relatedModels && model.relatedModels.length > 0" unelevated
                       size="sm" icon="more_vert"
                       color="cyan-2" text-color="cyan-7" class="rounded-borders q-mx-xs">
                  <q-menu>
                    <q-list>
                      <q-item v-for="item in model.relatedModels" clickable :key="JSON.stringify(item)"
                              :to="`/service/${item.serviceName}/${item.name}?page=1&take=10&sort=&filter=${encodeFilter([[item.propertyName, '=', [props.row.id]]])}`">
                        {{ item.title }}
                      </q-item>
                    </q-list>
                  </q-menu>
                  <q-tooltip>{{ $t('common.relatedModels') }}</q-tooltip>
                </q-btn>
              </div>
              <slot name="actions-append" v-bind="{props}">
              </slot>
            </div>

          </div>
        </div>
      </template>
      <template v-for="col in this.model.properties" v-slot:[getSlotName(col.name)]="props">
        <q-td :style="{'overflow':'hidden','max-width': '200px','direction':col.isLtr?'ltr':'rtl'}" :props="props"
              @click="selectedItemIndex = props.rowIndex % pagination.rowsPerPage"
              :class="selectedItemIndex === props.rowIndex % pagination.rowsPerPage ? 'bg-light-blue-2' : ''">
          <s-data-grid-cell :col="col" :prop="props"/>
        </q-td>
      </template>
      <!-- no data -->
      <template v-slot:no-data>
        <div class="column full-width q-pa-md items-center">
          <div class="row items-center text-grey-7">

            <!-- icon -->
            <q-spinner size="sm" v-if="loading"/>

            <q-icon name="o_error" size="sm" v-else/>

            <!-- info -->
            <div class="q-ml-sm text-subtitle1 text-weight-regular" v-if="loading">
              در حال دریافت اطلاعات
            </div>

            <div class="q-ml-sm text-subtitle1 text-weight-regular" v-else>
              موردی یافت نشد
            </div>

          </div>
        </div>
      </template>
      <!--      <template v-slot:loading>-->
      <!--        <q-inner-loading showing style="z-index: 3000">-->

      <!--        </q-inner-loading>-->
      <!--      </template>-->
    </q-table>
  </div>
</template>


<script>
import SDialog from "components/shared/SDialog";
import SFilterDialog from "components/shared/SFilterDialog";
import {ref} from 'vue'
import SDataGridFilter from "components/shared/SDataGridFilter";
import * as moment from 'jalali-moment'
import SFilterInput from "./SFilterInput";
import SInput from "./SInput";
import {Screen, SessionStorage} from "quasar";
import SDataGridCell from "./SDataGridCell";
import SModelReportDialog from "./SModelReportDialog";


export default {
  name: "SDataGrid",
  components: {SModelReportDialog, SDataGridCell, SInput, SFilterInput, SDataGridFilter, SDialog, SFilterDialog},
  props: {
    service: Object,
    model: Object,
    title: {
      type: String,
      default: null
    },
    defaultFilters: {
      type: Array,
      default: Array
    },
    useAdd: {
      type: Boolean,
      default: true
    },
    useEdit: {
      type: Boolean,
      default: true
    },
    useDelete: {
      type: Boolean,
      default: true
    },
    useRelatedModels: {
      type: Boolean,
      default: false
    },
    addRoute: {
      type: String | null,
      default: null
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showHeaderFilters: {
      type: Boolean,
      default: true
    },
  },
  data: () => ({
    disableListenKey: false,
    selectedItemIndex: 0,
    cdnDownloadUrl: `${process.env.API_URL}/cdn/download`,
    moment,
    loading: false,
    filterComponents: [],
    addComponents: [],
    addModels: {},
    filters: {},
    filterModels: {},
    testModel: ref(''),
    data: [],
    pagination: {
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 3,
      rowsNumber: 10
    },
    showFilters: false,
    columns: [],
    visibleColumns: [],
    visibleColumnsOptions: [],
    dialogTitle: '',
    reportParams: {},
    filterTabId: 0,
    filterChipIds: [],
  }),
  computed: {
    isMobile() {
      return Screen && Screen.lt && Screen.lt.md
    },
    filterTabs() {
      let filterTabs = [{label: 'همه', value: 0, filters: null}]
      let filters = this.model.filters
      if (filters && filters?.filter(x => x.typeLookup == 1)?.length > 0) {
        filters.filter(x => x.typeLookup == 1).forEach(filter => {
          try {
            filterTabs.push({
              label: filter.title,
              value: filter.id,
              filters: eval(filter.filterString)
            })
          } catch (e) {
            console.log(`error on adding filter tab ${JSON.stringify(filter)}\n${e}`)
          }
        })
      }
      return filterTabs
    },
    filterChips() {
      let filterChips = []
      let filters = this.model.filters
      if (filters && filters?.filter(x => x.typeLookup == 2)?.length > 0) {
        filters.filter(x => x.typeLookup == 2).forEach(filter => {
          try {
            filterChips.push({
              label: filter.title + ' ‌',
              value: filter.id,
              filters: eval(filter.filterString),
              active: this.filterChipIds.includes(filter.id)
            })
          } catch (e) {
            console.log(`error on adding filter chip ${JSON.stringify(filter)}\n${e}`)
          }
        })
      }
      return filterChips
    },
    filterString() {
      let {pagination, filter, sort} = this.getPagination()
      return this.addDefaultFilters(filter)
    },
    sortString(){
      let {pagination, filter, sort} = this.getPagination()
      return sort
    }
  },
  watch: {
    $route(to, from) {
      //this.setFilterFromUrl()
      if (to.fullPath !== from.fullPath) {
        this.filterModels = {}
        this.buildFilterComponents()
        this.setFilterFromUrl()
        this.columns = this.getColumnsDefinitions()
        this.onRequest({})
      }
    },
    model(to, from) {
      this.columns = this.getColumnsDefinitions()
      this.data = []
    }
  },
  methods: {
    openReportDialog() {
      this.$refs.reportDialog.open()
      //this.$openReport(this.model.name, {modelName: this.model.name, serviceName: this.service.name, ...this.reportParams})
    },
    addChipFilter(filter) {
      this.filterChipIds.push(filter.value)
      this.doFilter()
    },
    removeChipFilter(filter) {
      let i = this.filterChipIds.findIndex(x => x == filter.value)
      if (i >= 0) {
        this.filterChipIds.splice(i, 1)
      }
      this.doFilter()
    },
    getHeaderFilterComponent(name) {
      return this.filterComponents.find(x => x.property.name === name || x.property.labelFieldName === name)
    },
    getPaginationLabel() {
      let page = ` صفحه: ${this.pagination.page}`
      let record = `${(this.pagination.page - 1) * this.pagination.rowsPerPage + 1} تا ${(this.pagination.page) * this.pagination.rowsPerPage} از ${this.pagination.rowsNumber} `
      if (this.isMobile) {
        return `${page}`
      } else {
        return `🔹 ${page} 🔹 ${record} 🔹`
      }
    },
    async executeInputMapper(data) {
      const fn = this.model.inputMapperFn
      return (fn == null) ? data : await fn({data, axios: this.$axios, ctx: this})
    },
    async executeOutputMapper(data) {
      const fn = this.model.outputMapperFn
      return (fn == null) ? data : await fn({data, axios: this.$axios, ctx: this})
    },
    keydown(e) {
      if (this.disableListenKey || e.repeat) return
      if (e.key === "PageDown") {
        this.movePage(1)
        e.preventDefault()
      } else if (e.key === "PageUp") {
        this.movePage(-1)
        e.preventDefault()
      } else if (e.key === "Insert" && this.useAdd) {
        this.openAddDialog()
      } else if (e.key === "ArrowUp") {
        if (this.selectedItemIndex > 0) this.selectedItemIndex--
      } else if (e.key === "ArrowDown") {
        if (this.selectedItemIndex < this.pagination.rowsPerPage - 1) this.selectedItemIndex++
      } else if (e.key === "Delete" && e.ctrlKey && this.useDelete) {
        this.openDeleteDialog(this.data[this.selectedItemIndex])
      } else if (e.key === "Enter" && e.ctrlKey && !e.altKey && this.useEdit) {
        this.openUpdateDialog(this.data[this.selectedItemIndex])
      } else if (e.key === "Enter" && e.altKey) {
        this.$refs.fullScreenBtn.click()
      } else if (e.key.toLowerCase() === "e" && e.altKey && e.ctrlKey) {
        this.exportAsExcel()
      } else if (e.key.toLowerCase() === "q" && e.ctrlKey) {
        let tableName = `${this.model.name}`
        let filter = `entityId,in,${this.data[this.selectedItemIndex].id}_tableName,like,${tableName}`
        this.$router.replace(`/service/log/log?page=1&take=10&sort=&filter=${filter}`)
      }
    },
    movePage(count) {
      return this.onRequest({
        pagination: Object.assign({}, this.pagination, {page: this.pagination.page + count}),
        filter: this.$route.query.filter || '',
        sort: this.$route.query.sort || '',
      }, true)
    },
    getSlotName(colName) {
      return 'body-cell-' + colName
    },
    getColumnsDefinitions() {
      if (this.model == null) return []
      const properties = this.model.properties.filter(x => x.visible)
      const columns = properties
        .sort((a, b) => a.index < b.index ? -1 : 1)
        .map(x => ({
          name: x.name,
          field: x.name,
          label: x.title,
          type: x.type,
          align: this.getAlign(x),
          sortable: this.getSortable(x),
          style: this.getStyle(x),
          headerStyle: this.getHeaderStyle(x),
        }))
      columns.push({
        name: 'actions',
        label: this.$t('common.actions'),
        align: 'center',
        required: true
      })
      this.visibleColumns = properties.map(x => x.dataGrid && !x.dataGrid.visible ? null : x.name).filter(x => x != null)
      this.visibleColumnsOptions = properties.map(x => ({
        label: x.title,
        value: x.name
      }))
      return columns;
    },
    getSliceLimit(cols, expand) {
      if (!expand) {
        return 3
      } else {
        return cols.length
      }
    },

    async onRequest(props, forceUpdate = false) {
      if (this.loading) return
      let {pagination, filter, sort} = this.getPagination(props.pagination, props.filter, props.sort)
      this.pagination = pagination;
      const sorts = this.pagination.sortBy ? `${this.pagination.sortBy} ${this.pagination.descending ? 'DESC' : 'ASC'}` : ''
      if (!this.updateRoute(filter, sorts) && !forceUpdate) return
      let {page, rowsPerPage} = this.pagination
      this.loading = true
      try {
        let data = null
        if (this.model.isReport) {
          data = await this.$api.serviceProvider.getReport(process.env.API_URL, this.service.name, this.model.name, page, rowsPerPage, sorts, this.addDefaultFilters(filter), this.reportParams)
        } else {
          data = await this.$api.serviceProvider.getPage(process.env.API_URL, `${this.service.name}/${this.model.name}`, page, rowsPerPage, sorts, this.addDefaultFilters(filter))
        }

        if (data) {
          this.data = data.items
          this.pagination.rowsNumber = data.totalCount
          this.pagination.page = page
          this.pagination.rowsPerPage = rowsPerPage
          //this.pagination.sortBy = descending != null ? sortBy : ''
          //this.pagination.descending = descending
        }
        this.selectedItemIndex = 0
        this.$emit('reload')
      } catch (e) {
        console.log(e)
      }
      this.loading = false
    },
    //#region Dialogs
    async openUpdateDialog(item) {
      item = await this.executeInputMapper(item)
      this.dialogTitle = `ویرایش ${this.model.title}`
      if (this.model.hasCustomUpsertForm) {
        await this.$router.push(`${this.model.name}/info?id=${item.id}`)
        return
      }
      const properties = this.model.properties.filter(x => x.updatable)
      this.addComponents = []
      this.addModels = {}
      for (let p of properties) {
        this.addModels[p.name] = this.getItemAsModel(item[p.name])
        const defaultFilter = this.defaultFilters.find(x => x[0] === p.name);
        if (defaultFilter) {
          this.addModels[p.name] = ref(defaultFilter[2][0])
        }
      }
      for (let p of properties) {
        const elementType = p.element && p.element.type || p.type
        const property = Object.assign({}, p)
        if (p.relatedModelProperty != null) {
          property.relatedModelPropertyModel = this.addModels[p.relatedModelProperty.name]
        }
        const defaultFilter = this.defaultFilters.find(x => x[0] === p.name);
        this.addComponents.push({
          property: property,
          visible: defaultFilter == null,
          model: this.addModels[p.name],
          events: null
        })
      }
      const res = await this.$refs.addDialog.open(async () => {
        let data = {}
        for (let key in this.addModels) {
          data[key] = this.addModels[key].value
          const defaultFilter = this.defaultFilters.find(x => x[0] === key);
          if (defaultFilter) {
            data[key] = defaultFilter[2][0]
          }
        }
        data['id'] = item.id
        data = await this.executeOutputMapper(data)
        return await this.$api.serviceProvider.update(process.env.API_URL, `${this.service.name}/${this.model.name}`, data)
      })
      if (res) {
        await this.forceUpdateDataGrid()
      }
    },
    async openDeleteDialog(item) {
      const res = await this.$refs.deleteDialog.open(() => this.$api.serviceProvider.remove(process.env.API_URL, `${this.service.name}/${this.model.name}`, item.id))
      if (res) {
        await this.forceUpdateDataGrid()
      }
    },
    async openAddDialog() {
      this.dialogTitle = `${this.model.isReport ? '' : 'افزودن '}${this.model.title}`
      if (this.model.hasCustomUpsertForm) {
        await this.$router.push(this.addRoute || `${this.model.name}/info?id=0`)
        return
      }
      const properties = this.model.properties.filter(x => x.insertable)
      this.addComponents = []
      this.addModels = {}
      for (let p of properties) {
        const elementType = p.element && p.element.type || p.type
        this.addModels[p.name] = this.getDefaultModelValue(elementType, p.defaultValue, this.filterModels[p.name])
        const defaultFilter = this.defaultFilters.find(x => x[0] === p.name);
        if (defaultFilter) {
          this.addModels[p.name] = ref(defaultFilter[2][0])
        }
      }

      for (let p of properties) {
        const property = Object.assign({}, p)
        if (p.relatedModelProperty != null) {
          property.relatedModelPropertyModel = this.addModels[p.relatedModelProperty.name]
        }
        const defaultFilter = this.defaultFilters.find(x => x[0] === property.name);
        this.addComponents.push({
          property: property,
          visible: defaultFilter == null,
          model: this.addModels[p.name],
          events: null
        })
      }
      const res = await this.$refs.addDialog.open(async () => {
        let data = {}
        for (let key in this.addModels) {
          let dataType = this.model.properties.find(x => x.name === key).type;
          switch (dataType) {
            case 'int':
            case 'tinyint':
            case 'smallint':
            case 'bigint':
              data[key] = parseInt(this.addModels[key].value)
              break;
            case 'float':
            case 'double':
            case 'decimal':
            case 'money':
              data[key] = parseFloat(this.addModels[key].value)
              break;
            default:
              data[key] = this.addModels[key].value
          }
          const defaultFilter = this.defaultFilters.find(x => x[0] === key);
          if (defaultFilter) {
            data[key] = defaultFilter[2][0]
          }
        }
        data = await this.executeOutputMapper(data)
        if (this.model.isReport) {
          this.reportParams = data;
          this.movePage(0)
          return true
        } else {
          return await this.$api.serviceProvider.add(process.env.API_URL, `${this.service.name}/${this.model.name}`, data)
        }

      })
      if (res) {
        await this.forceUpdateDataGrid()
      }
    },
    buildFilterComponents() {
      const properties = this.model.properties.filter(x => x.filterable)
      this.filterComponents = []
      for (let p of properties) {
        let mainFieldIndex = properties.findIndex(x => x.labelFieldName === p.name)
        if (mainFieldIndex < 0) {
          const elementType = p.element && p.element.type || p.type
          this.filterModels[p.name] = this.filterModels[p.name] || ref({
            value: this.getDefaultFilterModelValue(elementType),
            elementType,
            type: ''
          })
          this.filterComponents.push({
            property: p,
            model: this.filterModels[p.name],
            events: null
          })
        }
      }
    },
    onHeaderFilterInput($event) {
      this.disableListenKey = false
      return this.doFilter()
    },
    clearFilters() {
      const properties = this.model.properties.filter(x => x.filterable)
      for (let p of properties) {
        const elementType = p.element && p.element.type || p.type
        if (this.filterModels[p.name]?.value?.value)
          this.filterModels[p.name].value.value = this.getDefaultFilterModelValue(elementType)
      }
      this.filterChipIds = []
      return this.doFilter()
    },
    async doFilter() {
      sessionStorage.setItem(`${this.$route.path}:tab`, this.filterTabId)
      sessionStorage.setItem(`${this.$route.path}:chips`, JSON.stringify(this.filterChipIds))
      let filter = []
      for (let p in this.filterModels) {
        if (this.isFilterValueValid(this.filterModels[p].value.elementType, this.filterModels[p].value.value)) {
          filter.push([p, this.filterModels[p].value.type, this.filterModels[p].value.value])
        }
      }
      filter = this.encodeFilter(filter)
      if (filter === '') filter = ' '
      await this.onRequest({pagination: this.pagination, filter}, true)
    },
    isFilterValueValid(elementType, val) {
      switch (elementType) {
        case "string":
          return val && val[0] && val[0].trim().length > 0
        case "int":
        case "tinyint":
        case "smallint":
        case "decimal":
        case "float":
        case "double":
        case "long":
          return val && val[0] && val[0].toString().trim().length > 0 && !isNaN(val[0])
        case "bool":
          return val && (val[0] === false || val[0] === true)
        case "dropdown":
        case "radio":
        case "lookup":
        case "chips":
          return val && val.length > 0
        case "date":
        case "datetime":
        case "time":
          return val && val[0] && val[0].trim().length > 0
        default :
          break
      }
    },
    // async openFilterDialog() {
    //   const properties = this.model.properties.filter(x => x.filterable)
    //   this.filterComponents = []
    //   //this.filterModels = {}
    //
    //   for (let p of properties) {
    //     const elementType = p.element && p.element.type || p.type
    //     this.filterModels[p.name] = this.filterModels[p.name] || ref({
    //       value: this.getDefaultFilterModelValue(elementType),
    //       type: '',
    //       isEnabled: false
    //     })
    //     this.filterComponents.push({
    //       property: p,
    //       model: this.filterModels[p.name],
    //       events: null
    //     })
    //   }
    //   const res = await this.$refs.filterDialog.open()
    //   if (res) {
    //     let filter = []
    //     for (let p in this.filterModels) {
    //       if (this.filterModels[p].value.isEnabled) {
    //         filter.push([p, this.filterModels[p].value.type, this.filterModels[p].value.value])
    //       }
    //     }
    //     filter = this.encodeFilter(filter)
    //     await this.onRequest({pagination: this.pagination, filter}, true)
    //   }
    // },
    //#endregion Dialogs
    //#region DataGrid Methods
    forceUpdateDataGrid() {
      return this.onRequest({pagination: this.pagination}, true)
    },
    exportAsExcel() {
      let {pagination, filter, sort} = this.getPagination()
      this.$axios.get(`${this.service.name}/${this.model.name}/excel`, {
        baseURL: process.env.API_URL,
        responseType: 'blob',
        params:
          {
            paging: false,
            sort,
            filter: this.addDefaultFilters(filter)
          }
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${this.model.name}Report.xlsx`);
        document.body.appendChild(link);
        link.click();
      });
    },
    getAlign(property) {
      return (property.datagrid == null) ? 'center' : property.datagrid.alignment
    },
    getSortable(property) {
      return (property.datagrid == null) ? true : property.datagrid.sortable
    },
    getStyle(property) {
      return null//(property.datagrid == null) ? `min-width: ${(+property.viewSize || 3) * 35}px !important` : property.datagrid.css
    },
    getHeaderStyle(property) {
      return (property.datagrid == null) ? null : property.datagrid.headerCss
    },
    getPagination(newPagination, newFilter, newSort) {
      newPagination = newPagination || {}
      return {
        pagination: {
          page: newPagination.page || parseInt(this.$route.query.page || '1'),
          rowsPerPage: newPagination.rowsPerPage || parseInt(this.$route.query.take || '10'),
          rowsNumber: newPagination.rowsNumber || this.pagination.rowsNumber,
          sortBy: (newPagination.sortBy == null && newPagination.descending) ? null : newPagination.sortBy || this.$route.query.sort?.split(' ')[0],
          descending: newPagination.sortBy ? newPagination.descending : this.getDescending(null, this.$route.query.sort)
        },
        filter: newFilter || this.$route.query.filter || '',
        sort: newSort || this.$route.query.sort || '',
      }
    },
    getDescending(paginationDescending, newSort) {
      //if (!newSort || newSort.trim().length <= 0) return paginationDescending
      const sorting = newSort?.split(' ')[1]?.trim().toLowerCase()
      return sorting === 'desc';
    },
    //#endregion DataGrid Methods
    getItemAsModel(item) {
      return ref(item)
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
    getDefaultFilterModelValue(type) {
      switch (type) {
        case 'bool':
          return [null]
        default:
          return []
      }
    },

    getRouteQuery(filter, sort) {
      return Object.assign({}, this.$route.query, {
        page: this.pagination.page || 1,
        take: this.pagination.rowsPerPage || 10,
        filter,
        sort
      })
    },
    updateRoute(filter, sort) {
      const newQuery = this.getRouteQuery(filter, sort)
      const shouldReplace = Object.keys(this.$route.query).length === 0
      if (JSON.stringify(newQuery) !== JSON.stringify(this.$route.query)) {
        if (shouldReplace) {
          this.$router.replace({path: this.$route.path, query: newQuery}).catch(x => {
          })
        } else {
          this.$router.replace({path: this.$route.path, query: newQuery})
            .catch(x => {
            })
        }
        return true
      }
      return false
    },
    addDefaultFilters(filter) {
      if (!(this.filterChipIds && this.filterChipIds.length > 0) && !this.filterTabId && !(this.defaultFilters && this.defaultFilters.length > 0))
        return encodeURIComponent(JSON.stringify(this.decodeFilter(filter) || []))
      let filters = this.decodeFilter(filter) || []
      if (this.filterTabId > 0) {
        filters = filters.concat(this.filterTabs.find(x => x.value == this.filterTabId).filters)
      }
      if (this.filterChipIds && this.filterChipIds.length > 0) {
        filters = [].concat.apply(filters, this.filterChips.filter(x => this.filterChipIds.includes(x.value)).map(x => x.filters))
      }
      if (filters && filters.length > 0) {
        return encodeURIComponent(JSON.stringify(filters.concat(this.defaultFilters)))
      } else {
        return encodeURIComponent(JSON.stringify(this.defaultFilters))
      }
    },
    setFilterFromUrl() {
      const filters = this.decodeFilter(this.$route.query.filter || '')
      if (filters && filters.length > 0) {
        for (const filter of filters) {
          this.filterModels[filter[0]].value.type = filter[1]
          this.filterModels[filter[0]].value.value = filter[2]
        }
      }
      if (sessionStorage.getItem(`${this.$route.path}:tab`))
        this.filterTabId = +sessionStorage.getItem(`${this.$route.path}:tab`)
      if (sessionStorage.getItem(`${this.$route.path}:chips`))
        this.filterChipIds = JSON.parse(sessionStorage.getItem(`${this.$route.path}:chips`))
    },

    encodeFilter(filter) {
      if (!Array.isArray(filter)) return ''

      return filter.map(x => `${x[0]},${this.operatorTranslator(x[1])},${x[2].join(',')}`).join('_') || ''
    },
    decodeFilter(filter) {
      if (typeof filter !== 'string' || filter.trim().length <= 0) return []
      return filter.split('_').map(x => {
        let items = x.split(',')
        let mainParts = items.splice(0, 2)
        return [mainParts[0], this.operatorTranslator(mainParts[1]), items]
      })
    },
    operatorTranslator(operator) {
      switch (operator) {
        case '=':
          return 'eq'
        case '!=':
          return 'neq'
        case '>':
          return 'gt'
        case '>=':
          return 'gteq'
        case 'not in':
          return 'notin'
        case 'eq':
          return '='
        case 'neq':
          return '!='
        case 'gt':
          return '>'
        case 'gteq':
          return '>='
        case 'notin':
          return 'not in'
        default:
          return operator
      }
    }

  },
  mounted() {
    this.buildFilterComponents()
    this.setFilterFromUrl()
    this.columns = this.getColumnsDefinitions()
    this.onRequest({})
    document.addEventListener('keydown', this.keydown);
  },
  unmounted() {
    document.removeEventListener('keydown', this.keydown);
  },
  unmounted() {
    document.removeEventListener('keydown', this.keydown);
  }
}
</script>

<style lang="scss">
.border-radius-bottom {
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
}

.sticky-column {
  position: sticky !important;
  right: 0 !important;
  z-index: 1 !important;
  backdrop-filter: blur(3px);

  i {
    text-shadow: 0 0 3px white;
  }

  tr:nth-child(even) {
    background-color: $primary !important;
  }

  tr:nth-child(odd) {
    background-color: #fff !important;
  }
}

tr:nth-child(odd) {
  background-color: #fff !important;
}

@media (max-width: $breakpoint-sm-max) {
  .datagrid-header-search {
    order: 1;
    margin-top: 10px;
  }
}
//
//.q-table__top {
//  padding: 0px !important;
//}

.data-grid-max-height {
  max-height: calc(100vh - 115px)
}

.data-grid-th-row-first {
  position: sticky;
  top: 0;
  z-index: 2;
}

.data-grid-th-row-second {
  position: sticky;
  top: 28px;
  z-index: 2;
}
</style>

