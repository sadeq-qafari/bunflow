<template>
  <div class="full-height">
    <!--    <div class="block q-pt-xs" style="height: 6vh;">-->
    <!--      <div class="menu-item">-->
    <!--        <q-input class="q-px-sm"-->
    <!--                 v-model="search"-->
    <!--                 dense-->
    <!--                 placeholder="جستجو"-->
    <!--                 @keyup="searchMenu(menu)">-->
    <!--          <template v-slot:append>-->
    <!--            <q-icon name="search"/>-->
    <!--          </template>-->
    <!--        </q-input>-->
    <!--      </div>-->
    <!--    </div>-->
    <q-scroll-area class="full-height" :thumb-style="{ right: '0px' }">
      <div class="block" v-if="parentMenu != null">
        <div @click="go(parentMenu.parent)" class="menu-item">
          <q-btn align="start" class="full-width q-py-xs q-my-xs" flat>
            <q-icon name='subdirectory_arrow_right'/>
            <span class="text-black q-mx-sm">
            {{ $t('menu.Return') }}
            </span>

            <q-menu touch-position context-menu></q-menu>
          </q-btn>
        </div>
      </div>
      <div class="block" v-if="menu && isVisible(item)" v-for="(item,i) in menu" :key="i">
        <div @click="item.link === null ? go(item) : $router.push({path: '/service/'+item.link})" class="menu-item"
             @click.middle="item.link === null ? undefined : newTab(item)">
          <q-btn align="between" class="full-width q-py-xs q-my-xs" flat
                 :class="{active: $route.path === '/service/'+item.link}"
                 :style="{color : ('#'+item.colorHex)}">
            <div>
              <q-icon :name="item.icon || 'layers'"/>
              <span class=" q-mx-sm" :class=" $route.path === '/service/'+item.link ? 'text-white' : 'text-black'">
            {{ item.title }}
            </span>
            </div>
            <small>
              <q-icon name="keyboard_arrow_left" class="text-grey" v-if="!item.link"/>
            </small>

            <q-menu touch-position context-menu>
              <q-list dense style="min-width: 100px" v-if="item.link !== null">
                <q-item clickable v-ripple v-close-popup @click="newTab(item)">
                  <q-item-section avatar>
                    <q-icon name="tab" :style="{color : ('#'+item.colorHex)}"></q-icon>
                  </q-item-section>
                  <q-item-section>باز کردن در تب جدید</q-item-section>
                </q-item>

                <!--                <q-separator/>-->

                <!--                <q-item clickable v-close-popup>-->
                <!--                  <q-item-section avatar>-->
                <!--                    <q-icon name="shortcut" :style="{color : ('#'+item.colorHex)}"></q-icon>-->
                <!--                  </q-item-section>-->
                <!--                  <q-item-section>افزودن به میان بر</q-item-section>-->
                <!--                </q-item>-->
              </q-list>
            </q-menu>

          </q-btn>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import {defineComponent, ref} from '@vue/composition-api'
import SInput from "../shared/SInput";

export default defineComponent({
  name: 'SidebarMenu',
  components: {SInput},
  data: () => ({
    parentMenu: null,
    search: '',
    filteredMenu: []
  }),
  computed: {
    menu() {
      // if (this.search && this.search.trim().length > 0) {
      //   return this.getMenuBySearch()
      // } else {
      return (this.parentMenu == null) ? (this.$store.state.menus ? this.$store.state.menus.filter(x => x.isActive) : []) : this.parentMenu.children.filter(x => x.isActive)
      // }
    },
  },
  mounted() {
    const pathParts = this.$route.path.split('/').filter(x => x != null && x.length > 0)
    let menu = this.$store.state.menus
    for (let i = 1; i < pathParts.length; i++) {
      if (typeof (menu.find) == "function") {
        const subMenu = menu.find(x => x.name === pathParts[i])

        if (subMenu != null) menu = subMenu
        else break;
      } else break;
    }
    if (menu.children)
      this.parentMenu = menu
  },
  methods: {
    isVisible(menu) {
      let hasChildren = menu?.children?.length > 0
      let hasLink = (menu?.link != null && menu?.link?.trim().length > 0)
      return hasChildren || hasLink
    },
    getMenuBySearch() {
      let menu = Object.assign({}, this.$store.state.menus)
      let result = []
    },
    // searchTree(element, matchingTitle) {
    //   if (element.title === matchingTitle) {
    //     return element;
    //   } else if (element.children != null) {
    //     let i;
    //     let result = null;
    //     for (i = 0; result == null && i < element.children.length; i++) {
    //       result = this.searchTree(element.children[i], matchingTitle);
    //     }
    //     return result;
    //   }
    //   return null;
    // },
    go(menu) {
      this.parentMenu = menu
    }
    ,
    newTab(item) {
      window.open('/service/' + item.link, "_blank");
    }
    ,
    searchMenu(menu) {
      console.log('menu : ' + menu[10].title);
      console.log('search : ' + this.search);

      this.$store.state.menus = menu.filter(x => x.title.includes(this.search));
      console.log('filterd menu : ' + menu);
    }
  }
})


</script>

<style scoped lang="scss">
.menu-item {
  text-decoration: none !important;

  span {
    font-weight: 400 !important;
  }
}

.active {
  background-color: $primary;
  color: #fff !important;
  box-shadow: 0 6px 12px 0 rgba(79, 193, 233, .3) !important;
  border-radius: 0 25px 25px 0 !important;
}
</style>

