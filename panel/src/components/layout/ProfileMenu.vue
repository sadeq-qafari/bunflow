<template>
  <div class="row justify-center items-center">
    <q-btn class="col-auto"
           dense
           flat
           round
           icon="more_time"
           v-permission="'Attendance'"
           to="/service/Attendance/RegisterPresence"
    />
    <q-btn class="col-auto"
           dense
           flat
           round
           icon="apps"
           v-if="tenants && tenants.length>1"
    >
      <q-menu anchor="bottom left" self="top left" content-class="shadow-0" square :offset="[0,10]"
              :content-style="profileMenuStyle">
        <div class="row" style="width: 200px">
          <div v-for="tenant of tenants" class="col-6 row">
            <q-btn flat class="col" @click="switchTenant(tenant)">
              <div class="column justify-center items-center q-my-md q-mx-none">
                <q-avatar size="42px" class="row">
                  <img :src="tenant.logo">
                </q-avatar>
                <div class="row text-weight-regular">
                  {{ tenant.title }}
                </div>
              </div>

            </q-btn>
          </div>
        </div>
      </q-menu>
    </q-btn>
    <!--    <notification class="q-mx-sm col-auto"/>-->
    <q-card class="profile-menu-card cursor-pointer bg-transparent" flat clickable v-if="userInfo">
      <q-item>
        <q-item-section class="xs-hide">
          <q-item-label class="text-black">{{ userInfo.given_name }} {{ userInfo.family_name }}</q-item-label>
          <q-item-label caption>{{ userInfo.username }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-avatar>
            <img :src="userInfo.profileImage">
          </q-avatar>
        </q-item-section>
      </q-item>
      <q-menu fit anchor="bottom left" self="top left" content-class="shadow-0"
              :content-style="profileMenuStyle">
        <!-- settings -->
        <q-item clickable v-ripple @click="$refs.settingsDialog.show()">
          <!-- label -->
          <q-item-section>
            <span>تنظیمات</span>
          </q-item-section>
          <!-- icon -->
          <q-item-section avatar>
            <q-icon name="settings" color="primary"/>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="showChangePasswordDialog">
          <q-item-section>
            <span>{{ $t('profileMenu.changePassword') }}</span>
          </q-item-section>
          <q-item-section avatar>
            <q-icon name="o_vpn_key" color="orange"/>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section @click="logout">
            <span>{{ $t('profileMenu.logout') }}</span>
          </q-item-section>
          <q-item-section avatar>
            <q-icon name="o_exit_to_app" color="red"/>
          </q-item-section>
        </q-item>
      </q-menu>
    </q-card>

    <s-change-password-dialog ref="changePasswordDialog"/>

    <q-dialog ref="settingsDialog">
      <div class="column full-width bg-white" style="width: 300px">

        <!-- header -->
        <div class="row full-width q-pa-sm justify-between items-center">

          <!-- title -->
          <div class="text-subtitle1 text-black">
            تنظیمات
          </div>

          <!-- close -->
          <q-btn icon="close" flat round dense @click="$refs.settingsDialog.hide()"/>

        </div>

        <q-separator/>

        <!-- body -->
        <div class="full-width q-pa-md">
          <div class="column q-gutter-y-md">

            <!-- menu -->
            <div class="row full-width justify-between items-center">

              <!-- label -->
              <div class="text-subtitle2 text-weight-regular">
                منوی کلاسیک
              </div>

              <!-- toggle -->
              <q-toggle :model-value="classicMenu" dense @update:model-value="switchMenu()"/>

            </div>

          </div>
        </div>

      </div>
    </q-dialog>
  </div>
</template>

<script>
import SChangePasswordDialog from "../shared/SChangePasswordDialog";
import Notification from "./Notification";

export default {
  name: 'ProfileMenu',
  components: {Notification, SChangePasswordDialog},
  data: () => ({
    baseUrl: process.env.API_URL,
    classicMenu: false,
    profileMenuStyle: {
      borderRadius: "0px 0px 5px 5px",
      borderBottom: "solid 1px #e1e1e1",
      borderLeft: "solid 1px #e1e1e1",
      borderRight: "solid 1px #e1e1e1"
    }
  }),
  computed: {
    tenants() {
      return this.$store.state.tenants && this.$store.state.tenants.filter(x => x.baseUrls?.Panel != location.origin).map(x => Object.assign({}, x, x.logo?.fileName != null ? {logo: `${this.baseUrl}/cdn/download/${x.logo.fileName}`} : {logo: 'icons/tenant-logo.png'}))
    },
    userInfo() {
      return Object.assign({}, this.$store.state.user || {}, {profileImage: '/img/account-default-image.png'})
    }
  },
  methods: {
    async switchTenant(tenant) {
      let res = await this.$api.identity.account.getSwitchTenantHash(tenant.id, tenant.branchId)
      if (res.data.success) {
        window.open(`${tenant.baseUrls && (tenant.baseUrls.Login || (tenant.baseUrls.Panel + '/login'))}?hashToken=${res.data.result}`, "_self")
      }
    },
    async logout() {
      if (await this.$store.dispatch('logout')) {
        await this.$router.replace('/login')
      }
    },
    showChangePasswordDialog() {
      return this.$refs.changePasswordDialog.open()
    },
    switchMenu() {
      this.classicMenu = !this.classicMenu
      this.$emit('switch-menu')
    }
  },
  mounted() {
    if (this.$q.localStorage.has('classicMenu')) {
      this.classicMenu = this.$q.localStorage.getItem('classicMenu')
    }
  }
}
</script>

<style scoped lang="scss">
.profile-menu-card:hover {
  //background-color: $primary;
}
</style>

