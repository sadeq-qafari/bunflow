<template>
  <div class="full-width full-height">

    <!-- search field -->
    <div class="full-width q-pa-xs bg-grey-4" style="position: sticky; top: 0; z-index: 10">
      <div style="border-radius: 10px" class="overflow-hidden bg-white">
        <q-input ref="searchField" dense borderless bg-color="transparent" label="جستجو" :model-value="searchValue"
                 @update:model-value="onSearchInput($event)" debounce="200">
          <template v-slot:prepend>
            <q-icon class="q-pl-xs" name="search"/>
          </template>
        </q-input>
      </div>
    </div>

    <!-- menus -->
    <menu-item v-if="searchValue.length === 0 && isVisible(item)" ref="menuItem" v-for="(item,i) of menu" :key="i"
               :active="checkActive(item)" :data="item"
               :isLastItem="menu.length - 1 === i"/>

    <!-- search results -->
    <div v-else class="column">
      <router-link v-for="result of searchResults" class="column full-width result-item" style="text-decoration: none"
                   tag="a"
                   :to="`/service/${result.link}`">

        <!-- content -->
        <div class="row full-width q-pa-sm" @click="searchValue = ''">

          <!-- icon -->
          <div class="col-auto">
            <q-icon size="sm" :name="result.icon" :style="{color: `#${result.colorHex}`}"/>
          </div>

          <!-- title, parents -->
          <div class="column col q-pl-md">

            <!-- title -->
            <div class="q-mb-sm text-subtitle2 text-black">
              {{ result.title }}
            </div>

            <!-- parents -->
            <div class="full-width">
              <div class="row reverse q-gutter-x-sm justify-end items-center">
                <div v-for="(parent, index) of result.parentChain" class="text-caption text-black">
                  {{ parent + (index === 0 ? '' : ' >') }}
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- separator -->
        <q-separator/>

      </router-link>
    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {IMenu} from "boot/api";
import MenuItem from "components/layout/MenuItem.vue";

export default defineComponent({
  name: "Menu",
  components: {MenuItem},
  data: () => ({
    searchValue: '',
    searchResults: []
  }),
  computed: {
    menu(): any {
      return this.filter(this.menuList)
    },
    menuList(): any {
      return this.$store.state.menus
    }
  },
  methods: {
    isVisible(menu: any) {
      let hasChildren = menu?.children?.length > 0
      let hasLink = (menu?.link != null && menu?.link?.trim().length > 0)
      return hasChildren || hasLink
    },
    filter(items: Array<IMenu>): Array<IMenu> {
      return items.filter(x => x.title.includes(this.searchValue) || this.filter(x.children).length > 0)
    },
    checkActive(item: any) {
      if (item.link && item.link.length > 0) {
        let currentPath = this.$route.path.split('/').slice(2, 20).join('/')
        return currentPath.toLowerCase() === item.link.toLowerCase()
      } else return false
    },
    onSearchInput(e: any) {
      this.searchResults = []
      this.searchValue = e
      if (e.length > 0)
        this.getSearchResults(this.menu, e.toLowerCase())
    },
    getSearchResults(menu: any, val: any) {
      for (let item of menu) {
        if (item.children && item.children.length > 0) {
          this.getSearchResults(item.children, val)
        } else {
          console.log('searching', val)
          if (item.title.includes(val)) {
            // @ts-ignore
            this.searchResults.push(Object.assign({}, item, {parentChain: this.getParentChain(item, [])}) as any)
          }
        }
      }
    },
    getParentChain(item: any, chain: any): any {
      if (item.parentId > 0) {
        chain.push(item.parent.title)
        return this.getParentChain(item.parent, chain)
      } else {
        return chain
      }
    },
    focusOnSearch() {
      setTimeout(() => {
        (this.$refs.searchField as any).focus()
      }, 200)
    }
  },
  mounted() {
    setTimeout(() => {
      (this.$refs.searchField as any).focus()
    }, 200)
  }
});
</script>

<style scoped>
.result-item {
  transition: 0.1s;
}

.result-item:hover {
  transition: 0.1s;
  backdrop-filter: brightness(0.95);
}
</style>

