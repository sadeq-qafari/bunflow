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
        <div><strong>{{ title }}</strong></div>
        <div><sub>{{ description }}</sub></div>
      </q-card-section>

      <q-separator color="grey-4"/>

      <q-card-section class="row q-col-gutter-sm items-center">
        <slot>
          <s-filter-input v-for="(item,index) in components" :property="item.property" :model="item.model" :event="item.events" :key="index"/>
        </slot>
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
import SFilterInput from "./SFilterInput";

export default {
  name: 'SFilterDialog',
  components: {
    SFilterInput,
  },
  props: {
    title: String,
    description: String,
    size: {
      type: String,
      default: 'sm'
    },
    components: {
      type: Array,
      required: false,
      default: () => []
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
    resolve: null
  }),
  methods: {
    open() {
      return new Promise((resolve, reject) => {
        this.showDialog = true
        this.resolve = resolve
      })
    },

    submit() {
      this.resolve(true)
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

