<template>
  <q-page class="designer-page" dir="rtl">
    <header class="designer-header">
      <div>
        <div class="flow-eyebrow">طراحی فرم</div>
        <h1 class="flow-page-title">{{ form.title || "فرم جدید" }}</h1>
        <p class="flow-page-subtitle">
          فیلد اضافه کنید، چیدمان را تنظیم کنید و فرم را ذخیره کنید.
        </p>
      </div>
      <div class="designer-header-actions">
        <q-btn flat icon="arrow_forward" label="بازگشت" to="/flow" /><q-btn
          unelevated
          class="flow-action-primary"
          icon="save"
          label="ذخیره فرم"
          :loading="isSaving"
          @click="submitForm"
        />
      </div>
    </header>
    <q-banner v-if="errors.length" class="designer-errors q-mb-md" rounded
      ><template #avatar
        ><q-icon name="error_outline" color="negative"
      /></template>
      <div v-for="error in errors" :key="error">{{ error }}</div></q-banner
    >
    <div class="designer-workspace">
      <aside class="designer-tools flow-surface">
        <div class="designer-panel-heading">
          <h2>افزودن فیلد</h2>
          <p>روی نوع فیلد کلیک کنید.</p>
        </div>
        <div class="tool-filter">
          <q-input
            v-model="elementFilter"
            dense
            outlined
            clearable
            placeholder="جستجوی فیلد"
            ><template #prepend><q-icon name="search" /></template
          ></q-input>
        </div>
        <div class="element-list">
          <button
            v-for="element in filteredElements"
            :key="element.id"
            type="button"
            class="element"
            :disabled="previewMode"
            @click="addElement(element)"
          >
            <q-icon :name="element.icon" /><span>{{ element.title }}</span
            ><q-icon name="add" class="element-add" />
          </button>
        </div>
        <p v-if="!filteredElements.length" class="designer-help q-pa-md">
          فیلدی پیدا نشد.
        </p>
      </aside>
      <main class="designer-center">
        <div class="designer-canvas flow-surface">
          <div class="canvas-heading">
            <div>
              <h2>{{ previewMode ? "پیش‌نمایش فرم" : "چیدمان فرم" }}</h2>
              <p>
                {{
                  previewMode
                    ? "نمای کلی فرم برای ثبت اطلاعات"
                    : "برای ویرایش، فیلد را انتخاب کنید؛ برای جابه‌جایی، دستگیره را بکشید."
                }}
              </p>
            </div>
            <q-btn-toggle
              v-model="previewMode"
              :options="[
                { label: 'طراحی', value: false },
                { label: 'پیش‌نمایش', value: true },
              ]"
              unelevated
              toggle-color="primary"
              color="grey-2"
              text-color="grey-7"
            />
          </div>
          <div v-if="!layout.length" class="designer-empty">
            <q-icon name="dashboard_customize" size="44px" /><strong
              >فرم را با اولین فیلد شروع کنید</strong
            >
            <p>از پنل «افزودن فیلد» در سمت راست، نوع فیلد را انتخاب کنید.</p>
          </div>
          <div v-else-if="previewMode" class="designer-preview">
            <h3>{{ form.title || "فرم جدید" }}</h3>
            <p v-if="form.description">{{ form.description }}</p>
            <div class="preview-fields">
              <div
                v-for="element in layout"
                :key="element.i"
                :style="{ gridColumn: `span ${element.w}` }"
                class="preview-field"
              >
                <component
                  :is="getElementComponent(element)"
                  v-bind="getElementProps(element)"
                  :label="element.formProperty.title"
                  :hint="element.formProperty.hint"
                  :placeholder="element.formProperty.placeholder"
                  outlined
                  dense
                  disable
                />
              </div>
            </div>
            <q-btn
              unelevated
              color="primary"
              label="ثبت اطلاعات"
              disable
              class="q-mt-lg"
            />
          </div>
          <grid-layout
            v-else
            v-model:layout="layout"
            :row-height="110"
            :is-draggable="$q.screen.width > 700"
            :is-resizable="false"
            :margin="[14, 14]"
            :use-css-transforms="true"
          >
            <grid-item
              v-for="(element, index) in layout"
              :key="element.i"
              :x="element.x"
              :y="element.y"
              :w="element.w"
              :h="element.h"
              :i="element.i"
              drag-allow-from=".field-drag"
              :class="[
                'designer-field',
                {
                  'designer-field-selected': element.i === selectedItem,
                  'designer-field-error': element.formProperty.hasError,
                },
              ]"
              @moved="rearrangeLayout(false)"
            >
              <div class="field-controls">
                <button
                  type="button"
                  class="field-drag"
                  :aria-label="`جابه‌جایی ${element.formProperty.title}`"
                >
                  <q-icon name="drag_indicator" /></button
                ><span>{{ faNumber(index + 1) }}</span
                ><q-space /><q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="arrow_upward"
                  :disable="index === 0"
                  aria-label="انتقال به قبل"
                  @click="moveElement(element, -1)"
                /><q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="arrow_downward"
                  :disable="index === layout.length - 1"
                  aria-label="انتقال به بعد"
                  @click="moveElement(element, 1)"
                />
              </div>
              <div
                role="button"
                tabindex="0"
                class="field-select"
                :aria-label="`تنظیمات ${element.formProperty.title}`"
                @click="selectItem(element)"
                @keydown.enter="selectItem(element)"
                @keydown.space.prevent="selectItem(element)"
              >
                <component
                  :is="getElementComponent(element)"
                  v-bind="getElementProps(element)"
                  :label="
                    element.formProperty.title +
                    (element.formProperty.isRequired ? ' *' : '')
                  "
                  :placeholder="element.formProperty.placeholder"
                  outlined
                  dense
                  disable
                  tabindex="-1"
                />
              </div>
            </grid-item>
          </grid-layout>
          <div class="canvas-footer">
            <span>{{ faNumber(layout.length) }} فیلد</span
            ><q-btn
              flat
              dense
              color="primary"
              icon="settings"
              label="مشخصات فرم"
              @click="clearSelection"
            />
          </div>
        </div>
        <q-expansion-item
          class="flow-surface designer-actions"
          icon="touch_app"
          label="عملیات فرم (اختیاری)"
          caption="دکمه‌ها و عملیات سفارشی"
        >
          <div class="q-pa-md">
            <div class="row q-gutter-sm">
              <q-chip
                v-for="(action, index) in actions"
                :key="`preset-${index}`"
                removable
                @remove="removePresetAction(index)"
                >{{ action.title }}</q-chip
              ><q-chip
                v-for="(action, index) in customActions"
                :key="`custom-${index}`"
                clickable
                @click="selectAction(action, index)"
                >{{ action.title }}</q-chip
              >
            </div>
            <q-btn
              flat
              color="primary"
              icon="add"
              label="افزودن عملیات"
              @click="$refs.actionsDialog.show()"
            />
          </div>
        </q-expansion-item>
      </main>
      <aside ref="inspector" class="designer-inspector flow-surface">
        <div class="designer-panel-heading">
          <div class="row items-center justify-between">
            <h2>
              {{
                selectedItem != null
                  ? "تنظیمات فیلد"
                  : selectedActionItem != null
                    ? "تنظیمات عملیات"
                    : "مشخصات فرم"
              }}
            </h2>
            <q-btn
              v-if="selectedItem != null || selectedActionItem != null"
              flat
              round
              dense
              icon="close"
              aria-label="بازگشت به مشخصات فرم"
              @click="clearSelection"
            />
          </div>
          <p>
            {{
              selectedItem != null
                ? selectedElement.formProperty.title
                : "عنوان و رفتار فرم را مشخص کنید."
            }}
          </p>
        </div>
        <div class="inspector-content">
          <div
            v-if="selectedItem == null && selectedActionItem == null"
            class="inspector-fields"
          >
            <q-input v-model="form.title" label="عنوان فرم *" outlined dense />
            <q-input
              v-model="form.name"
              label="نام انگلیسی *"
              input-class="technical-input"
              outlined
              dense
              hint="مانند contacts؛ با حرف انگلیسی شروع شود"
            />
            <q-input
              v-model="form.description"
              label="توضیحات"
              type="textarea"
              autogrow
              outlined
              dense
            />
            <q-expansion-item label="دسترسی و وضعیت" default-opened dense
              ><div class="inspector-toggles">
                <q-toggle
                  v-model="form.isAddable"
                  label="امکان ثبت رکورد"
                /><q-toggle
                  v-model="form.isUpdatable"
                  label="امکان ویرایش رکورد"
                /><q-toggle
                  v-model="form.isDeletable"
                  label="امکان حذف رکورد"
                /><q-toggle v-model="form.isActive" label="فرم فعال" /></div
            ></q-expansion-item>
          </div>
          <div
            v-else-if="selectedItem != null && selectedElement.formProperty"
            class="inspector-fields"
          >
            <q-input
              v-model="selectedElement.formProperty.title"
              label="عنوان فیلد *"
              outlined
              dense
              @update:model-value="refreshSelectedElement"
            />
            <q-input
              v-model="selectedElement.formProperty.name"
              label="نام انگلیسی *"
              input-class="technical-input"
              outlined
              dense
              @update:model-value="refreshSelectedElement"
            />
            <q-select
              :model-value="selectedElement.w"
              :options="widthOptions"
              emit-value
              map-options
              label="عرض فیلد"
              outlined
              dense
              @update:model-value="setFieldWidth"
            />
            <q-select
              v-model="selectedElement.formProperty.type"
              :options="elementTypeOptions"
              emit-value
              map-options
              label="نوع داده *"
              outlined
              dense
              @update:model-value="refreshSelectedElement"
            />
            <q-toggle
              v-model="selectedElement.formProperty.isRequired"
              label="وارد کردن این فیلد ضروری است"
              dense
              @update:model-value="refreshSelectedElement"
            />
            <q-expansion-item label="متن راهنما و مقدار اولیه" dense
              ><div class="inspector-fields q-pt-md">
                <q-input
                  v-model="selectedElement.formProperty.hint"
                  label="راهنمای فیلد"
                  outlined
                  dense
                /><q-input
                  v-model="selectedElement.formProperty.placeholder"
                  label="متن داخل کادر"
                  outlined
                  dense
                /><q-input
                  v-model="selectedElement.formProperty.defaultValue"
                  label="مقدار پیش‌فرض"
                  outlined
                  dense
                /></div
            ></q-expansion-item>
            <q-expansion-item label="ارتباط با داده‌های دیگر" dense
              ><div class="inspector-fields q-pt-md">
                <s-auto-complete
                  v-model:model-value="
                    selectedElement.formProperty.relatedFormId
                  "
                  label="فرم مرتبط"
                  :url="`${baseUrl}/flow/form`"
                  dense
                /><s-auto-complete
                  v-model:model-value="
                    selectedElement.formProperty.relatedFormPropertyId
                  "
                  label="فیلد مرتبط"
                  :url="`${baseUrl}/flow/formProperty`"
                  :filters="[
                    {
                      name: 'formId',
                      value: selectedElement.formProperty.relatedFormId,
                    },
                  ]"
                  dense
                /><s-auto-complete
                  v-model:model-value="selectedElement.formProperty.lookupId"
                  label="لیست انتخاب"
                  :url="`${baseUrl}/flow/lookup`"
                  dense
                /></div
            ></q-expansion-item>
            <q-expansion-item label="تنظیمات پیشرفته" dense
              ><div class="inspector-toggles">
                <q-checkbox
                  v-for="option in fieldFlags"
                  :key="option.key"
                  v-model="selectedElement.formProperty[option.key]"
                  :label="option.label"
                  dense
                /><s-code-editor
                  v-model:model-value="selectedElement.formProperty.cssStyle"
                  label="استایل CSS"
                /></div
            ></q-expansion-item>
            <q-btn
              flat
              color="negative"
              icon="delete_outline"
              label="حذف فیلد"
              @click="removeElement"
            />
          </div>
          <div v-else-if="selectedActionItem != null" class="inspector-fields">
            <q-input
              v-model="selectedAction.title"
              label="عنوان عملیات"
              outlined
              dense
            /><f-color-picker v-model="selectedAction.colorHex" /><q-select
              v-model="selectedAction.typeLookup"
              :options="actionTypes"
              emit-value
              map-options
              label="نوع عملیات"
              outlined
              dense
            /><s-code-editor
              v-model:model-value="selectedAction.script"
              label="اسکریپت"
            /><q-toggle v-model="selectedAction.isActive" label="فعال" /><q-btn
              flat
              color="negative"
              icon="delete_outline"
              label="حذف عملیات"
              @click="removeCustomAction"
            />
          </div>
        </div>
      </aside>
    </div>
    <q-dialog ref="actionsDialog"
      ><q-card class="q-pa-lg" dir="rtl"
        ><h2 class="flow-surface-title q-mb-md">افزودن عملیات</h2>
        <div class="column q-gutter-sm">
          <q-btn
            v-for="action in availablePresetActions"
            :key="action.name"
            flat
            color="primary"
            :label="action.title"
            @click="addPresetAction(action)"
          /><q-btn
            outline
            color="primary"
            label="عملیات سفارشی"
            @click="addCustomAction"
          /></div></q-card
    ></q-dialog>
  </q-page>
</template>

<script>
import * as VueGridLayout from "grid-layout-plus";
import FInput from "../../components/flow/FInput";
import FDropdown from "../../components/flow/FDropdown";
import FColorPicker from "../../components/flow/FColorPicker";
import SCodeEditor from "../../components/shared/SCodeEditor";
import SAutoComplete from "../../components/shared/SAutoComplete";
import FFormProperty from "../../components/flow/FFormProperty";
import FMoneyInput from "../../components/flow/FMoneyInput";
import FMultiDropdown from "../../components/flow/FMultiDropdown";

export default {
  name: "FormDesigner",
  components: {
    FMultiDropdown,
    FMoneyInput,
    FFormProperty,
    SAutoComplete,
    SCodeEditor,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    FInput,
    FColorPicker,
    FDropdown,
  },
  data: () => ({
    baseUrl: process.env.API_URL,
    elementFilter: "",
    previewMode: false,
    isSaving: false,
    widthOptions: [
      { label: "تمام ردیف", value: 12 },
      { label: "نصف ردیف", value: 6 },
      { label: "یک‌سوم ردیف", value: 4 },
      { label: "یک‌چهارم ردیف", value: 3 },
    ],
    fieldFlags: [
      { key: "isAddable", label: "قابل درج" },
      { key: "isUpdatable", label: "قابل ویرایش" },
      { key: "isFilterable", label: "قابل جستجو" },
      { key: "isHiddenInGrid", label: "مخفی در جدول" },
      { key: "isHiddenInForm", label: "مخفی در فرم" },
      { key: "isVisibleInDropdown", label: "نمایش در لیست انتخاب" },
      { key: "isUnique", label: "مقدار یکتا" },
      { key: "isSensitiveToRepetition", label: "بررسی تکرار" },
      { key: "isComputed", label: "محاسباتی" },
      { key: "isActive", label: "فعال" },
    ],
    hasError: false,
    errors: [],
    selectedItem: null,
    selectedActionItem: null,
    hoveredAction: null,
    selectedElement: {},
    selectedAction: {},
    form: {
      title: "",
      name: "",
      description: "",
      isAddable: true,
      isUpdatable: true,
      isDeletable: true,
      isActive: true,
    },
    layout: [],
    elements: [],
    actions: [],
    customActions: [],
    presetActions: [
      {
        title: "دانلود",
        name: "download",
        colorHex: "#16a34a",
        typeLookup: 1,
        script: "",
        isActive: true,
      },
      {
        title: "چاپ",
        name: "print",
        colorHex: "#3b82f6",
        typeLookup: 1,
        script: "",
        isActive: true,
      },
    ],
    actionTypes: [
      { label: "دیتابیس", value: 1 },
      { label: "کلاینت", value: 2 },
    ],
  }),
  computed: {
    id() {
      return Number(this.$route.query.id) || 0;
    },
    filteredElements() {
      const query = this.elementFilter?.trim();
      return query
        ? this.elements.filter((element) => element.title.includes(query))
        : this.elements;
    },
    elementTypeOptions() {
      const labels = {
        string: "متن",
        text: "متن بلند",
        int: "عدد صحیح",
        decimal: "عدد اعشاری",
        float: "عدد اعشاری",
        double: "عدد اعشاری",
        number: "عدد",
        bool: "بله / خیر",
        boolean: "بله / خیر",
        date: "تاریخ",
        datetime: "تاریخ و زمان",
        time: "زمان",
      };
      return this.elementTypes.map((value) => ({
        value,
        label: labels[value] || value,
      }));
    },
    elementTypes() {
      const element = this.elements.find(
        (element) =>
          element.id === this.selectedElement?.formProperty?.elementId,
      );
      return element ? element.acceptableTypes.split(",") : [];
    },
    availablePresetActions() {
      return this.presetActions.filter(
        (action) =>
          this.actions.findIndex((item) => item.name === action.name) < 0,
      );
    },
  },
  methods: {
    faNumber(value) {
      return Number(value).toLocaleString("fa-IR");
    },
    clearSelection() {
      this.selectedItem = null;
      this.selectedActionItem = null;
      this.selectedElement = {};
      this.selectedAction = {};
    },
    packLayout() {
      let x = 0,
        y = 0;
      this.layout.forEach((item) => {
        if (x + item.w > 12) {
          x = 0;
          y++;
        }
        item.x = x;
        item.y = y;
        item.h = 1;
        x += item.w;
      });
      this.refreshLayout();
    },
    setFieldWidth(value) {
      const width = Number(value);
      if (!Number.isInteger(width) || width < 1 || width > 12) return;
      this.layout.find((item) => item.i === this.selectedItem).w = width;
      this.selectedElement.w = width;
      this.packLayout();
    },
    moveElement(element, offset) {
      const index = this.layout.findIndex((item) => item.i === element.i),
        target = index + offset;
      if (target < 0 || target >= this.layout.length) return;
      const [item] = this.layout.splice(index, 1);
      this.layout.splice(target, 0, item);
      this.packLayout();
    },
    refreshSelectedElement() {
      this.refreshLayout();
      this.selectedElement =
        this.layout.find((item) => item.i === this.selectedItem) || {};
    },
    validateForm() {
      this.hasError = false;
      this.errors = [];
      if (!this.form.title?.trim()) {
        this.hasError = true;
        this.errors.push(`عنوان فرم به درستی مشخص نشده است`);
      }
      const validName = (name) =>
        /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(name || "");
      if (!validName(this.form.name)) {
        this.hasError = true;
        this.errors.push(`نام انگلیسی فرم به درستی مشخص نشده است`);
      }
      const names = new Set();
      let properties = this.layout.map((item) => item.formProperty);
      properties.forEach((prop, index) => {
        prop.hasError = false;
        if (!prop.title?.trim()) {
          this.hasError = true;
          this.errors.push(
            `${"عنوان فیلد شماره"} ${index + 1} ${"به درستی وارد نشده است"}`,
          );
          prop.hasError = true;
        }
        const normalizedName = prop.name?.toLowerCase();
        if (!validName(prop.name) || names.has(normalizedName)) {
          this.hasError = true;
          this.errors.push(
            `نام انگلیسی فیلد شماره ${this.faNumber(index + 1)} باید معتبر و غیرتکراری باشد.`,
          );
          prop.hasError = true;
        }
        names.add(normalizedName);
        if (!prop.type?.trim()) {
          this.hasError = true;
          this.errors.push(
            `${"نوع فیلد شماره"} ${index + 1} ${"به درستی وارد نشده است"}`,
          );
          prop.hasError = true;
        }
      });

      this.layout = [...this.layout];
      return !this.hasError;
    },
    async submitForm() {
      if (!this.validateForm()) return;
      let data = Object.assign({}, this.form, {
        id: this.id || 0,
        layout: JSON.stringify(
          this.layout?.map((item) => ({
            x: item.x,
            y: item.y,
            w: item.w,
            i: item.i,
            h: item.h,
          })) || {},
        ),
        items: this.layout.map((item) => item.formProperty),
        actionItems: [...this.actions, ...this.customActions],
      });
      this.isSaving = true;
      try {
        const res = await this.$axios.post(
          `${process.env.API_URL}/flow/form/upsert`,
          data,
        );
        if (this.id === 0) {
          await this.$router.replace({
            path: this.$route.fullPath,
            query: {
              id: res.data.result,
            },
          });
        }
        await this.loadFormInfo();
        if (process.env.FLOW_STANDALONE)
          await this.$store.dispatch("loadForms");
        this.clearSelection();
        this.$q.notify({
          message: "فرم با موفقیت ذخیره شد",
          color: "positive",
        });
      } catch (error) {
        this.errors = [
          error.response?.data?.error?.message ||
            "ذخیره فرم انجام نشد؛ دوباره تلاش کنید.",
        ];
      } finally {
        this.isSaving = false;
      }
    },
    async loadFormInfo() {
      let res = await this.$axios.get(`${process.env.API_URL}/flow/form/info`, {
        params: {
          formId: this.id,
        },
      });
      let formData = res.data.result;
      this.form.title = formData.title;
      this.form.name = formData.name;
      this.form.description = formData.description;
      this.layout = JSON.parse(formData.layout);
      this.form.isAddable = formData.isAddable;
      this.form.isUpdatable = formData.isUpdatable;
      this.form.isDeletable = formData.isDeletable;
      this.form.isActive = formData.isActive;
      formData.formProperties.forEach((property) => {
        this.layout.find(
          (item) => item.i == property.layoutIndex,
        ).formProperty = property;
      });
      this.actions = this.mapActions(
        formData.formActions?.filter((action) => action.name !== "custom"),
      );
      this.customActions = this.mapActions(
        formData.formActions?.filter((action) => action.name === "custom"),
      );
    },
    async loadElements() {
      const res = await this.$axios.get(
        `${process.env.API_URL}/flow/element/list`,
      );
      this.elements = res.data.result;
    },
    addElement(element) {
      let y =
        this.layout.length > 0 ? Math.max(...this.layout.map((x) => x.y)) : 0;
      let rowWidth = this.layout
        .filter((x) => x.y === y)
        .map((x) => x.w)
        .reduce((a, b) => a + b, 0);
      let x = rowWidth % 12;
      if (rowWidth > 9) {
        y++;
        x = 0;
      }
      let index =
        this.layout.length > 0
          ? Math.max(...this.layout.map((item) => parseInt(item.i))) + 1
          : 0;
      this.layout.push({
        x,
        y,
        w: 6,
        h: 1,
        i: index,
        formProperty: {
          layoutIndex: index,
          elementId: element.id,
          title: element.title,
          type: element.acceptableTypes.split(",")[0],
          defaultValue: "",
          cssStyle: "",
          hint: "",
          placeholder: "",
          rules: "",
          relatedFormId: null,
          relatedFormPropertyId: null,
          lookupId: null,
          isRequired: false,
          isAddable: true,
          isUpdatable: true,
          isFilterable: true,
          isHiddenInGrid: false,
          isHiddenInForm: false,
          isVisibleInDropdown: false,
          isUnique: false,
          isSensitiveToRepetition: false,
          isComputed: false,
          isActive: true,
        },
      });
      this.packLayout();
      this.selectItem(this.layout[this.layout.length - 1]);
    },
    addPresetAction(action) {
      this.$refs.actionsDialog.hide();
      this.actions.push(action);
    },
    addCustomAction() {
      this.$refs.actionsDialog.hide();
      this.customActions.push({
        title: "شخصی سازی شده",
        name: "custom",
        colorHex: "#0ea5e9",
        typeLookup: 1,
        script: "",
        isActive: true,
      });
    },
    removeElement() {
      if (this.selectedItem == null) return;
      let index = this.layout.findIndex((item) => item.i === this.selectedItem);
      this.clearSelection();
      this.layout.splice(index, 1);
      this.rearrangeLayout(false);
    },
    removePresetAction(index) {
      this.actions.splice(index, 1);
      this.hoveredAction = null;
    },
    removeCustomAction() {
      const index = this.selectedActionItem;
      this.clearSelection();
      this.customActions.splice(index, 1);
    },
    selectItem(element) {
      this.selectedActionItem = null;
      this.selectedItem = element.i;
      this.selectedElement = element;
      if (this.$q.screen.width <= 700)
        this.$nextTick(() =>
          this.$refs.inspector.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        );
    },
    selectAction(action, index) {
      if (index === this.selectedActionItem) {
        this.selectedActionItem = null;
        this.selectedAction = {};
      } else {
        if (this.selectedItem != null) this.selectedItem = null;
        this.selectedActionItem = index;
        this.selectedAction = this.customActions[index];
      }
    },
    getElementProps(element) {
      const definition = this.elements.find(
        (item) => item.id === element.formProperty.elementId,
      );
      const config = definition?.config ? JSON.parse(definition.config) : {};
      const value = element.formProperty.defaultValue;
      return {
        ...config,
        ...(config.type === "textarea" ? { rows: 1 } : {}),
        modelValue:
          definition?.componentName === "q-checkbox"
            ? String(value).toLowerCase() === "true"
            : value,
      };
    },
    getElementComponent(element) {
      if (element && this.elements)
        return this.elements.find(
          (item) => element.formProperty.elementId === item.id,
        )?.componentName;
    },
    getElementIcon() {
      return this.elements.find(
        (element) =>
          element.id ===
          this.layout.find((item) => item.i === this.selectedItem)?.formProperty
            .elementId,
      )?.icon;
    },
    rearrangeLayout(event) {
      this.layout.sort((a, b) => {
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        return a.x - b.x;
      });
      if (event !== false && this.selectedItem != null)
        this.selectedElement.w = Math.max(1, Math.min(12, Number(event) || 6));
      this.packLayout();
    },
    refreshLayout() {
      this.layout = [...this.layout];
    },
    mapActions(actions) {
      if (actions)
        return actions.map((action) => ({
          id: action.id,
          name: action.name,
          title: action.title,
          colorHex: `#${String(action.colorHex || "").replace(/^#/, "")}`,
          formId: action.formId,
          typeLookup: action.typeLookup,
          script: action.script,
          isActive: action.isActive,
        }));
      else return [];
    },
  },
  async mounted() {
    if (this.id > 0 && !this.$store.state.forms?.length)
      await this.$store.dispatch("loadForms");
    if (this.id > 0) await this.loadFormInfo();
    await this.loadElements();
  },
};
</script>

<style scoped>
.designer-page {
  padding: 24px;
  width: 100%;
  text-align: start;
}
.designer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}
.designer-header-actions {
  display: flex;
  gap: 10px;
}
.designer-workspace {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr) 300px;
  gap: 18px;
  align-items: start;
}
.designer-tools,
.designer-inspector {
  position: sticky;
  top: 84px;
  max-height: calc(100vh - 105px);
  overflow: auto;
}
.designer-panel-heading {
  padding: 18px;
  border-bottom: 1px solid #e5e9f1;
}
.designer-page h2 {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}
.designer-panel-heading p,
.canvas-heading p,
.designer-help {
  font-size: 11px;
  color: #778197;
  margin: 5px 0 0;
}
.tool-filter {
  padding: 12px;
}
.element-list {
  display: grid;
  gap: 7px;
  padding: 0 12px 16px;
}
.element {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 10px;
  border: 1px solid #e5e9f1;
  border-radius: 9px;
  background: #fff;
  color: #39445a;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  text-align: start;
}
.element > .q-icon {
  color: #4f46e5;
  font-size: 19px;
}
.element-add {
  margin-inline-start: auto;
}
.element:hover,
.element:focus-visible {
  background: #eeedff;
  border-color: #4f46e5;
}
.element:disabled {
  opacity: 0.5;
  cursor: default;
}
.designer-center {
  min-width: 0;
}
.canvas-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 18px;
  border-bottom: 1px solid #e5e9f1;
}
.designer-canvas {
  min-height: 330px;
  overflow: hidden;
}
.designer-empty {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
  padding: 65px 22px;
  color: #778197;
  font-size: 12px;
}
.designer-empty strong {
  color: #39445a;
}
.designer-empty p {
  margin: 0;
  max-width: 330px;
}
.designer-field {
  background: #fafbfe;
  border: 1px solid #e5e9f1;
  border-radius: 10px;
  padding: 8px;
}
.designer-field-selected {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px #eeedff;
}
.designer-field-error {
  border-color: #d14343;
}
.field-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 29px;
  color: #8b95a6;
  font-size: 10px;
}
.field-drag {
  background: transparent;
  border: 0;
  color: #8b95a6;
  cursor: grab;
  padding: 0;
  display: flex;
}
.field-select {
  cursor: pointer;
  padding-top: 6px;
}
.field-select :deep(.q-field),
.field-select :deep(.q-checkbox) {
  pointer-events: none;
}
.field-select:focus-visible {
  outline: 2px solid #4f46e5;
  border-radius: 6px;
}
.canvas-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e5e9f1;
  padding: 12px 18px;
  color: #778197;
  font-size: 11px;
}
.designer-actions {
  margin-top: 16px;
  overflow: hidden;
}
.inspector-content {
  padding: 18px;
}
.inspector-fields {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.inspector-toggles {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 0;
}
.inspector-fields :deep(.q-expansion-item) {
  border-top: 1px solid #edf0f5;
  padding-top: 8px;
}
.inspector-fields :deep(.q-item) {
  padding-inline: 0;
}
.inspector-fields :deep(.technical-input) {
  direction: ltr;
  text-align: left;
  font-family: monospace;
}
.designer-errors {
  background: #fff1f2;
  color: #a43f47;
}
.designer-preview {
  padding: 24px;
}
.designer-preview h3 {
  font-size: 18px;
  margin: 0 0 8px;
}
.designer-preview p {
  color: #778197;
  font-size: 12px;
  margin-bottom: 22px;
}
.preview-fields {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 22px 16px;
}
@media (max-width: 1100px) {
  .designer-workspace {
    grid-template-columns: minmax(0, 1fr) 290px;
  }
  .designer-tools {
    grid-column: 1/-1;
    position: static;
    max-height: none;
  }
  .element-list {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
  .tool-filter {
    max-width: 300px;
  }
  .designer-panel-heading {
    padding: 14px 18px;
  }
  .designer-tools .designer-panel-heading p {
    display: none;
  }
}
@media (max-width: 700px) {
  .designer-page {
    padding: 16px;
  }
  .designer-header {
    align-items: stretch;
    flex-direction: column;
  }
  .designer-header-actions {
    justify-content: space-between;
  }
  .designer-workspace {
    grid-template-columns: 1fr;
  }
  .element-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .designer-inspector {
    position: static;
    max-height: none;
    scroll-margin-top: 80px;
  }
  .designer-canvas :deep(.vgl-layout) {
    height: auto !important;
  }
  .designer-field {
    position: relative !important;
    transform: none !important;
    right: auto !important;
    left: auto !important;
    width: calc(100% - 28px) !important;
    height: 110px !important;
    margin: 14px;
  }
  .field-drag {
    display: none;
  }
  .preview-field {
    grid-column: span 12 !important;
  }
  .canvas-heading {
    padding: 14px;
  }
  .designer-empty {
    padding: 36px 16px;
  }
}
</style>
