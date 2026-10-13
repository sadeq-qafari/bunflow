<template>
  <q-page class="flow-page dashboard-page" dir="rtl">
    <div class="flow-page-heading">
      <div>
        <div class="flow-eyebrow">فضای کاری شما</div>
        <h1 class="flow-page-title">داده‌های شما</h1>
        <div class="flow-page-subtitle">
          فرم‌ها و اطلاعات فضای کاری را از اینجا مدیریت کنید.
        </div>
      </div>
      <q-btn
        unelevated
        icon="add"
        label="ساخت فرم"
        class="flow-action-primary"
        to="/service/flow/form/info"
      />
    </div>
    <flow-search class="dashboard-search" />
    <section class="form-library">
      <div class="library-heading">
        <div class="row items-center q-gutter-sm">
          <h2 class="flow-surface-title">فرم‌های داده</h2>
          <q-badge color="grey-2" text-color="grey-7">{{
            faNumber(forms.length)
          }}</q-badge>
        </div>
        <q-input
          v-if="forms.length"
          v-model="formFilter"
          dense
          outlined
          clearable
          placeholder="پیدا کردن فرم"
          class="library-filter"
          ><template #prepend><q-icon name="filter_list" /></template
        ></q-input>
      </div>
      <div v-if="filteredForms.length" class="form-card-grid">
        <article
          v-for="form in filteredForms"
          :key="form.id || form.name"
          class="flow-surface form-card"
        >
          <div class="form-card-top">
            <q-avatar rounded class="form-icon"
              ><q-icon name="table_chart" /></q-avatar
            ><q-badge color="grey-2" text-color="grey-7"
              >{{ faNumber(form.properties?.length || 0) }} فیلد</q-badge
            >
          </div>
          <router-link :to="`/flow/${form.name}`" class="form-card-link"
            ><h3>{{ form.title }}</h3></router-link
          >
          <p>
            {{
              form.description ||
              "برای مشاهده و مدیریت رکوردها، این فرم را باز کنید."
            }}
          </p>
          <div class="form-card-actions">
            <q-btn
              flat
              color="primary"
              label="مشاهده رکوردها"
              icon-right="arrow_back"
              :to="`/flow/${form.name}`"
            />
            <q-btn
              flat
              round
              dense
              icon="tune"
              :to="{ path: '/service/flow/form/info', query: { id: form.id } }"
              :aria-label="`ویرایش فرم ${form.title}`"
              ><q-tooltip>ویرایش فرم</q-tooltip></q-btn
            >
          </div>
        </article>
      </div>
      <div v-else class="flow-surface flow-empty">
        <q-icon name="dynamic_form" size="36px" />
        <strong>{{
          forms.length ? "فرمی با این نام پیدا نشد" : "اولین فرم خود را بسازید"
        }}</strong>
        <span>{{
          forms.length
            ? "عبارت جستجو را تغییر دهید."
            : "فیلدهای موردنیاز را تعریف کنید و ثبت اطلاعات را شروع کنید."
        }}</span>
        <q-btn
          v-if="!forms.length"
          flat
          color="primary"
          label="ساخت اولین فرم"
          to="/service/flow/form/info"
        />
      </div>
    </section>
  </q-page>
</template>
<script>
import FlowSearch from "./FlowSearch";
export default {
  name: "FlowDashboard",
  components: { FlowSearch },
  data: () => ({ formFilter: "" }),
  computed: {
    forms() {
      return this.$store.getters.getForms() || [];
    },
    filteredForms() {
      const filter = this.formFilter?.trim().toLocaleLowerCase();
      return filter
        ? this.forms.filter((form) =>
            `${form.title} ${form.name} ${form.description || ""}`
              .toLocaleLowerCase()
              .includes(filter),
          )
        : this.forms;
    },
  },
  methods: {
    faNumber(value) {
      return Number(value).toLocaleString("fa-IR");
    },
  },
};
</script>
<style scoped>
.dashboard-page {
  text-align: start;
}
.dashboard-search {
  margin-bottom: 28px;
}
.library-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.library-filter {
  width: 240px;
  background: white;
}
.form-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.form-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.form-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.form-icon {
  background: #eeedff;
  color: #4f46e5;
  width: 42px;
  height: 42px;
}
.form-card-link {
  text-decoration: none;
  color: #293449;
}
.form-card h3 {
  font-size: 16px;
  font-weight: 650;
  margin: 18px 0 7px;
}
.form-card p {
  color: #778197;
  font-size: 12px;
  min-height: 42px;
  margin: 0 0 18px;
  overflow-wrap: anywhere;
}
.form-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #edf0f5;
  padding-top: 10px;
  margin-top: auto;
}
.form-card-actions .q-btn:first-child {
  margin-inline-start: -10px;
}
@media (max-width: 600px) {
  .library-heading {
    align-items: stretch;
    flex-direction: column;
  }
  .library-filter {
    width: 100%;
  }
  .form-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
