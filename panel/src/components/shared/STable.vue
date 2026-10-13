<template>
  <q-table
    dense
    separator="vertical"
    :loading="loading"
    :title="$t(`${tableName}.table.title`)"
    :rows="data"
    :columns="columns"
    row-key="id"
    v-model:pagination="pagination"
    :visible-columns="visibleColumns"
    @request="onRequest"
    :virtual-scroll-sticky-size-start="60"
    class="sticky-table-header"
  >
    <template v-slot:top="props">
      <q-toolbar class="text-grey-14">
        <q-toolbar-title>
          <div class="col-2">
            <q-icon size="sm" name="bookmark_border"/>
            <span><small>{{$t(`${tableName}.table.title`)}}</small></span>
          </div>
        </q-toolbar-title>
        <q-select
          v-model:model-value="visibleColumns"
          multiple
          outlined
          dense
          options-dense
          :display-value="$q.lang.table.columns"
          emit-value
          map-options
          :options="columns"
          option-value="name"
          style="min-width: 150px"/>
        <q-btn unelevated round dense outline color="positive" icon="add" class="q-mx-xs"/>
        <q-btn unelevated round dense outline color="primary" @click="openFilterDialog" icon="search" class="q-mx-xs"/>
        <q-btn unelevated round dense outline color="secondary" icon="description" class="q-mx-xs"/>
        <q-btn unelevated round dense outline color="warning" icon="o_view_week" class="q-mx-xs"/>
        <q-btn unelevated round dense outline color="accent" class="q-mx-xs"
               :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
               @click="props.toggleFullscreen"/>
      </q-toolbar>
      <q-slide-transition>
        <div v-show="showFilters">
          <q-card flat bordered class="q-ma-sm">
            <q-badge>عنوان: تارا</q-badge>
          </q-card>
        </div>
      </q-slide-transition>
      <s-dialog size="md" ref="filterDialog" title="جستجوی پیشرفته" description="جستجو کننده ی پیشرفته"
                :components="filterComponents">
      </s-dialog>
    </template>
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          class="bg-primary text-white q-ml-lg">
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>
    <template v-slot:body-cell="props">
      <q-td :props="props">
        <q-checkbox disable dense v-if="typeof props.value == 'boolean'" v-model="props.value"/>
        <template v-else>
          {{props.value}}
        </template>
      </q-td>
    </template>
    <template v-slot:header-cell-actions="props">
      <q-th :props="props" class="text-center sticky-column">
        {{ $t('common.actions') }}
      </q-th>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td :props="props" class="text-center sticky-column">
        <q-btn unelevated outline size="sm" round icon="o_edit" color="secondary" class="q-mx-xs">
          <q-tooltip>{{$t('common.edit')}}</q-tooltip>
        </q-btn>
        <q-btn unelevated outline size="sm" round icon="o_delete" color="negative" class="q-mx-xs">
          <q-tooltip>{{$t('common.delete')}}</q-tooltip>
        </q-btn>
      </q-td>
    </template>
    <q-inner-loading v-if="loading">
      <!---------------NOT WORKING-------------->
      <q-spinner
        color="primary"
        size="3em"
        :thickness="10"
      />
    </q-inner-loading>
  </q-table>
</template>

<script>
  import SDialog from "components/shared/SDialog";
  import {ref} from 'vue'

  export default {
    name: "STable",
    components: {SDialog},
    props: {
      tableName: String,
      fetcher: Function,
      visibleColumns: {
        type: Array,
        required: false,
        default: []
      }
    },
    data: () => ({
      loading: false,
      filterComponents: [],
      filters: {},
      testModel: ref(''),
      data: [],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 3,
        rowsNumber: 10
      },
      columns: [],
      showFilters: false
    }),
    methods: {
      async openFilterDialog() {
        const res = await this.$refs.filterDialog.open()
        let filterList = []
        for (let key in this.filters) {
          if (this.filters[key].value) {
            if (filterList.length > 0) {
              filterList.push("and")
            }
            filterList.push([key, this.filters[key].operator, this.filters[key].value])
          }
        }
        if (res) {
          await this.onRequest({pagination: {page: 1, rowsPerPage: 10, sortBy: '', descending: false}, filter: filterList})
        }
      },
      async onRequest(props) {
        const {page, rowsPerPage, sortBy, descending} = props.pagination
        const filter = props.filter

        this.loading = true

        try {
          const sort = sortBy ? [{selector: sortBy, desc: descending}] : null
          const res = await this.fetcher(rowsPerPage * (page - 1), rowsPerPage, filter, sort)
          const model = res.data && res.data.isSuccess && res.data.model
          if (model) {
            this.data = model.data
            this.columns = []
            const ignoreFields = ['rownumber', 'id', 'actionby', 'tenantid']
            if (this.data.length > 0) {
              for (let column in this.data[0]) {
                if (ignoreFields.includes(column.toString().toLowerCase())) continue
                this.columns.push({
                  name: column,
                  field: column,
                  label: this.$t(`${this.tableName}.table.columns.${column}`),
                  align: 'center',
                  sortable: true
                });
              }
              this.columns.push({
                name: 'actions',
                label: this.$t('common.actions'),
                align: 'center',
                required: true
              })
              if (this.visibleColumns.length === 0)
                this.visibleColumns = this.columns.map(x => x.name).filter(x => !x.endsWith('Id'))
              if (this.filterComponents.length == 0) {
                for (let key in this.data[0]) {
                  if(!key.endsWith('Id') && key!='id' && key!='rowNumber'){
                    switch (typeof this.data[0][key]) {
                      case "string":
                        this.filters[key] = {
                          label: this.$t(`${this.tableName}.table.columns.${key}`),
                          operator: 'contains',
                          value: null
                        }
                        this.filterComponents.push({
                          name: 'q-input',
                          props: {
                            dense: true,
                            label: this.$t(`${this.tableName}.table.columns.${key}`),
                            outlined: true,
                          },
                          vModel: this.filters[key]
                        })
                        break
                      case "number":
                        this.filters[key] = {
                          label: this.$t(`${this.tableName}.table.columns.${key}`),
                          operator: '=',
                          value: null
                        }
                        this.filterComponents.push({
                          name: 'q-input',
                          props: {
                            type: 'number',
                            dense: true,
                            label: this.$t(`${this.tableName}.table.columns.${key}`),
                            outlined: true,
                          },
                          vModel: this.filters[key]
                        })
                        break
                      case "boolean":
                        this.filters[key] = {
                          label: this.$t(`${this.tableName}.table.columns.${key}`),
                          operator: '=',
                          value: null
                        }
                        this.filterComponents.push({
                          name: 'q-toggle',
                          props: {
                            label: this.$t(`${this.tableName}.table.columns.${key}`),
                          },
                          vModel: this.filters[key]
                        })
                        break
                    }
                  }
                }
              }

            }

            this.pagination.rowsNumber = model.totalCount
            this.pagination.page = page
            this.pagination.rowsPerPage = rowsPerPage
            this.pagination.sortBy = sortBy
            this.pagination.descending = descending
          }
        } catch
          (e) {

        }

        this.loading = false
      }
    },
    mounted() {
      this.onRequest({pagination: {page: 1, rowsPerPage: 10, sortBy: '', descending: false}})
    }
  }
</script>

<style lang="scss">
  .sticky-table-header {
    height: 410px !important;

    thead tr th {
      position: sticky;
      z-index: 1;
    }

    thead tr:last-child th {
      top: 48px;
    }
    thead tr:first-child th {
      top: 0;
    }
  }
  .sticky-column {
    position: sticky !important;
    right: 0 !important;
    z-index: 1 !important;
    backdrop-filter: blur(3px);

    i {
      text-shadow: 0px 0px 3px white;
    }

    tr:nth-child(even) {
      background-color: $primary !important;
    }

    tr:nth-child(odd) {
      background-color: #fff !important;
    }
  }

  tr:nth-child(even) {
    background-color: #f1f1f1 !important;

  }

  tr:nth-child(odd) {
    background-color: #fff !important;
  }
</style>

