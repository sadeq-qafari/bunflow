<template>
  <q-page class="full-width">

    <!-- header -->
    <q-card class="q-mb-sm" flat bordered>
      <q-toolbar class="rounded-borders">

        <!-- label -->
        <span>داشبورد: </span>

        <!-- tabs -->
        <q-tabs stretch align="left"
                v-model="dashboardId"
        >
          <q-tab v-for="dashboard of dashboards" :name="dashboard.id" :label="dashboard.title"
                 :key="JSON.stringify(dashboard)"/>
        </q-tabs>

        <q-space/>

        <!-- add button -->
        <q-btn v-if="status === statuses.view" stretch flat icon="add" @click="addDashboard"/>

        <!-- edit button -->
        <q-btn v-if="status === statuses.view" icon="edit_note" flat stretch @click="editDashboard"/>

      </q-toolbar>
    </q-card>

    <!-- dashboard view -->
    <q-card flat v-if="status === statuses.view" class="bg-transparent">
      <q-card-section class="row q-pa-none q-col-gutter-md">
        <div v-for="report of reports" :class="[`col-md-3 col-12 row`]" :key="JSON.stringify(report)">
          <s-report :report="report"/>
        </div>
      </q-card-section>
    </q-card>

    <!-- dashboard add / edit -->
    <q-card flat bordered v-else-if="!isLoading">

      <!-- label -->
      <q-card-section class="text-bold">
        افزودن داشبورد جدید
      </q-card-section>

      <q-separator/>

      <!-- dashboard title -->
      <q-card-section>
        <q-input outlined dense label="عنوان داشبورد" v-model="dashboardTitle"/>
      </q-card-section>

      <!-- reports label -->
      <q-card-section class="text-bold">
        گزارشات:
      </q-card-section>

      <!-- reports selection -->
      <q-card-section class="row">
        <q-checkbox class="col-12 col-md-3" :label="item.title" :model-value="getSelectedReport(item)"
                    @update:model-value="selectReport(item)"
                    v-for="item of allReports" :key="JSON.stringify(item)"/>
      </q-card-section>

      <q-separator/>

      <!-- actions -->
      <q-card-section class="full-width q-pa-sm">
        <div class="row q-gutter-x-sm justify-end items-center">

          <!-- submit -->
          <div>
            <q-btn class="rounded-borders" label="ثبت" icon-right="save" color="green-2" text-color="green-7" unelevated
                   @click="saveDashboard"/>
          </div>

          <!-- delete -->
          <div>
            <q-btn class="rounded-borders" label="حذف" icon-right="delete_forever" color="red-2" text-color="red-7"
                   unelevated @click="deleteDashboard"/>
          </div>

          <!-- cancel -->
          <div>
            <q-btn class="rounded-borders" label="انصراف" icon-right="close" color="orange-2" text-color="orange-7"
                   unelevated @click="loadDashboards"/>
          </div>

        </div>
      </q-card-section>

    </q-card>

    <!-- loading state -->
    <q-inner-loading :showing="isLoading">
      <q-spinner-dots size="100px"></q-spinner-dots>
    </q-inner-loading>

  </q-page>
</template>

<script>
import SWidget from "components/shared/SWidget";
import {defineComponent} from "vue";
import SReport from "components/shared/SReport";

export default defineComponent({
  name: 'Dashboard',
  components: {SReport, SWidget},
  data: () => ({
    isLoading: true,
    allReports: [],
    selectedReports: [],
    dashboardTitle: '',
    dashboardId: null,
    status: 1,
    statuses: {
      view: 1,
      edit: 2
    },
    dashboards: []
  }),
  watch: {
    async dashboardId(to, from) {
      if (to === 0 && this.allReports.length === 0) {
        await this.getAllReports()
      }
      // this.status = this.statuses.view
    }
  },
  computed: {
    reports() {
      let index = this.dashboards.findIndex(x => x.id === this.dashboardId)
      return this.dashboards[index].reports
    }
  },
  methods: {
    getCol(report) {
      let count = 0
      for (let i in report.result[0]) {
        count++
      }
      if (count > 6 && count < 12) count = 6
      if (count > 12) count = 12
      if (count === 1) count = 2
      return count
    },
    isChart(report) {
      return Object.keys(report.result[0]).length > 1
    },
    async addDashboard() {
      this.status = this.statuses.edit
      if (this.allReports.length === 0) {
        await this.getAllReports()
      }
      if (this.dashboards.findIndex(x => x.id === 0) === -1)
        this.dashboards.push({id: 0, title: 'جدید'})
      this.selectedReports = []
      this.dashboardTitle = ''
      this.dashboardId = 0
    },
    async editDashboard() {
      if (this.allReports.length === 0) {
        await this.getAllReports()
      }
      let dashboard = this.dashboards.find(x => x.id == this.dashboardId)
      console.log('dashboard', dashboard)
      this.selectedReports = dashboard.reports.map(x => x.id)
      this.dashboardTitle = dashboard.title
      this.status = this.statuses.edit
    },

    //#region report checkboxes
    getSelectedReport(report) {
      let index = this.selectedReports.findIndex(x => x === report.id)
      return (index >= 0)
    },
    selectReport(report) {
      let index = this.selectedReports.findIndex(x => x === report.id)
      if (index >= 0) {
        this.selectedReports.splice(index, 1)
      } else {
        this.selectedReports.push(report.id)
      }
    },
    //#endregion report checkboxes

    async getAllReports() {
      const res = await this.$axios.get(`${process.env.API_URL}/Tenant/Report/all`)
      this.allReports = res.data.result
    },
    async saveDashboard() {
      if (this.dashboardTitle.length <= 0) {
        this.$q.notify({
          message: "عنوان داشبورد را مشخص کنید",
          color: "negative"
        })
        return
      }
      if (this.selectedReports.length <= 0) {
        this.$q.notify({
          message: "گزارشات مورد نظر را مشخص کنید",
          color: "negative"
        })
        return
      }
      // const res = await this.$axios.post(`${process.env.API_URL}/Tenant/Dashboard`, {
      //   title: this.dashboardTitle,
      //   reportIds: this.selectedReports
      // })

      await this.$axios.post(`${process.env.API_URL}/tenant/dashboard/upsert`, {
        dashboardId: this.dashboardId,
        dashboardTitle: this.dashboardTitle,
        reportIds: this.selectedReports.join(',')
      })
      await this.loadDashboards()
    },
    async loadDashboards() {
      this.isLoading = true
      this.status = this.statuses.view
      const res = await this.$axios.get(`${process.env.API_URL}/Tenant/Dashboard/load`)
      this.dashboards = res.data.result
      if (this.dashboards.length > 0)
        this.dashboardId = this.dashboards[0].id
      this.isLoading = false
    },
    async deleteDashboard() {
      await this.$axios.delete(`${process.env.API_URL}/tenant/dashboard/${this.dashboardId}`)
      this.status = this.statuses.view
      await this.loadDashboards()
    }
  },
  async mounted() {
    await this.loadDashboards()
  }
})
</script>


