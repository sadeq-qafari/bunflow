<template>
  <q-page class="q-pa-md flex q-gutter-xs items-start justify-around">
    <dashboard></dashboard>
  </q-page>
</template>

<script lang="ts">
import {defineComponent, ref} from '@vue/composition-api'
import Dashboard from "pages/Dashboard.vue";

export default defineComponent({
  name: 'PageIndex',
  components: {Dashboard},
  data: () => ({
    number: 10 as Number
  }),
  computed: {},
  mounted() {
  },
  methods: {

  }
})
</script>

