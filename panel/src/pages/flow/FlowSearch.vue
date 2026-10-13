<template>
  <section class="flow-surface flow-search">
    <div class="flow-surface-heading flow-search-heading">
      <div>
        <h2 class="flow-surface-title">جستجو در داده‌ها</h2>
        <div class="flow-panel-caption">نتایج را در تمام فرم‌ها پیدا کنید.</div>
      </div>
      <q-icon name="manage_search" size="22px" class="flow-search-mark" />
    </div>
    <div class="flow-search-input-wrap">
      <q-input
        v-model="searchValue"
        outlined
        dense
        clearable
        debounce="450"
        :loading="isSearching"
        placeholder="نام، مقدار یا عبارت موردنظر را بنویسید"
        @update:model-value="search"
        @clear="clearResults"
      >
        <template #prepend><q-icon name="search" color="grey-6" /></template>
      </q-input>
      <div class="flow-search-hint">جستجو در همه فرم‌ها</div>
    </div>
    <div v-if="hasResult" class="flow-search-results">
      <div
        v-for="(data, formName) in result"
        :key="formName"
        class="flow-search-result"
      >
        <f-simple-data-grid
          :search-value="searchValue"
          :form-name="formName"
          :data="data"
        />
      </div>
    </div>
    <div
      v-else-if="searchedValue && !isSearching"
      class="flow-empty flow-search-empty"
    >
      <q-icon name="search_off" size="30px" />
      <div class="flow-empty-title">نتیجه‌ای پیدا نشد</div>
      <div>عبارت دیگری را امتحان کنید.</div>
    </div>
  </section>
</template>

<script>
import FSimpleDataGrid from "../../components/flow/FSimpleDataGrid";

export default {
  name: "FlowSearch",
  components: { FSimpleDataGrid },
  data: () => ({
    searchValue: "",
    result: {},
    isSearching: false,
    requestId: 0,
    searchedValue: "",
  }),
  computed: {
    hasResult() {
      return Object.keys(this.result).length > 0;
    },
  },
  methods: {
    clearResults() {
      this.requestId++;
      this.result = {};
      this.isSearching = false;
      this.searchedValue = "";
    },
    async search() {
      const requestId = ++this.requestId;
      this.result = {};
      const query = this.searchValue?.trim();
      this.searchedValue = "";
      this.isSearching = !!query;
      if (!query) return;
      try {
        const res = await this.$axios.get(
          `${process.env.API_URL}/flow/form/search`,
          { params: { searchvalue: query } },
        );
        if (requestId === this.requestId) {
          this.result = res.data.result || {};
          this.searchedValue = query;
        }
      } finally {
        if (requestId === this.requestId) this.isSearching = false;
      }
    },
  },
};
</script>

<style scoped>
.flow-search {
  overflow: hidden;
}
.flow-search-heading {
  border-bottom: 0;
  padding-bottom: 0;
}
.flow-panel-caption {
  margin-top: 3px;
  color: #8993a5;
  font-size: 11px;
}
.flow-search-mark {
  color: #5148d9;
  background: #f0efff;
  box-sizing: content-box;
  padding: 8px;
  border-radius: 10px;
}
.flow-search-input-wrap {
  padding: 14px 20px 18px;
}
.flow-search-hint {
  color: #9aa3b2;
  font-size: 11px;
  padding: 7px 2px 0;
}
.flow-search-results {
  border-top: 1px solid #edf0f5;
}
.flow-search-result + .flow-search-result {
  border-top: 1px solid #edf0f5;
}
.flow-search-empty {
  min-height: 110px;
  border-top: 1px solid #edf0f5;
  font-size: 12px;
}
.flow-empty-title {
  color: #39445a;
  font-size: 14px;
  font-weight: 600;
}
</style>
