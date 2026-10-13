<template>
  <q-layout view="hHh Lpr fFf" class="bg-blue-grey-1">
    <q-header class="bg-transparent print-hide" bordered>
      <div class="header text-grey-14 full-height">
        <q-toolbar class="row">
          <!--          <q-btn dense flat round icon="menu" @click="left = !left"/>-->
          <q-toolbar-title class="row items-center col-auto">
            <q-avatar square>
              <q-img :src="logo" contain style="max-height: 38px"/>
            </q-avatar>

            {{ tenantInfo && tenantInfo.title }}

          </q-toolbar-title>
          <q-separator class="q-mx-sm" vertical inset/>
          <flow-menu class="col"></flow-menu>
          <q-separator class="q-mx-sm" vertical inset/>

          <q-space/>
          <profile-menu class="col-auto" @switch-menu="switchMenu()"/>
        </q-toolbar>
      </div>

    </q-header>

    <q-drawer v-model="left" side="left" behavior="mobile">
      <!--      <sidebar-menu v-if="classicSidebar" ref="sidebar"/>-->
      <!--      <expanding-sidebar-menu v-else ref="sidebar"/>-->
    </q-drawer>

    <!--    <q-drawer v-model="right" side="right" behavior="mobile">-->
    <!--      <sidebar-menu/>-->
    <!--    </q-drawer>-->

    <!--    <q-drawer v-model="right" side="right" behavior="mobile">-->
    <!--      <user-menu/>-->
    <!--    </q-drawer>-->

    <q-page-container>


      <router-view/>
    </q-page-container>

    <q-footer bordered class="bg-white text-black layout-footer print-hide">
      <q-toolbar>
        <div class="full-width q-pb-sm flex justify-around content-center row">
          <div class="row">
            <router-link tag="p" style="cursor: help" to="/service/changeLog"
            >نسخه: {{ version }}
              <q-tooltip>
                <div class="text-center">تاریخ بروزرسانی: {{ updateDate }}</div>
                <div class="text-center">برای مشاهده تغییرات کلیک کنید</div>
              </q-tooltip>
            </router-link>
            <small
              id="needsUpdate"
              v-if="needsUpdate"
              class="q-mx-md q-px-sm rounded-borders text-blue text-bold cursor-pointer"
              @click="reload"
            >
              <a>
                <span>نسخه جدید</span>
                &nbsp;
                <span>(جهت بروزرسانی کلیک کنید)</span>

              </a>
            </small>
          </div>
          <p>{{ jalaliDate }}</p>
          <p class="en-text">{{ date }}</p>
        </div>
      </q-toolbar>
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
        this.$refs.sidebar.focusOnSearch()
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
.header {
  background-color: $headerColor;
}

.layout-footer {
  height: 25px;
}

.my-content2 {
  padding: 10px 15px;
}

.red-alert {
  background-color: red;
  color: white !important;
}
</style>

