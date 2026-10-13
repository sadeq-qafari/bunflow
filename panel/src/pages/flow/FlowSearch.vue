<template>
  <q-card class="col q-ml-sm" flat>
    <q-card-section class="search-header">
      <q-input borderless v-model="searchValue"
               :class="['search-input bg-grey-1 q-pr-sm']"
               input-class="q-px-md"
               placeholder="جستجو" clearable
               dense debounce="500" @update:model-value="search">
        <template v-slot:append>
          <q-icon name="search"/>
        </template>
      </q-input>
    </q-card-section>
    <q-separator/>
    <q-card-section class="row q-pa-none" v-if="hasResult" style="height: 40vmin">
      <div v-for="(data,formName) in result" class="col-12" separator>
        <f-simple-data-grid :searchValue="searchValue" class="col" :form-name="formName" :data="data"/>
      </div>
    </q-card-section>
    <q-card-section class="row q-pa-none items-center justify-center" v-else>
      <h1 v-if="searchValue && searchValue.trim().length>0">موردی یافت نشد</h1>
      <h1 v-else>کلیدواژه موردنظر را در کادر بالا جستجو کنید</h1>
    </q-card-section>
  </q-card>
</template>

<script>
import FSimpleDataGrid from "../../components/flow/FSimpleDataGrid";

export default {
  name: "FlowSearch",
  components: {FSimpleDataGrid},
  data: () => ({
    searchValue: '',
    result: {}
  }),
  computed: {
    hasResult() {
      return Object.keys(this.result).length > 0
    }
  },
  methods: {
    async search() {
      this.result = {}
      if (this.searchValue && this.searchValue.trim().length > 0) {
        const res = await this.$axios.get(`${process.env.API_URL}/flow/form/search?searchValue=${this.searchValue}`)
        this.result = res.data.result
      }
    }
  }
}
</script>

<style>
.search-header {
  position: sticky;
  top: 0;
  z-index: 2;
  box-shadow: 0 0 5px #e1e1e1;
  background-color: white;
}
</style>

