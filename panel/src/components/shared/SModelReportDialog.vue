<template>
  <q-dialog
    v-model="showDialog"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-hide="closed"
    @show="onShow"
    @hide="onHide"
  >
    <q-card class="bg-grey-2" v-if="view===views.reports" style="width: 350px">
      <q-card-section class="text-bold row justify-between items-center">
        <div>
          انتخاب گزارش
        </div>
        <q-btn class="border-radius" icon="close" color="red-2" text-color="red-13" unelevated dense v-close-popup>
          <q-tooltip>بستن</q-tooltip>
        </q-btn>
      </q-card-section>
      <q-separator/>
      <q-card-section class="column q-gutter-y-sm">
        <!--        <div class="q-my-xs row">-->
        <!--          <q-btn unelevated class="col border-radius" color="cyan-2" text-color="cyan-8" label="پیشفرض"/>-->
        <!--        </div>-->
        <div class="q-my-xs row" v-for="report of reports">
          <q-btn unelevated class="col q-my-md full-width border-radius" :color="report.isLocked?'teal-2':'green-2'"
                 :text-color="report.isLocked?'teal-8':'green-8'"
                 :label="report.title" @click="openReport(report)">
            <q-tooltip v-if="!!report.description.trim()">
              {{ report.description }}
            </q-tooltip>
          </q-btn>
          <q-btn v-if="!report.isLocked" unelevated dense class="col-auto" round color="light-blue-1" text-color="light-blue"
                 icon="edit"
                 @click="editReport(report)"/>
          <q-btn unelevated dense class="col-auto" round color="red-1" text-color="red" icon="delete"
                 v-if="!report.isLocked">
            <q-popup-proxy cover anchor="center left">
              <div class="row">
                <div class="q-pa-xs row">
                  <q-btn class="col" color="red-1" text-color="red" icon="check" dense unelevated @click="deleteReport(report)"/>
                </div>
                <div class="q-pa-xs row">
                  <q-btn class="col" color="light-blue-1" text-color="light-blue" dense icon="close" unelevated v-close-popup/>
                </div>
              </div>
            </q-popup-proxy>
          </q-btn>
        </div>
        <div class="q-my-xs">
          <q-btn outline icon="add" class="q-my-md full-width border-radius" color="positive" label="گزارش جدید"
                 @click="addReport"/>
        </div>
      </q-card-section>
      <q-inner-loading :showing="loading"/>
    </q-card>
    <q-card class="bg-grey-2" v-else-if="view===views.edit" style="min-width: 1100px !important;">
      <q-card-section class="text-bold row justify-between items-center">
        <div>
          ویرایش گزارش
        </div>
        <q-btn class="border-radius" icon="close" color="red-2" text-color="red-13" unelevated dense v-close-popup>
          <q-tooltip>بستن</q-tooltip>
        </q-btn>
      </q-card-section>
      <q-separator/>
      <q-card-section class="row">
        <div class="col-12 row">
          <q-input class="col-4 q-pr-sm" dense outlined v-model="report.title" label="عنوان" :maxlength="25"
                   ref="reportTitle" :rules="[val => val.length > 0 || 'عنوان را وارد نمایید']"/>
          <q-input class="col-8" dense outlined v-model="report.description" label="توضیحات"/>
        </div>
        <div class="col-12 row q-mt-md">
          <div
            class="full-width border-radius border-right-medium bg-light-blue-1 q-pa-md text-subtitle2 text-weight-regular text-light-blue">
            فیلدهای موجود
          </div>
        </div>
        <div class="col-12 row">
          <model-report-draggable-layout :cols="cols" v-model="report.layout" @input="logMe($event)" class="col"/>
        </div>
      </q-card-section>
      <q-separator/>
      <q-card-section class="text-bold row q-gutter-x-md justify-end">
        <!-- submit -->
        <div>
          <q-btn class="border-radius" color="green-2" text-color="green-7" label="ثبت" :loading="loading"
                 unelevated @click="submit"/>
        </div>

        <!-- close -->
        <div>
          <q-btn class="border-radius" color="red-2" text-color="red-7" label="بازگشت" unelevated
                 @click="view=views.reports"/>
        </div>
      </q-card-section>
    </q-card>

    <!-- error dialog -->
    <s-dialog ref="errorDialog" title="خطا" :full-screen-button="false" :close-button="false">

      <!-- info -->
      <div class="col">
        <div class="text-subtitle2 text-weight-regular">
          فیلدی برای گزارش انتخاب نشده است
        </div>
      </div>

      <template v-slot:actions>
        <q-btn class="border-radius q-px-md" color="green-2" text-color="green-7" label="تایید" unelevated dense
               v-close-popup/>
      </template>

    </s-dialog>

  </q-dialog>
</template>

<script>

import ModelReportDraggableLayout from "../model/ModelReportDraggableLayout";
import SDialog from "./SDialog";

export default {
  name: 'SModelReportDialog',
  components: {SDialog, ModelReportDraggableLayout},
  data: () => ({
    showDialog: false,
    resolve: null,
    func: Function,
    loading: true,
    apiUrl: process.env.API_URL,
    view: 1,
    views: {
      reports: 1,
      edit: 2
    },
    reports: [],
    report: [],
  }),
  props: {
    serviceName: String,
    modelName: String,
    cols: Array,
    filter: String,
    sort: String,
    reportParams: Object | Array
  },
  computed: {
    service() {
      return this.$store.getters.getService(this.serviceName)
    },
    model() {
      return this.$store.getters.getServiceModel(this.serviceName, this.modelName)
    }
  },
  methods: {
    logMe(e) {
      console.log('i\'ve logged:', e)
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
    close() {
      this.showDialog = false
    },
    closed() {
      this.showDialog = false
      if (this.resolve != null) {
        this.resolve(false)
      }
    },
    async onShow() {
      this.$emit('show')
      await this.loadReports()
    },
    onHide() {
      this.$emit('hide')
      this.view = this.views.reports
    },


    addReport() {
      this.view = this.views.edit
      this.report = {
        id: 0,
        modelId: this.model.id,
        title: '',
        description: '',
        layout: []
      }
    },
    async loadReports() {
      this.loading = true
      const res = await this.$axios.get(`${process.env.API_URL}/core/modelReport/reports`, {
        params: {
          serviceName: this.serviceName,
          modelName: this.modelName
        }
      })
      this.reports = res.data.result
      this.loading = false
    },
    async editReport(report) {
      this.view = this.views.edit
      this.report = Object.assign({}, report, {layout: JSON.parse(report.layout)})
    },
    async deleteReport(report) {
      let res = await this.$axios.delete(`${process.env.API_URL}/Core/ModelReport/${report.id}`)
      await this.loadReports()
    },
    async submit() {
      let validateTitle = this.$refs.reportTitle.validate()
      if (!validateTitle) return
      if (this.report.layout.length < 1) {
        this.$refs.errorDialog.open()
        return
      }
      this.loading = true
      let data = Object.assign({}, this.report, {layout: JSON.stringify(this.report.layout)})
      let res = await this.$axios.post(`${process.env.API_URL}/Core/ModelReport/upsert`, data)
      this.view = this.views.reports
      await this.loadReports()
    },
    openReport(report) {
      if (report.reportId > 0 && report.reportName) {
        this.$openReport(report.reportName, {
          modelName: this.report.modelName,
          serviceName: this.report.serviceName, ...(this.reportParams || {})
        })
      } else {
        let address = `${location.origin}/report/Print/${report.id}?filter=${this.filter || ''}&sort=${this.sort || ''}&reportParams=${encodeURIComponent(JSON.stringify(this.reportParams || {}))}`
        window.open(address)
      }
    }
  },
  mounted() {
    console.log('filterString', this.filter)
  }
}
</script>

<style lang="scss" scoped>
.border-right-medium {
  border-left: 5px solid $light-blue;
}
</style>

