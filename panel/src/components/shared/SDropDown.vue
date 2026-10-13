<template>
  <q-select outlined
            clearable
            :model-value="value"
            @update:model-value="$emit('input', $event)"
            v-bind="$attrs"
            v-on="$listeners"
            :options="options"
  >
    <template v-slot:option="scope">
      <slot name="option" :opt="scope.opt" :index="scope.index" :itemProps="scope.itemProps" :itemEvents="scope.itemEvents">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label>{{scope.opt.label}}</q-item-label>
            <template v-if="scope.opt.details">
              <q-item-label v-if="getCaption" caption>{{getCaption(scope.opt)}}</q-item-label>
              <q-item-label v-else caption class="q-gutter-xs">
                <q-badge v-for="item in scope.opt.details" color="grey-7" :key="item">
                  {{item}}
                </q-badge>
              </q-item-label>
            </template>
          </q-item-section>
        </q-item>
      </slot>
    </template>
  </q-select>
</template>

<script>
  export default {
    name: 'SDropDown',
    props: {
      getLabel: Function,
      getValue: Function,
      getCaption: Function,
      fetcher: Function,
      value: Object
    },
    data: () => ({
      options: []
    }),
    methods: {},
    async mounted() {
      const res = await this.fetcher()
      if (res.data && res.data.isSuccess && res.data.model)
        this.options = res.data.model.map(x => ({
          ...x,
          details: x.details && JSON.parse(x.details)[0],
          label: this.getLabel && this.getLabel(x) || x.title,
          value: this.getValue && this.getValue(x) || x.id,
        }))
    }
  }
</script>

<style scoped>

</style>

