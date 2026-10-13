<template>
  <q-page class="row items-center justify-evenly bg-grey-1" @keyup="loginOnEnter">
    <div v-if="!isLoading">

      <!-- if user is logged in -->
      <div
        v-show="hasToken"
        class="row justify-center items-center"
      >
        <div class="col-12 text-center q-py-sm text-subtitle1">سازمان موردنظر را انتخاب کنید</div>
        <div class="col-auto cursor-pointer" v-for="(item, index) of tenants" :key="index" @click="switchTenant(item)">
          <q-card class="q-ma-sm justify-center items-center row" flat bordered style="width: 120px; height: 120px">
            <q-card-section class="row text-grey-7 justify-center items-center q-pa-sm">
              <!-- Logo -->
              <q-img width="54px" fit="contain" :src="`${cdnUrl}${item.logo && item.logo.fileName}`"/>
            </q-card-section>
            <!-- Text -->
            <q-card-section
              class="row text-grey-7 justify-center items-center q-pa-sm"
            >
              <div>{{ item.title }}</div>
            </q-card-section>
          </q-card>
        </div>

      </div>

      <!-- login -->
      <q-card v-show="!hasToken" flat class="login-card">
        <q-item class="text-center">
          <q-item-section class="q-py-sm">
            <q-item-label>{{ $t("login.title") }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator color="grey-3"/>

        <q-card-section class="q-pa-none column">
          <q-input
            class="q-pa-sm"
            dir="ltr"
            :model-value="username"
            @update:model-value="onInputUserName"
            :label="$t('login.username')"
            borderless
            type="text"
            :rules="[val => !!val]"
          />
          <q-separator color="grey-3"/>
          <q-input
            class="q-pa-sm"
            dir="ltr"
            v-model:model-value="password"
            :label="$t('login.password')"
            borderless
            :type="showPassword ? 'text' : 'password'"
            :rules="[val => !!val]"
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-separator color="grey-3"/>

        <q-card-section horizontal class="q-pa-none overflow-hidden row">
          <q-btn class="col q-py-sm" flat stretch
                 :label="$t('login.login')"
                 color="primary"
                 @click="login"
                 :loading="isLoading"
          />
          <!--          <q-btn :label="$t('login.forget')" color="warning"/>-->
        </q-card-section>
      </q-card>

    </div>

    <q-inner-loading :showing="isLoading">
      <q-spinner-dots size="100px" color="primary"/>
    </q-inner-loading>
  </q-page>

</template>

<script lang="ts">


import {defineComponent} from 'vue'
import {api, IMenu} from "boot/api";

export default defineComponent({
  name: 'PageLogin',
  data: () => ({
    showPassword: false,
    password: '',
    username: '',
    isLoading: false,
    tenants: [],
    hasToken: false,
    cdnUrl: `${process.env.API_URL}/cdn/download/`
  }),
  methods: {
    loginOnEnter(e:any) {
      if (e.keyCode == 13)
        this.login()
    },
    async login() {
      if (this.username.length == 0 || this.password.length == 0)
        return
      this.isLoading = true
      try {
        const res = await this.$store.dispatch('login', {username: this.username, password: this.password})
        if (res.success) {
          this.hasToken = true
          if (res.tenants && res.tenants.length > 1) {
            this.tenants = res.tenants
          } else {
            await this.$router.replace('/')
          }
        } else {
          this.hasToken = false
          this.$q.notify({
            type: 'negative',
            message: res.error
          })
        }
      } catch (e) {
        console.log('login_error', e)
        // this.$q.notify({
        //   type: 'negative',
        //   message: 'login_error'
        // })
      }
      this.isLoading = false
    },
    async switchTenant(tenant: any) {
      let res: any = await this.$api.identity.account.getSwitchTenantHash(tenant.id, tenant.branchId)
      if (res.data.success) {
        window.open(`${tenant.baseUrls && (tenant.baseUrls.Login || (tenant.baseUrls.Panel + '/login'))}?hashToken=${res.data.result}`, "_self")
      }
    },
    onInputUserName(evt: string) {
      let num: string = evt.toEnglishNumber()
      if (process.env.FLOW_STANDALONE || num.isNumberString())
        this.username = num
    }
  },

  async mounted() {
    const hashToken = this.$route.query.hashToken;
    if (hashToken && hashToken.length > 0) {
      this.isLoading = true
      try {
        const res = await this.$store.dispatch('loginByHash', hashToken)
        if (res.success) {
          await this.$router.replace('/')
          let menus: IMenu[] = []
        } else {
          this.$q.notify({
            type: 'negative',
            message: res.error
          })
        }
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'login_error'
        })
      }
      this.isLoading = false
    }
  },
  meta() {
    return {title: "Login"}
  },
  components: {},
  setup() {
    return {}
  },
})


</script>

<style ang="scss">
.my-content {
  height: 120px;
  width: 120px;

  padding: 10px 10px;
  background: white;
  border: 1px solid rgba(86, 61, 124, 0.2);
}

.my {
  height: 150px;
  width: 150px;

  padding: 10px 15px;
  background: white;
  border: 1px solid rgba(86, 61, 124, 0.2);
}

body {
  background: rgb(231, 231, 231);

}

.page {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
}

.tenantItem:hover {
  color: red !important;
}

.login-card {
  width: 300px;
  border-radius: 20px;
  outline: 5px solid #fff;
  outline-offset: 0px;

  box-shadow: 6.1px 6.1px 10.1px -14px rgba(0, 0, 0, 0.006),
  6.1px 6.1px 12.8px -14px rgba(0, 0, 0, 0.037),
  10.2px 10.2px 11.4px -14px rgba(0, 0, 0, 0.087),
  17px 17px 33px -14px rgba(0, 0, 0, 0.19) !important;
}
</style>

