
<template>

  <div class="col-2 q-pa-sm" style="  max-height: 400px; overflow: scroll">
    <q-list bordered separator v-if="items && items.length>0"   class="border-radius" dense>
      <q-item
        clickable
        v-ripple
        v-for="(item, index) of items"
        :key="index"
        :active="item.id == categoryId"
        @click="selectCategory(item)"
      >
        <q-item-section>{{ item.title }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
export default {
  name: "CategoryList",

  props: {
    items: Array,
    categoryId: Number | null,
  },
  methods: {
    selectCategory(item) {
      this.$emit("onSelected", {itemId:  item.id ,hasNoChildren: this.getChildrenFlag(item)});
    },

    getChildrenFlag(item){
      return item.children == null;
    }
  },
};
</script>

