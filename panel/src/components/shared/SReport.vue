<template>
  <q-card :class="['col',fullscreen?'fullscreen':undefined ]" flat bordered>
    <q-card-section class="q-pa-none">
      <q-toolbar>
        <q-icon v-if="report.icon" size="sm" :name="report.icon"/>
        <span class="q-ml-sm">{{ report.title }}</span>
        <q-space/>
        <div>
          <q-btn round flat :icon="fullscreen ? 'fullscreen_exit':'fullscreen'" @click="fullscreen=!fullscreen"/>
        </div>
      </q-toolbar>
    </q-card-section>
    <q-separator/>
    <q-card-section v-if="isChart(report)" :style="{height:fullscreen?'90%':'1%'}">
      <chart :label="report.title" :data="report.result" :type="report.typeLookup"/>
    </q-card-section>
    <q-card-section v-else class="q-pt-xl">
      <div class="text-h6">{{ simpleReportTitle }}</div>
      <div class="text-right text-h4">{{ simpleReportValue }}</div>
    </q-card-section>
  </q-card>
</template>

<script>

import Chart from "components/chart/Chart";
import SWidget from "components/shared/SWidget";

export default {
  components: {
    SWidget,
    Chart
  },
  name: "SReport",
  props: {
    report: Object
  },
  computed: {
    simpleReportTitle() {
      if (this.report && this.report.result && this.report.result.length > 0)
        return this.report?.result[0][Object.keys(this.report.result[0])]?.split(' ')[1]
    },
    simpleReportValue() {
      if (this.report && this.report.result && this.report.result.length > 0)
        return this.report.result[0][Object.keys(this.report.result[0])]?.split(' ')[0]
    },
  },
  data: () => ({
    fullscreen: false
  }),
  methods: {
    isChart(report) {
      if (report && report.result && report.result.length > 0)
        return Object.keys(report.result[0]).length > 1
    }
  }
}
</script>

<style scoped>

</style>

