<template>
  <q-layout view="hHh Lpr fFf" class="flow-layout" :class="{'flow-layout--designer': isDesigner}">
    <q-header class="flow-header print-hide" bordered>
      <q-toolbar class="flow-toolbar">
        <q-btn v-if="!isDesigner" class="mobile-menu flow-icon-button" flat round dense icon="menu" aria-label="باز کردن منو" @click="left = !left"/>
        <router-link to="/flow" class="flow-brand">
          <q-avatar size="34px" class="flow-brand-mark">
            <q-img v-if="logo" :src="logo" contain/>
            <q-icon v-else name="data_object" size="21px"/>
          </q-avatar>
          <span class="flow-brand-name">{{ tenantInfo && tenantInfo.title || 'Flow' }}</span>
        </router-link>
        <div class="flow-toolbar-menu"><flow-menu/></div>
        <q-space/>
        <small class="flow-version" @click="$router.push('/service/changeLog')">نسخه {{ version }}</small>
        <profile-menu class="col-auto" @switch-menu="switchMenu()"/>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="!isDesigner" v-model="left" side="left" bordered :width="272" :breakpoint="850" class="flow-sidebar">
      <div class="flow-sidebar-inner">
        <div class="flow-nav-label">فضای کاری</div>
        <q-item clickable to="/flow" exact active-class="flow-nav-active" class="flow-nav-item">
          <q-item-section avatar><q-icon name="space_dashboard"/></q-item-section>
          <q-item-section>نمای کلی</q-item-section>
        </q-item>
        <q-item clickable to="/service/flow/form/info" active-class="flow-nav-active" class="flow-nav-item">
          <q-item-section avatar><q-icon name="add_box"/></q-item-section>
          <q-item-section>ساخت فرم</q-item-section>
        </q-item>
        <div class="flow-nav-label flow-nav-label-spaced">
          <span>فرم‌های داده</span><span class="flow-count">{{ formItems.length }}</span>
        </div>
        <q-scroll-area class="flow-form-nav">
          <q-item v-for="form in formItems" :key="form.id || form.name" clickable
                  :to="`/flow/${form.name}`" active-class="flow-nav-active" class="flow-nav-item flow-form-item">
            <q-item-section avatar><q-icon name="table_chart"/></q-item-section>
            <q-item-section>
              <q-item-label>{{ form.title }}</q-item-label>
              <q-item-label caption>{{ form.name }}</q-item-label>
            </q-item-section>
          </q-item>
          <div v-if="!formItems.length" class="flow-sidebar-empty">هنوز فرمی نساخته‌اید</div>
        </q-scroll-area>
        <div class="flow-sidebar-bottom">
          <div class="flow-sidebar-dot"></div>
          <span>ذخیره‌سازی محلی فعال است</span>
        </div>
      </div>
    </q-drawer>

    <q-page-container><router-view/></q-page-container>

    <q-footer v-if="needsUpdate" bordered class="flow-update-footer print-hide">
      <div id="needsUpdate" class="cursor-pointer" @click="reload">نسخه جدید آماده است · برای بروزرسانی کلیک کنید</div>
    </q-footer>
  </q-layout>
</template>

<script>
import SidebarMenu from "components/layout/SidebarMenu";
import ProfileMenu from "components/layout/ProfileMenu";
import Notification from "components/layout/Notification";
import * as moment from "jalali-moment";
import appPackage from "../../package.json";
import Chat from "../components/layout/Chat";
import TenantMenu from "../components/layout/TenantMenu";
import ExpandingSidebarMenu from "../components/layout/ExpandingSidebarMenu";
import FlowMenu from "../components/flow/menu/FlowMenu";


export default {
  components: {FlowMenu, ExpandingSidebarMenu, TenantMenu, Chat, Notification, ProfileMenu, SidebarMenu},
  data() {
    return {
      classicSidebar: false,
      left: false,
      right: false,
      jalaliDate: moment()
        .locale("fa")
        .format(`${this.getDay(moment().day())} - jYYYY/jMM/jDD`),
      date: moment().locale("en").format(" dddd - YYYY/MM/DD"),
      version: appPackage.version,
      incompleteInfo: [],
      needsUpdate: false,
      needsUpdateInterVal: null
    }
  },
  meta() {
    return this.meta;
  },
  computed: {
    isDesigner() { return this.$route.path === "/service/flow/form/info" },
    formItems() {
      return this.$store.getters.getForms() || []
    },
    isMobile() {
      return this.$q.screen.lt.md;
    },

    updateDate() {
      let services = localStorage.getItem("services");
      if (services && services.length > 0) {
        let item = JSON.parse(services);
        let version = item.version;
        if (version > 0) {
          return moment.unix(version).format("HH:mm:ss jYYYY/jMM/jDD");
        }
      }
    },
    tenantInfo() {
      return this.$store.getters.getTenantInfo();
    },
    logo() {
      if (this.tenantInfo && this.tenantInfo.logo && this.tenantInfo.logo.fileName) {
        let fileName = `${process.env.API_URL}/cdn/download/${this.tenantInfo.logo.fileName}`;
        document.getElementById("index-favicon").setAttribute("href", fileName);
        document.getElementById("index-favicon16").setAttribute("href", fileName);
        document.getElementById("index-favicon32").setAttribute("href", fileName);
        document.getElementById("index-favicon96").setAttribute("href", fileName);
        document.getElementById("index-favicon128").setAttribute("href", fileName);
        return fileName;
      } else return "";
    },
    meta() {
      return {title: this.tenantInfo && this.tenantInfo.title};
    },
  },
  watch: {
    '$q.screen.width'(width, previousWidth) {
      if (width <= 850) this.left = false
      else if (previousWidth <= 850) this.left = true
    },
    right(to, from) {
      if (to === false) {
        this.$store.commit("clearChatProps");
      }
    },
    chatProps(to, from) {
      if (to !== null) {
        this.right = true;
      }
    },
  },
  async mounted() {
    this.left = this.$q.screen.width > 850
    if (this.$q.localStorage.has('classicMenu')) {
      this.classicSidebar = this.$q.localStorage.getItem('classicMenu')
    }
    await this.checkVersion();
    window.addEventListener("keyup", this.onKeyUp)
  },
  methods: {
    reload() {
      location.reload();
    },
    async checkVersion() {
      const res = await this.$axios.get(`${process.env.API_URL}/Core/Version/check`, {
        params: {
          appType: 5,
          version: this.version,
        },
        noNotify: true,
      });
      this.needsUpdate = res.data.result;
      if (res.data.result) {
        this.needsUpdateInterVal = setInterval(() => {
          document.getElementById("needsUpdate").classList.toggle('red-alert')
        }, 300)
      }
    },
    switchMenu() {
      if (this.classicSidebar) {
        this.classicSidebar = false
        this.$q.localStorage.set('classicMenu', false)
      } else {
        this.classicSidebar = true
        this.$q.localStorage.set('classicMenu', true)
      }
    },
    getDay(day) {
      switch (day) {
        case 0:
          return "یک شنبه";
        case 1:
          return "دو شنبه";
        case 2:
          return "سه شنبه";
        case 3:
          return "چهارشنبه";
        case 4:
          return "پنج شنبه";
        case 5:
          return "جمعه";
        case 6:
          return "شنبه";
      }
    },
    onKeyUp(e) {
      if (e.ctrlKey === true && e.key === 'q') {
        this.left = !this.left
      }
    }
  },
  beforeUnmount() {
    if (this.needsUpdateInterVal)
      clearInterval(this.needsUpdateInterVal);
  }
};
</script>
<style lang="scss">
.flow-layout { background: #f5f7fb; }
.flow-header { background: #fff; color: #202a3b; border-bottom: 1px solid #e5e9f1; }
.flow-toolbar { min-height: 66px; padding: 0 24px; gap: 16px; }
.flow-brand { display: flex; align-items: center; gap: 10px; color: inherit; text-decoration: none; min-width: 190px; }
.flow-brand-mark { background: #eeedff; color: #4f46e5; border-radius: 11px; }
.flow-brand-name { font-size: 15px; font-weight: 700; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.flow-toolbar-menu { display: flex; align-items: center; min-width: 0; }
.flow-version { color: #8993a5; cursor: pointer; margin-inline-end: 10px; }
.flow-sidebar { color: #354055; }
.flow-sidebar-inner { display: flex; flex-direction: column; height: 100%; padding: 18px 14px 12px; }
.flow-nav-label { display: flex; justify-content: space-between; align-items: center; padding: 12px 12px 7px; color: #929bad; font-size: 11px; font-weight: 700; }
.flow-nav-label-spaced { margin-top: 18px; }
.flow-count { background: #f0f2f7; color: #737f93; border-radius: 20px; min-width: 22px; text-align: center; padding: 1px 6px; }
.flow-nav-item { border-radius: 9px; margin: 2px 0; color: #59657a; font-size: 13px; }
.flow-nav-item .q-icon { color: #929bad; font-size: 19px; }
.flow-nav-active { background: #eeedff !important; color: #4338ca !important; font-weight: 600; }
.flow-nav-active .q-icon { color: #4f46e5; }
.flow-form-nav { flex: 1; min-height: 80px; }
.flow-form-item { min-height: 54px; }
.flow-form-item .q-item__label--caption { color: #9aa3b2; font-size: 10px; }
.flow-sidebar-empty { padding: 14px 12px; font-size: 12px; color: #9aa3b2; }
.flow-sidebar-bottom { display: flex; align-items: center; gap: 8px; padding: 14px 10px 4px; color: #8b95a6; font-size: 11px; border-top: 1px solid #edf0f5; }
.flow-sidebar-dot { width: 7px; height: 7px; border-radius: 50%; background: #20a36a; box-shadow: 0 0 0 3px #e5f6ed; }
.mobile-menu { display: none; }
.flow-update-footer { background: #4338ca; color: #fff; text-align: center; padding: 10px; }
.red-alert { background-color: #d14343; color: white !important; }

@media (max-width: 850px) {
  .flow-toolbar { min-height: 58px; padding: 0 12px; gap: 8px; }
  .mobile-menu { display: inline-flex; }
  .flow-brand { min-width: 0; }
  .flow-toolbar-menu { display: none; }
  .flow-version { display: none; }
}
.flow-layout--designer .q-page-container { padding-left: 0 !important; padding-right: 0 !important; }
</style>

