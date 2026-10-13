<template>
  <q-menu v-bind="$attrs" square fit>
    <q-list dense style="min-width: 100px">
      <q-item v-for="menu of menus" v-close-popup="!!menu.link" :to="!!menu.link?menu.link:undefined" :active="$route.path==menu.link" active-class="text-white bg-primary">
        <q-item-section>{{ menu && menu.title }}</q-item-section>
        <q-item-section side v-if="!menu.link">
          <q-icon name="keyboard_arrow_left"/>
        </q-item-section>
        <flow-sub-menu :menus="menu.children" v-if="menu.children && menu.children.length>0" auto-close anchor="top end" self="top start"/>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
export default {
  name: "FlowSubMenu",
  props: {
    menus: Array
  },

}
</script>

<style>
.q-menu {
  box-shadow: 0px 3px 3px #e1e1e1 !important;
  /*border-radius: 0 0 4px 4px;*/
}
</style>

