<template>
  <div class="col row border-radius q-pl-xs" style="border:1px solid #e1e1e1">
    <span class="q-px-xs text-grey-6 cursor-pointer" v-if="!(filterChips.length>0)"
          @click="showDialog = true">جستجوی پیشرفته</span>
    <q-chip class="col-auto q-px-xs cursor-pointer" v-for="filter of filterChips" :key="filter.value"
            :label="filter.label" :outline="!filter.active" :clickable="!filter.active"
            color="primary" :text-color="filter.active?'white':undefined"
            :removable="filter.active" @remove="$emit('removeChipFilter',filter)"
            @click="$emit('addChipFilter',filter)"/>
    <q-space/>
    <q-btn flat icon="close" dense rounded color="red" class="cursor-pointer"
           v-if="filters.length>0 || filterChips.filter(x=>x.active).length>0"
           @click="$emit('clear-filters')">
      <q-tooltip>
        حذف فیلترها
      </q-tooltip>
      <q-badge color="red-2" transparent text-color="red-14" floating>{{
          filters.length + filterChips.filter(x => x.active).length
        }}
      </q-badge>
    </q-btn>
    <q-btn unelevated round dense text-color="light-blue" color="white" icon="search" @click="showDialog = true">
      <q-tooltip>
        جستجوی پیشرفته
      </q-tooltip>
    </q-btn>

    <q-dialog
      v-model="showDialog"
      :maximized="maximizedToggle"
      @show="$emit('show')"
      @hide="$emit('hide')"
    >
      <q-card :class="['bg-grey-2 overflow-hidden', isMobile ? 'full-height' : hasLotsOfComponents ? 'full-height' : undefined]"
              style="width: 920px; max-width: 80vw; border-radius: 1rem !important;">
        <div :class="['column full-width', isMobile ? 'full-height' : hasLotsOfComponents ? 'full-height' : undefined]">

          <q-toolbar class="row full-width col-auto q-py-sm" style="border-bottom: 1px solid lightgrey">
            <q-toolbar-title>
              <q-icon class="q-mr-sm" color="primary" name="search" style="font-size: 24px;"/>
              <small>جستجوی پیشرفته</small>
            </q-toolbar-title>

            <q-btn dense flat round icon="fullscreen_exit" color="grey" @click="maximizedToggle = false"
                   v-if="maximizedToggle">
              <q-tooltip v-if="maximizedToggle">کوچک نمایی</q-tooltip>
            </q-btn>
            <q-btn dense flat round icon="fullscreen" color="grey" @click="maximizedToggle = true"
                   v-if="!maximizedToggle">
              <q-tooltip v-if="!maximizedToggle">تمام صفحه</q-tooltip>
            </q-btn>
            <q-btn dense flat round icon="close" color="red-13" v-close-popup>
              <q-tooltip>بستن</q-tooltip>
            </q-btn>
          </q-toolbar>

          <div class="column full-width col">

            <!-- mobile -->
            <q-scroll-area v-if="isMobile || hasLotsOfComponents" class="full-width col q-pr-sm">
              <q-card-section class="row full-width q-col-gutter-sm items-start">
                <s-filter-input v-for="(item,index) in components.filter(x => x.property.id > 0)"
                                :property="Object.assign({},item.property, {viewSize: '6'}) "
                                :model="item.model" :event="item.events" :key="index"/>
              </q-card-section>
            </q-scroll-area>

            <!-- desktop -->
            <q-card-section v-else
                            class="row full-width q-pl-none q-col-gutter-md items-start">
              <s-filter-input v-for="(item,index) in components.filter(x => x.property.id > 0)"
                              :property="Object.assign({},item.property, {viewSize: '6'}) "
                              :model="item.model" :event="item.events" :key="index"/>
            </q-card-section>

          </div>

          <q-card-section class="row full-width col-auto no-padding"
                          style="border-top: 1px solid lightgrey">
            <div class="row full-width q-pa-sm justify-end">
              <slot name="actions">
                <q-btn class="border-radius" label="انصراف" unelevated outline color="primary" v-close-popup/>
                <div class="q-ml-sm">
                  <q-btn class="border-radius" label="جستجو" unelevated color="primary" @click="$emit('filter')"/>
                </div>
              </slot>
            </div>
          </q-card-section>

        </div>

      </q-card>
    </q-dialog>
  </div>
</template>

<script>

import SFilterInput from "components/shared/SFilterInput";
import SDialog from "components/shared/SFilterDialog";

export default {
  name: "SDataGridFilter",
  components: {SDialog, SFilterInput},
  data: () => ({
    showDialog: false,
    maximizedToggle: false
  }),
  props: {
    components: {
      type: Array,
      required: false,
      default: () => [],

    },
    filterChips: Array | null

  },
  watch: {},
  computed: {
    filters() {
      let items = this.components.map(x => ({
        label: x.property.title,
        op: x.model.value.type,
        value: x.model.value.value,
        elementType: x.model.value.elementType,
        component: x
      }))
      let filterList = [];
      for (let item of items) {
        if (this.isFilterValueValid(item.elementType, item.value)) {
          filterList.push(item)
        }
      }
      return filterList
    },
    hasLotsOfComponents() {
      return this.components.filter(x => x.property.id > 0).length > 20
    },
    isMobile() {
      return this.$q.screen.lt.md
    }
  },
  mounted() {

  },
  methods: {
    getFilterItemValue(item) {
      switch (item.elementType) {
        case "string":
          return `: ${item.value.join(' ،')}`
        case "int":
        case "tinyint":
        case "smallint":
        case "decimal":
        case "float":
        case "double":
        case "long":
          return `: ${item.value.join(' ،')}`
        case "bool":
          return item.value[0] == 'true' ? '✓' : '✕'
        case "dropdown":
        case "lookup":
        case "chips":
          return `: ${item.value.length} مورد`
        case "date":
        case "datetime":
        case "time":
          return `: ${item.value.join(' ،')}`
        default :
          break
      }
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
          return val && (val[0] == 'false' || val[0] == 'true')
        case "dropdown":
        case "lookup":
        case "chips":
          // console.log('isFilterValueValid', val, val && val.length > 0)
          return val && val.length > 0
        case "date":
        case "datetime":
        case "time":
          return val && val[0] && val[0].trim().length > 0
        default :
          break
      }
    },
    removeFilter(filter) {
      let index = this.components.indexOf(filter.component);
      this.components[index].model.value.value = []
      this.$emit('filter')
    },
    showFilter() {
      this.$refs.searchDialog.open();

    }
  }

}
</script>

<style scoped>

</style>

