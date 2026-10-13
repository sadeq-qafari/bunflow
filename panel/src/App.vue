<template>
  <div id="q-app">
    <router-view/>
  </div>
</template>
<script>
import {defineComponent} from 'vue'
import appPackage from "../package.json";
import * as moment from 'jalali-moment'

export default defineComponent({
  name: 'App',
  mounted() {
    window.addEventListener('keydown', async (e) => {
      if (e.code == "KeyS" && e.ctrlKey && e.altKey) {
        let img = await this.$screenshot()
        let data = new FormData()

        let text = `<b>Browser: </b>${this.$q.platform.is.name} ${this.$q.platform.is.version}\n`
        text += `<b>OS: </b>${this.$q.platform.is.platform}\n`
        text += `<b>AppVersion: </b>${appPackage.version}\n`
        this.$store.state.user ? text += `<b>User: </b>${this.$store.state.user.given_name} ${this.$store.state.user.family_name}\n<b>UserId: </b>${this.$store.state.user.sub}\n<b>UserName: </b>${this.$store.state.user.username}\n` : undefined;
        this.$store.state.tenant ? text += `<b>Tenant: </b>${this.$store.state.tenant.title}\n` : undefined
        text += `<b>Current Url: </b>${location.href}\n`
        text += moment().format('jYYYY/jMM/jDD')

        data.append('file', img)
        data.append('text', text)
        data.append('messageName', "ReportError")
        this.$axios.post(`${process.env.API_URL}/Notify/message/send`, data, {noNotify: true}).then(res => {
          if (res.data.success)
            console.log('screenshot sent')
        }).catch(() => {
          console.log('sending screenshot failed')
        })
      }
    });
  },
})
</script>

