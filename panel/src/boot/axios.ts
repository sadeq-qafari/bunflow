import axios, {AxiosError, AxiosInstance, AxiosPromise} from 'axios'
import {boot} from 'quasar/wrappers'
import {Notify} from 'quasar'
import {i18n} from "boot/i18n";
import appPackage from "app/package.json";
import * as moment from "jalali-moment";

//#region Token Handling

export function SetBearerToken(token: any) {
  axios.defaults.headers['Authorization'] = `Bearer ${token}`
}

SetBearerToken(localStorage.getItem('accessToken'))
//#endregion Token Handling

Notify.setDefaults({
  position: 'bottom',
  timeout: 2500,
  textColor: 'white',
  actions: [{icon: 'close', color: 'white'}]
})

export {axios}
export type { AxiosInstance }

export default boot(({ app, store }) => {
  const globals = app.config.globalProperties
  globals.$axios = axios

  axios.interceptors.response.use((res: any) => {
    if (!res.config.noNotify && !res.config.noNotifySuccess && res.config.method != 'get') {
      Notify.create({
        type: 'positive',
        message: res.config.successMessage || 'عملیات با موفقیت انجام شد!'
      })
    }
    return res;
  }, async err => {
    if (err.response.status === 401) {
      const tryCount = err.response.config.tryCount || 0
      const tokenIsRefreshed = await store.dispatch('tryRefreshToken')
      if (tryCount < 2 && tokenIsRefreshed) {
        err.response.config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken')
        err.response.config.tryCount = tryCount + 1;
        err.response.config.errorMessage = 'عدم دسترسی'
        return axios(err.response.config);
      }
    } else {
      if (process.env.PROD && !process.env.FLOW_STANDALONE && err.response.config.url != `${process.env.API_URL}/Notify/message/send`) {
        let img = await globals.$screenshot()
        let data = new FormData()

        let text = `<b>Browser: </b>${globals.$q.platform.is.name} ${globals.$q.platform.is.version}\n`
        text += `<b>OS: </b>${globals.$q.platform.is.platform}\n`
        text += `<b>AppVersion: </b>${appPackage.version}\n`
        store.state.user ? text += `<b>User: </b>${store.state.user.given_name} ${store.state.user.family_name}\nUserId: ${store.state.user.sub}\nUserName: ${store.state.user.username}\n` : undefined;
        store.state.tenant ? text += `<b>Tenant: </b>${store.state.tenant.title}\n` : undefined
        text += `<b>Current Url: </b>${location.href}\n`
        text += `<b>Error Code: </b>${err.response.status}\n`
        text += `<b>Message: </b>${err.response.statusText}\n`
        err?.response?.data?.error ? text += `<b>Error: </b>${JSON.stringify(err.response.data.error)}\n` : undefined
        text += `<b>EndPoint: </b>${err.response.config.baseURL ? err.response.config.baseURL + '/' : ''}${err.response.config.url}\n`
        err.response.config.params ? text += `<b>Params: </b>${decodeURIComponent(JSON.stringify(err.response.config.params) || "")}\n` : undefined
        err.response.config.data && err.response.config.data.trim().length > 0 ? text += `<b>Body: </b>${decodeURIComponent(JSON.stringify(JSON.parse(err.response.config.data)) || "")}\n` : undefined
        // @ts-ignore
        text += moment().format('jYYYY/jMM/jDD')

        data.append('file', img)
        data.append('text', text)
        data.append('messageName', "ReportError")
        // @ts-ignore
        axios.post(`${process.env.API_URL}/Notify/message/send`, data, {noNotify: true}).then(res => {
          if (res.data.success)
            console.log('error sent')
        }).catch(() => {
          console.log('sending error failed')
        })
      }
    }
    if (!err.response.config.noNotify) {
      let message = err.response.config.errorMessage || 'درخواست با خطا مواجه شد!'
      let actions = []
      let progress = false
      let timeout = 5000
      let caption = err?.response?.data?.error?.details && i18n.global.t(`errors.${err?.response?.data?.error?.details}`) || err.message

      if (err.response.status === 401) {
        if (store.state.tenant?.name?.toLowerCase() == 'hamianedemo') {
          message = 'در نسخه آزمایشی امکان اعمال تغییرات وجود ندارد'
          caption = 'لطفا ثبت نام کنید'
          actions.push({
            label: 'ثبت نام', color: 'white', handler: () => {
              window.open('https://www.hamiane.com/charity-registration')
            }
          })
          progress = true
          timeout = 10000
        } else {
          caption = 'یا انقضای اعتبار ورود'
        }
      }

      Notify.create({
        type: 'negative',
        message,
        caption,
        actions,
        progress,
        timeout
      })
    }
    return err
  });
})

