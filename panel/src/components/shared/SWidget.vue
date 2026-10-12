<template>
  <q-card  class="bg-white q-ma-sm" flat bordered>
    <q-card-actions class="widget">
      <div :class="['widget-bg full-width flex items-start justify-end q-pa-sm',`text-${bgColor}`]">
        <q-icon :name="icon" size="lg" :color="bgColor"/>
      </div>
      <div :class="['widget-desc q-pa-sm text-white',`text-grey-7`]">
        <div class="text-subtitle2">
          {{ title }}:
        </div>
        <div :class="[`text-${bgColor}`]">
          <span class="text-h6">{{ description.split(' ')[1] }}</span>
          <span class="text-h2">{{ description.split(' ')[0] }}</span>
        </div>
      </div>
    </q-card-actions>
    <q-separator :color="'grey'" v-if="link" style="opacity: 0.5" inset=""/>
    <q-card-actions v-if="link" class="bg-white">
      <q-btn class="bg-white full-width q-pa-none" :color="bgColor" icon="o_info" :to="link" flat
             label="اطلاعات بیشتر"></q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  name: "SWidget",
  props: {
    color: String,
    bgColor: String,
    title: String,
    description: String,
    icon: String,
    link: String
  }
}
</script>
<style lang="scss">
.widget {
  height: 80px;

  .widget-bg {
    height: 80px;
  }

  .widget-desc {
    height: 100px;
    position: absolute;
    top: 0;
  }
}
</style>

