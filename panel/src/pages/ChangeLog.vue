<template>
  <q-page class="row justify-start" style="background: rgb(230,248,255);
background: linear-gradient(195deg, rgba(255,255,255,1) 0%, rgba(230,248,255,1) 25%, rgba(230,248,255,1) 75%, rgba(255,255,255,1) 100%);">
    <q-timeline layout="comfortable" color="primary" class="col-6">
      <q-timeline-entry heading class="row justify-center ">
        <div class="col">تاریخچه تغییرات</div>

      </q-timeline-entry>

      <q-timeline-entry v-for="(ver,i) of versions"  :key="JSON.stringify(ver)">
        <template v-slot:title>
          <b class="text-black">{{ ver.title }}</b>
        </template>
        <template v-slot:subtitle>
          <p class="text-bold">{{ ver.releaseDate.toJalaliFullDate() }}</p>
        </template>
        <div v-html="ver.description"/>
      </q-timeline-entry>
    </q-timeline>
  </q-page>
</template>

<script>
export default {
  name: "ChangeLog",
  data: () => ({
    versions: []
  }),
  computed: {
    layout() {
      return this.$q.screen.lt.sm ? 'dense' : (this.$q.screen.lt.md ? '' : 'loose')
    }
  },
  methods: {
    async loadChangeLog() {
      const res = await this.$axios.get(`${process.env.API_URL}/Core/Version/changeLog/5`)
      this.versions = res.data.result
    }
  },
  async mounted() {
    await this.loadChangeLog()
  }
}
</script>

<style scoped>

</style>

