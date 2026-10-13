<template>
  <q-page class="flow-page">
    <div class="flow-page-heading">
      <div>
        <div class="flow-eyebrow">فضای کاری شما</div>
        <h1 class="flow-page-title">داده‌های شما</h1>
        <div class="flow-page-subtitle">فرم‌ها را مدیریت کنید، رکوردها را ببینید و در داده‌ها جستجو کنید.</div>
      </div>
      <q-btn unelevated no-caps icon="add" label="ساخت فرم" class="flow-action-primary"
             to="/service/flow/form/info"/>
    </div>

    <div class="flow-dashboard-grid">
      <section class="flow-surface flow-forms-panel">
        <div class="flow-surface-heading">
          <div>
            <h2 class="flow-surface-title">فرم‌های داده</h2>
            <div class="flow-panel-caption">{{ forms.length }} فرم در فضای کاری</div>
          </div>
          <q-btn flat round dense icon="settings" class="flow-icon-button" to="/service/flow/form/info">
            <q-tooltip>مدیریت فرم‌ها</q-tooltip>
          </q-btn>
        </div>
        <q-scroll-area class="form-list" :style="{height: `${Math.min(Math.max(forms.length * 64 + 16, 220), 620)}px`}">
          <q-list v-if="forms.length" class="flow-form-list">
            <q-item v-for="form in forms" :key="form.id || form.name" clickable v-ripple
                    :to="`/flow/${form.name}`" class="flow-form-row">
              <q-item-section avatar>
                <q-avatar rounded class="flow-form-icon"><q-icon name="table_chart"/></q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="flow-form-title">{{ form.title }}</q-item-label>
                <q-item-label caption class="flow-form-description">
                  {{ form.description || `${form.properties?.length || 0} فیلد` }}
                </q-item-label>
              </q-item-section>
              <q-item-section side><q-icon name="chevron_left" color="grey-5"/></q-item-section>
            </q-item>
          </q-list>
          <div v-else class="flow-empty">
            <q-icon name="dynamic_form" size="34px"/>
            <div class="flow-empty-title">هنوز فرمی ندارید</div>
            <div>با ساخت اولین فرم، داده‌های خود را ثبت کنید.</div>
            <q-btn flat no-caps color="primary" label="ساخت اولین فرم" to="/service/flow/form/info"/>
          </div>
        </q-scroll-area>
      </section>

      <flow-search class="flow-search-panel"/>
    </div>
  </q-page>
</template>

<script>
import FlowSearch from "./FlowSearch";

export default {
  name: "FlowDashboard",
  components: {FlowSearch},
  computed: {
    forms() {
      return this.$store.getters.getForms() || []
    }
  }
}
</script>

<style scoped>
.flow-dashboard-grid { display: grid; grid-template-columns: minmax(290px, .78fr) minmax(420px, 1.5fr); gap: 18px; align-items: start; }
.flow-forms-panel { overflow: hidden; }
.flow-panel-caption { margin-top: 3px; color: #8993a5; font-size: 11px; }
.form-list { max-height: 62vh; }
.flow-form-list { padding: 6px 10px; }
.flow-form-row { padding: 10px; border-radius: 10px; }
.flow-form-row:hover { background: #f7f8fc; }
.flow-form-icon { width: 38px; height: 38px; color: #5148d9; background: #f0efff; }
.flow-form-title { color: #293449; font-size: 13px; font-weight: 600; }
.flow-form-description { margin-top: 2px; color: #8993a5; font-size: 11px; }
.flow-empty-title { color: #39445a; font-size: 14px; font-weight: 600; }
@media (max-width: 1020px) { .flow-dashboard-grid { grid-template-columns: 1fr; } .form-list { height: min(40vh, 360px); } }
@media (max-width: 600px) { .flow-dashboard-grid { gap: 14px; } }
</style>
