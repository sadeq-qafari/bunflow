<template>
  <q-dialog
    v-model="showDialog"
    persistent
    :maximized="maximizedToggle"
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-hide="closed"
  >
    <q-card class="bg-grey-2" :style="maximizedToggle ? {} : {width: width, maxWidth: width}">
      <q-bar>
        <q-space/>

        <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
          <q-tooltip v-if="maximizedToggle">کوچک نمایی</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
          <q-tooltip v-if="!maximizedToggle">تمام صفحه</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>بستن</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <div><strong>تغییر کلمه عبور</strong></div>
      </q-card-section>

      <q-separator color="grey-4"/>

      <q-card-section class="row q-col-gutter-sm items-center">
        <q-input outlined dense label="رمز عبور فعلی" v-model="currentPassword"/>
        <q-input outlined dense label="رمز عبور جدید" v-model="newPassword1"/>
        <q-input outlined dense label="تکرار رمز عبور جدید" v-model="newPassword2"/>
      </q-card-section>

      <q-separator color="grey-4"/>

      <q-card-section class="q-pt-none q-mt-sm q-gutter-sm">
        <slot name="actions">
          <q-btn label="ثبت" unelevated color="positive" @click="submit"/>
          <q-btn label="لغو" unelevated outline color="negative" v-close-popup/>
        </slot>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'SChangePasswordDialog',
  components: {},
  props: {
    size: {
      type: String,
      default: 'sm'
    }
  },
  computed: {
    width() {
      switch (this.size) {
        case 'sm':
          return '450px';
        case 'md':
          return '750px';
        case 'lg':
          return '950px';
        case 'full':
          return '100%';
        default:
          return '450px';
      }
    }
  },
  data: () => ({
    showDialog: false,
    maximizedToggle: false,
    resolve: null,
    currentPassword: null,
    newPassword1: null,
    newPassword2: null,
  }),
  methods: {
    open() {
      return new Promise((resolve, reject) => {
        this.showDialog = true
        this.resolve = resolve
      })
    },
    showError(msg) {
      this.$q.notify({
        message: msg,
        type: 'negative'
      })
    },
    showSuccess(msg) {
      this.$q.notify({
        message: msg,
        type: 'positive'
      })
    },
    validatePassword() {
      let res = true
      if (!this.newPassword1) {
        this.showError('رمز عبور جدید را وارد کنید')
        res = false
      }
      if (!this.newPassword2) {
        this.showError('تکرار رمز عبور جدید را وارد کنید')
        res = false
      }
      if (this.newPassword1.length < 6) {
        this.showError('رمز عبور باید حداقل 6 رقم باشد')
        res = false
      }
      if (this.newPassword1 !== this.newPassword2) {
        this.showError('تکرار رمز عبور جدید با رمز عبور جدید برابر نیست')
        res = false
      }
      return res
    },
    async submit() {
      if (this.validatePassword()) {
        const res = await this.$api.identity.account.changePassword(this.currentPassword, this.newPassword2)
        if (res && res.data && res.data.result){
          this.showSuccess('رمز عبور با موفقیت تغییر یافت')
          this.resolve(true)
        }else{
          this.showError('خطا در تغییر رمز عبور')
          return
        }
      } else {
        return
      }
      this.resolve = null
      this.showDialog = false
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
  }
}
</script>

<style scoped>

</style>

