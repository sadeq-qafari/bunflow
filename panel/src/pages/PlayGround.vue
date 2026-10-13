<template>
  <q-page class="q-pa-md">
<f-multi-dropdown :lookup="lookup" v-model="text" label="شهر" dense outlined/>
   t: {{ text }}
  </q-page>
</template>

<script>

import FMultiDropdown from "../components/flow/FMultiDropdown";
export default {
  name: 'PlayGround',
  components: {FMultiDropdown},
  data: () => ({
    text: null,
    options: [{
      label: 'این',
      value: 1
    }, {
      label: 'اون',
      value: 2
    }, {
      label: 'آن',
      value: 3
    }],
    filterOptions: [],
    lookup:{
      "id": 2,
      "title": "مرتبه علمی",
      "typeLookup": 1,
      "query": null,
      "webServiceId": null,
      "description": "مراتب علمی اساتید",
      "options": [
        {
          "lookupId": 2,
          "title": "استاد تمام",
          "value": "1",
          "description": "",
          "index": 1,
          "icon": null,
          "colorHex": null,
          "isActive": true
        },
        {
          "lookupId": 2,
          "title": "استاد",
          "value": "2",
          "description": null,
          "index": 2,
          "icon": null,
          "colorHex": null,
          "isActive": true
        },
        {
          "lookupId": 2,
          "title": "دانشیار",
          "value": "3",
          "description": null,
          "index": 3,
          "icon": null,
          "colorHex": null,
          "isActive": true
        },
        {
          "lookupId": 2,
          "title": "استادیار",
          "value": "4",
          "description": null,
          "index": 4,
          "icon": null,
          "colorHex": null,
          "isActive": true
        },
        {
          "lookupId": 2,
          "title": "آموزشیار",
          "value": "5",
          "description": null,
          "index": 5,
          "icon": null,
          "colorHex": null,
          "isActive": true
        }
      ]
    }
  }),
  computed: {
  },
  mounted() {
  },
  beforeUnmount() {
  },
  methods: {
    filterFn(val, update) {
      update(() => {
        if (val === '') {
          this.filterOptions = this.options
        } else {
          const needle = val.toLowerCase()
          this.filterOptions = this.options.filter(
            v => v.label.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    }
  }
}
</script>

<style scoped>

</style>

