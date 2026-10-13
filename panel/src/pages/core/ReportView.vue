<template>
  <q-page class="fullscreen">
    <q-inner-loading :showing="isLoading">
      در حال دریافت اطلاعات
      <q-spinner-dots size="xl"/>
    </q-inner-loading>
    <iframe v-if="url" style="border: none" @load="reportLoaded" id="reportFrame"
            width="100%" height="100%" :src="url"></iframe>
  </q-page>
</template>

<script>
export default {
  name: "ReportView",
  data: () => ({
    isLoading: true,
  }),
  computed: {
    reportName() {
      return this.$route && this.$route.params && this.$route.params.reportName
    },
    query() {
      return this.$route.query
    },
    url() {
      let reportAddress = this.$route.fullPath.split('/report/')[1]
      console.log('reportAddress', reportAddress, `${process.env.REPORT_URL}/${reportAddress}`)
      return `${process.env.REPORT_URL}/${reportAddress}`
    }
  },
  methods: {
    reportLoaded() {
      this.isLoading = false
      let reportFrame = document.getElementById("reportFrame");
      reportFrame.contentWindow.postMessage({accessToken: localStorage.getItem('accessToken')}, process.env.REPORT_URL);
    }
  },
  meta() {
    return {title: 'چاپ گزارش'}
  },

  mounted() {
    window.onmessage = function (e) {
      if (e && e.data && e.data.metaTitle)
        document.title = ('چاپ') + ' ' + e.data.metaTitle
    };
  }
}
</script>

<style scoped>

</style>

