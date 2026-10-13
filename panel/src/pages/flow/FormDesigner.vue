<template>
  <q-layout view="hHh LpR fFf">

    <!-- element list -->
    <q-drawer v-model="right" side="left" bordered behavior="desktop" :breakpoint="0">
      <q-scroll-area class="full-width full-height q-px-md q-py-lg" :thumb-style="thumbStyle">
        <div :class="['column full-width q-pt-xl q-pb-md q-gutter-y-md', elements.length > 9 ? 'q-pr-sm' : undefined]">
          <div v-for="element of elements"
               class="element full-width border-radius overflow-hidden bg-grey-2 cursor-pointer"
               @click="addElement(element)">
            <div class="row q-gutter-x-md items-center text-black">

              <!-- icon -->
              <div class="icon col-auto q-pa-sm">
                <q-icon :name="element.icon" size="sm"/>
              </div>

              <!-- title -->
              <div class="col text-subtitle2">
                {{ element.title }}
              </div>

              <!-- add -->
              <div class="col-auto q-pr-md">
                <q-icon class="add" name="add" size="xs" color="cyan-7"/>
              </div>

            </div>
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- body -->
    <q-page-container>
      <q-page class="column full-width q-pa-md q-gutter-y-md">

        <!-- form header -->
        <div class="row full-width border-radius bg-white q-pa-md justify-between items-center">

          <!-- title -->
          <div class="text-subtitle1 text-black">
            فرم
            {{ form.title.length > 0 ? form.title : ' جدید' }}
          </div>

          <!-- controls -->
          <div class="row col-4 q-gutter-x-md items-center">

            <!-- submit -->
            <div class="col">
              <q-btn class="full-width border-radius" color="cyan-2" text-color="cyan-7" label="ذخیره" unelevated
                     @click="submitForm"/>
            </div>

            <!-- return -->
            <div class="col">
              <q-btn class="full-width border-radius" color="pink-2" text-color="pink-7" label="بازگشت" unelevated
                     @click="$navigateBack"/>
            </div>

          </div>

        </div>

        <!-- grid -->
        <div class="column full-width border-radius bg-white">

          <!-- layout -->
          <grid-layout
            v-model:layout="layout"
            :row-height="48"
            :is-draggable="true"
            :is-resizable="false"
            :is-mirrored="false"
            :margin="[20, 20]"
            :use-css-transforms="true"
          >
            <grid-item v-for="element of layout"
                       :class="[element.i === selectedItem ? 'grid-item-selected' : 'grid-item',element.formProperty && element.formProperty.hasError?'grid-item-error':undefined]"
                       :x="element.x"
                       :y="element.y"
                       :w="element.w"
                       :h="element.h"
                       :i="element.i"
                       :key="element.i"
                       @moved="rearrangeLayout(false)"
            >

              <!-- component -->
              <component
                :is="getElementComponent(element)"
                :model-value="element.formProperty && element.formProperty.defaultValue"
                :label="element.formProperty && element.formProperty.title"
                :hint="element.formProperty && element.formProperty.hint"
                :placeholder="element.formProperty && element.formProperty.placeholder"
                :stack-label="element.formProperty.placeholder && element.formProperty.placeholder.length > 0"
                dense outlined readonly/>

              <!-- selection -->
              <div class="full-width full-height" @click="selectItem(element)"
                   style="position: absolute;top:0;left: 0"/>

            </grid-item>
          </grid-layout>

          <!-- actions -->
          <div class="row full-width q-px-md q-pb-md q-gutter-x-md justify-end items-center">

            <!-- add action -->
            <div class="col-2">
              <q-btn class="full-width border-radius" color="grey-3" text-color="grey-9" icon="add" unelevated
                     @click="$refs.actionsDialog.show()"/>
            </div>

            <!-- actions dialog -->
            <q-dialog ref="actionsDialog">
              <div class="bg-white" style="border-radius: 1rem">
                <div class="column q-pa-md q-gutter-y-md">

                  <!-- info -->
                  <div class="row full-width justify-center items-center">
                    <div class="text-subtitle2 text-weight-regular text-grey-7">
                      عملیات مورد نظر خود را انتخاب کنید
                    </div>
                  </div>

                  <!-- preset actions -->
                  <div v-for="action of availablePresetActions" class="full-width">
                    <q-btn class="full-width border-radius"
                           :style="{'background-color': `${action.colorHex}66`, color: action.colorHex}"
                           :label="action.title" unelevated @click="addPresetAction(action)"/>
                  </div>

                  <!-- custom action -->
                  <div class="full-width">
                    <q-btn class="full-width border-radius" color="grey-3" text-color="grey-9" label="شخصی سازی شده"
                           unelevated @click="addCustomAction"/>
                  </div>

                </div>
              </div>
            </q-dialog>

            <!-- custom actions -->
            <div v-for="(action, index) of customActions" class="col-auto">
              <q-btn
                :class="['full-width border-radius', index === selectedActionItem ? 'border-medium' : undefined]"
                :style="{'background-color': `${action.colorHex}66`, color: action.colorHex}"
                :label="action.title" :ripple="false" unelevated @click="selectAction(action, index)"/>
            </div>

            <!-- preset actions -->
            <div v-for="(action, index) of actions" class="col-auto">
              <q-btn class="animated full-width border-radius"
                     :style="{'background-color': `${action && action.colorHex}66`, color: action && action.colorHex}"
                     :color="index === hoveredAction ? 'red-13' : undefined"
                     :text-color="index === hoveredAction ? 'grey-1' : undefined"
                     :label="index === hoveredAction ? 'حذف' : action && action.title" :ripple="false" unelevated
                     @mouseenter="hoveredAction = index" @mouseleave="hoveredAction = null"
                     @click="removePresetAction(index)"/>
            </div>

            <!-- default actions -->
            <div v-for="action of defaultActions" class="col-auto">
              <q-btn disable class="full-width border-radius" :color="`${action.color}-2`" :text-color="`${action.color}-7`"
                     :label="action.title" :ripple="false" unelevated/>
            </div>

          </div>

        </div>

        <!-- info -->
        <div class="column full-width border-radius">
          <q-banner class="text-white bg-pink rounded-borders q-mb-sm" v-for="error of errors">
            <template v-slot:avatar>
              <q-icon name="info" color="white"/>
            </template>
            {{ error }}
          </q-banner>
        </div>
      </q-page>
    </q-page-container>

    <!-- properties -->
    <q-drawer v-model="left" side="right" bordered behavior="desktop" :breakpoint="0">
      <div class="column full-width full-height q-pt-xl q-pb-lg bg-grey-1">

        <!-- header -->
        <div class="full-width col-auto q-px-sm q-pt-md q-pb-sm">

          <!-- form -->
          <div v-if="selectedItem == null && selectedActionItem == null"
               class="row q-gutter-x-sm items-center text-grey-9">

            <!-- icon -->
            <q-icon name="settings" size="1.4rem"/>

            <!-- title -->
            <div class="text-subtitle1">
              مشخصات فرم
            </div>

          </div>

          <!-- form property -->
          <div v-else-if="selectedActionItem == null && selectedItem != null"
               class="row full-width items-center text-grey-9">

            <!-- icon -->
            <q-icon class="col-auto" :name="getElementIcon(selectedItem)" size="1.4rem"/>

            <!-- title -->
            <div class="col q-px-sm single-line-clamp text-subtitle1">
              مشخصات
              {{ selectedElement && selectedElement.formProperty && selectedElement.formProperty.title }}
            </div>

            <!-- return -->
            <div class="col-auto">
              <q-icon class="text-primary-hover cursor-pointer" name="chevron_left" size="sm"
                      @click="selectedItem = null"/>
            </div>

          </div>

          <!-- action -->
          <div v-else-if="selectedItem == null && selectedActionItem != null"
               class="row full-width items-center text-grey-9">

            <!-- icon -->
            <q-icon class="col-auto" name="touch_app" size="1.4rem"/>

            <!-- title -->
            <div class="col q-px-sm single-line-clamp text-subtitle1">
              مشخصات عملیات
            </div>

            <!-- return -->
            <div class="col-auto">
              <q-icon class="text-primary-hover cursor-pointer" name="chevron_left" size="sm"
                      @click="selectedActionItem = null"/>
            </div>

          </div>

        </div>

        <q-separator/>

        <!-- content -->
        <div class="full-width col">
          <q-scroll-area class="full-width full-height q-px-md" :bar-style="barStyle" :thumb-style="thumbStyle" visible>
            <div class="full-width q-py-md">

              <!-- form properties -->
              <div v-if="selectedItem == null && selectedActionItem == null" class="column full-width q-gutter-y-md">

                <!-- title -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="row q-mb-sm text-subtitle2 text-weight-regular items-end">
                    <span>عنوان</span>
                    <span class="q-ml-xs text-caption text-grey">(ضروری)</span>
                  </div>

                  <!-- input -->
                  <q-input v-model="form.title" class="full-width" bg-color="white" outlined dense/>

                </div>

                <!-- title -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="row q-mb-sm text-subtitle2 text-weight-regular items-end">
                    <span>نام انگلیسی</span>
                    <span class="q-ml-xs text-caption text-grey">(ضروری)</span>
                  </div>

                  <!-- input -->
                  <q-input v-model="form.name" mask="ASSSSSSSSSSSSSSSSSSSSSSSSSSSSS" dir="ltr" class="full-width" bg-color="white"
                           outlined dense/>

                </div>

                <!-- description -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="q-mb-sm text-subtitle2 text-weight-regular">
                    توضیحات
                  </div>

                  <!-- input -->
                  <q-input v-model="form.description" class="full-width" bg-color="white" outlined dense/>

                </div>

                <!-- is addable -->
                <q-checkbox v-model="form.isAddable" color="primary" size="sm" label="قابل درج" dense/>

                <!-- is updatable -->
                <q-checkbox v-model="form.isUpdatable" color="primary" size="sm" label="قابل ویرایش" dense/>

                <!-- is deletable -->
                <q-checkbox v-model="form.isDeletable" color="primary" size="sm" label="قابل حذف" dense/>

                <!-- is active -->
                <q-checkbox v-model="form.isActive" color="primary" size="sm" label="فعال" dense/>

              </div>

              <!-- element properties -->
              <div
                v-else-if="selectedActionItem == null && selectedItem != null && selectedElement && selectedElement.formProperty"
                class="column full-width q-pr-sm q-gutter-y-md">

                <!-- label -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="row q-mb-sm text-subtitle2 text-weight-regular items-end">
                    <span>عنوان</span>
                    <span class="q-ml-xs text-caption text-grey">(ضروری)</span>
                  </div>

                  <!-- input -->
                  <q-input v-model="selectedElement.formProperty.title" class="full-width" bg-color="white" outlined
                           @update:model-value="refreshSelectedElement" dense/>

                </div>

                <!-- label -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="row q-mb-sm text-subtitle2 text-weight-regular items-end">
                    <span>نام انگلیسی</span>
                    <span class="q-ml-xs text-caption text-grey">(ضروری)</span>
                  </div>

                  <!-- input -->
                  <q-input v-model="selectedElement.formProperty.name" mask="ASSSSSSSSSSSSSSSSSSSSSSSSSSSSS" dir="ltr"
                           class="full-width" bg-color="white" outlined @update:model-value="refreshSelectedElement" dense/>

                </div>

                <!-- width -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="q-mb-sm text-subtitle2 text-weight-regular">
                    اندازه
                  </div>

                  <!-- input -->
                  <q-input :model-value="selectedElement.w" class="full-width" bg-color="white"
                           hint="ابعاد باید بین 1 تا 12 باشد" type="number" outlined dense
                           @update:model-value="rearrangeLayout();refreshSelectedElement()"/>

                </div>

                <!-- type -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="q-mb-sm text-subtitle2 text-weight-regular">
                    نوع
                  </div>

                  <!-- input -->
                  <q-select v-model="selectedElement.formProperty.type" class="full-width" :options="elementTypes"
                            bg-color="white" outlined dense @update:model-value="refreshLayout();refreshSelectedElement()"/>

                </div>

                <!-- hint -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="q-mb-sm text-subtitle2 text-weight-regular">
                    راهنما
                  </div>

                  <!-- input -->
                  <q-input v-model="selectedElement.formProperty.hint" class="full-width" bg-color="white" outlined
                           @update:model-value="refreshSelectedElement" dense/>

                </div>

                <!-- default value -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="q-mb-sm text-subtitle2 text-weight-regular">
                    مقدار پیش فرض
                  </div>

                  <!-- input -->
                  <q-input v-model="selectedElement.formProperty.defaultValue" class="full-width" bg-color="white"
                           @update:model-value="refreshSelectedElement" outlined dense/>

                </div>

                <!-- placeholder -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="q-mb-sm text-subtitle2 text-weight-regular">
                    متن نمایشی
                  </div>

                  <!-- input -->
                  <q-input v-model="selectedElement.formProperty.placeholder" class="full-width" bg-color="white"
                           outlined dense @update:model-value="refreshLayout();refreshSelectedElement()"/>

                </div>

                <!-- related form -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="q-mb-sm text-subtitle2 text-weight-regular">
                    فرم مربوطه
                  </div>

                  <!-- auto complete -->
                  <s-auto-complete v-model:model-value="selectedElement.formProperty.relatedFormId" bg-color="white"
                                   @input="refreshSelectedElement" :url="`${baseUrl}/flow/form`" dense/>

                </div>

                <!-- related form property -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="q-mb-sm text-subtitle2 text-weight-regular">
                    فیلد وابسته
                  </div>

                  <!-- auto complete -->
                  <s-auto-complete v-model:model-value="selectedElement.formProperty.relatedFormPropertyId" bg-color="white"
                                   :url="`${baseUrl}/flow/formProperty`" @input="refreshSelectedElement"
                                   :filters="[{name: 'formId', value: selectedElement.relatedFormId}]" dense/>

                </div>

                <!-- lookup -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="q-mb-sm text-subtitle2 text-weight-regular">
                    لیست
                  </div>

                  <!-- auto complete -->
                  <s-auto-complete v-model:model-value="selectedElement.formProperty.lookupId" bg-color="white"
                                   :url="`${baseUrl}/flow/lookup`" @input="refreshSelectedElement"
                                   dense/>

                </div>

                <!-- is required -->
                <q-toggle v-model="selectedElement.formProperty.isRequired" color="primary" size="sm" label="ضروری"
                          @update:model-value="refreshSelectedElement" dense/>

                <!-- is addable -->
                <q-checkbox v-model="selectedElement.formProperty.isAddable" color="primary" size="sm" label="قابل درج"
                            @update:model-value="refreshSelectedElement" dense/>

                <!-- is updatable -->
                <q-checkbox v-model="selectedElement.formProperty.isUpdatable" color="primary" size="sm"
                            label="قابل ویرایش" @update:model-value="refreshSelectedElement" dense/>

                <!-- is filterable -->
                <q-checkbox v-model="selectedElement.formProperty.isFilterable" color="primary" size="sm"
                            label="قابل فیلتر / جستجو"
                            @update:model-value="refreshSelectedElement" dense/>

                <!-- is hidden in grid -->
                <q-checkbox v-model="selectedElement.formProperty.isHiddenInGrid" color="primary" size="sm"
                            label="عدم نمایش در لیست"
                            @update:model-value="refreshSelectedElement" dense/>

                <!-- is visible in dropdown -->
                <q-checkbox v-model="selectedElement.formProperty.isVisibleInDropdown" color="primary" size="sm"
                            label="نمایش در کمبو باکس" @update:model-value="refreshSelectedElement" dense/>

                <!-- is hidden in form -->
                <q-checkbox v-model="selectedElement.formProperty.isHiddenInForm" color="primary" size="sm"
                            label="عدم نمایش در فرم"
                            @update:model-value="refreshSelectedElement" dense/>

                <!-- is unique -->
                <q-checkbox v-model="selectedElement.formProperty.isUnique" color="primary" size="sm"
                            label="منحصر به فرد" @update:model-value="refreshSelectedElement" dense/>

                <!-- is SensitiveToRepetition -->
                <q-checkbox v-model="selectedElement.formProperty.isSensitiveToRepetition" color="primary" size="sm"
                            label="حساس به تکرار" @update:model-value="refreshSelectedElement" dense/>

                <!-- is computed -->
                <q-checkbox v-model="selectedElement.formProperty.isComputed" color="primary" size="sm" label="محاسباتی"
                            @update:model-value="refreshSelectedElement" dense/>

                <!-- is active -->
                <q-checkbox v-model="selectedElement.formProperty.isActive" color="primary" size="sm" label="فعال"
                            @update:model-value="refreshSelectedElement" dense/>

                <!-- css style -->
                <div class="full-width border-radius overflow-hidden">
                  <s-code-editor v-model:model-value="selectedElement.formProperty.cssStyle" label="استایل css"/>
                </div>

                <!-- rules -->
                <div class="full-width">
                  <q-btn class="full-width border-radius" color="light-blue-2" text-color="light-blue-7"
                         label="ویرایش قوانین" unelevated dense/>
                </div>

              </div>

              <!-- custom action properties -->
              <div v-else-if="selectedItem == null && selectedActionItem != null && selectedAction"
                   class="column full-width q-gutter-y-md">

                <!-- title -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="row q-mb-sm text-subtitle2 text-weight-regular items-end">
                    <span>عنوان</span>
                    <span class="q-ml-xs text-caption text-grey">(ضروری)</span>
                  </div>

                  <!-- input -->
                  <q-input v-model:model-value="selectedAction.title" class="full-width" bg-color="white" outlined
                           dense/>

                </div>

                <!-- color -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="q-mb-sm text-subtitle2 text-weight-regular">
                    رنگ
                  </div>

                  <!-- color picker -->
                  <f-color-picker v-model="selectedAction.colorHex"/>

                </div>

                <!-- type -->
                <div class="column full-width">

                  <!-- label -->
                  <div class="q-mb-sm text-subtitle2 text-weight-regular">
                    نوع
                  </div>

                  <!-- input -->
                  <q-select v-model:model-value="selectedAction.typeLookup" class="full-width" :options="actionTypes"
                            bg-color="white" map-options emit-value outlined dense/>

                </div>

                <!-- script -->
                <div class="full-width border-radius overflow-hidden">
                  <s-code-editor v-model:model-value="selectedAction.script" label="اسکریپت"/>
                </div>

                <!-- is active -->
                <q-checkbox v-model:model-value="selectedAction.isActive" color="primary" size="sm" label="فعال" dense/>

              </div>

            </div>
          </q-scroll-area>
        </div>

        <q-separator v-if="selectedItem != null || selectedAction != null"/>

        <!-- footer -->
        <div v-if="selectedItem != null || selectedActionItem != null" class="full-width col-auto q-pa-sm">
          <div class="full-width">

            <!-- remove element -->
            <q-btn v-if="selectedItem != null" class="full-width border-radius" color="red-2" text-color="red-7"
                   label="حذف" unelevated dense
                   @click="removeElement()"/>

            <!-- remove action -->
            <q-btn v-else class="full-width border-radius" color="red-2" text-color="red-7" label="حذف" unelevated dense
                   @click="removeCustomAction()"/>

          </div>
        </div>

      </div>
    </q-drawer>

  </q-layout>
</template>

<script>
import * as VueGridLayout from 'grid-layout-plus'
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
    FDropdown
  },
  data: () => ({
    baseUrl: process.env.API_URL,
    hasError: false,
    errors: [],
    selectedItem: null,
    selectedActionItem: null,
    hoveredAction: null,
    left: true,
    right: true,
    selectedElement: {},
    selectedAction: {},
    barStyle: {
      borderRadius: '1rem',
      width: '8px',
      backgroundColor: '#9e9e9e'
    },
    thumbStyle: {
      borderRadius: '1rem',
      width: '8px',
      backgroundColor: '#757575'
    },
    form: {
      title: '',
      name: '',
      description: '',
      isAddable: true,
      isUpdatable: true,
      isDeletable: true,
      isActive: true
    },
    layout: [],
    elements: [],
    actions: [],
    customActions: [],
    defaultActions: [
      {title: 'ثبت', name: 'delete', color: 'cyan', typeLookup: 1, script: '', isActive: true},
      {title: 'انصراف', name: 'cancel', color: 'pink', typeLookup: 1, script: '', isActive: true}
    ],
    presetActions: [
      {title: 'دانلود', name: 'download', colorHex: '#16a34a', typeLookup: 1, script: '', isActive: true},
      {title: 'چاپ', name: 'print', colorHex: '#3b82f6', typeLookup: 1, script: '', isActive: true}
    ],
    actionTypes: [
      {label: 'دیتابیس', value: 1},
      {label: 'کلاینت', value: 2}
    ]
  }),
  computed: {
    id() {
      return +this.$route.query.id
    },
    elementTypes() {
      const element = this.elements.find(element => element.id === this.selectedElement?.formProperty?.elementId)
      return element ? element.acceptableTypes.split(',') : []
    },
    availablePresetActions() {
      return this.presetActions.filter(action => this.actions.findIndex(item => item.name === action.name) < 0)
    }
  },
  methods: {
    refreshSelectedElement() {
      this.selectedElement = {...this.selectedElement}
    },
    validateForm() {
      this.hasError = false;
      this.errors = []
      if (!this.form.title?.trim()) {
        this.hasError = true;
        this.errors.push(`عنوان فرم به درستی مشخص نشده است`)
      }
      if (!this.form.name?.trim()) {
        this.hasError = true;
        this.errors.push(`نام انگلیسی فرم به درستی مشخص نشده است`)
      }
      let properties = this.layout.map(item => item.formProperty)
      properties.forEach((prop, index) => {
        if (!prop.title?.trim()) {
          this.hasError = true;
          this.errors.push(`${'عنوان فیلد شماره'} ${index + 1} ${'به درستی وارد نشده است'}`)
          prop.hasError = true;
        }
        if (!prop.name?.trim()) {
          this.hasError = true;
          this.errors.push(`${'نام انگلیسی فیلد شماره'} ${index + 1} ${'به درستی وارد نشده است'}`)
          prop.hasError = true;
        }
        if (!prop.type?.trim()) {
          this.hasError = true;
          this.errors.push(`${'نوع فیلد شماره'} ${index + 1} ${'به درستی وارد نشده است'}`)
          prop.hasError = true;
        }
      })

      this.layout = [...this.layout]
      console.log(this.errors, this.layout)
      return !this.hasError
    },
    async submitForm() {
      if (!this.validateForm()) return
      let data = Object.assign({}, this.form, {
        id: this.id || 0,
        layout: JSON.stringify(this.layout?.map(item => ({
          x: item.x,
          y: item.y,
          w: item.w,
          i: item.i,
          h: item.h
        })) || {}),
        items: this.layout.map(item => item.formProperty),
        actionItems: [...this.actions, ...this.customActions]
      })
      const res = await this.$axios.post(`${process.env.API_URL}/flow/form/upsert`, data)
      if (this.id === 0) {
        await this.$router.replace({
          path: this.$route.fullPath,
          query: {
            id: res.data.result
          }
        })
      }
      await this.loadFormInfo()
      if (process.env.FLOW_STANDALONE) await this.$store.dispatch('loadForms')
    },
    async loadFormInfo() {
      let res = await this.$axios.get(`${process.env.API_URL}/flow/form/info`, {
        params: {
          formId: this.id
        }
      })
      let formData = res.data.result
      this.form.title = formData.title
      this.form.name = formData.name
      this.form.description = formData.description
      this.layout = JSON.parse(formData.layout)
      this.form.isAddable = formData.isAddable
      this.form.isUpdatable = formData.isUpdatable
      this.form.isDeletable = formData.isDeletable
      this.form.isActive = formData.isActive
      formData.formProperties.forEach(property => {
        this.layout.find(item => item.i == property.layoutIndex).formProperty = property
      })
      this.actions = this.mapActions(formData.formActions?.filter(action => action.name !== 'custom'))
      this.customActions = this.mapActions(formData.formActions?.filter(action => action.name === 'custom'))
    },
    async loadElements() {
      const res = await this.$axios.get(`${process.env.API_URL}/flow/element/list`)
      this.elements = res.data.result
    },
    addElement(element) {
      let y = this.layout.length > 0 ? Math.max(...this.layout.map(x => x.y)) : 0
      let rowWidth = this.layout.filter(x => x.y === y).map(x => x.w).reduce((a, b) => a + b, 0)
      let x = rowWidth % 12
      if (rowWidth > 9) {
        y++
        x = 0
      }
      let index = this.layout.length > 0 ? Math.max(...this.layout.map(item => parseInt(item.i))) + 1 : 0
      this.layout.push({
        x,
        y,
        w: 3,
        h: 1,
        i: index,
        formProperty: {
          layoutIndex: index,
          elementId: element.id,
          title: element.title,
          type: '',
          defaultValue: '',
          cssStyle: '',
          hint: '',
          placeHolder: '',
          rules: '',
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
          isActive: true
        }
      })
      this.selectItem(this.layout[this.layout.length - 1])
    },
    addPresetAction(action) {
      this.$refs.actionsDialog.hide()
      this.actions.push(action)
    },
    addCustomAction() {
      this.$refs.actionsDialog.hide()
      this.customActions.push({
        title: 'شخصی سازی شده',
        name: 'custom',
        colorHex: '#0ea5e9',
        typeLookup: 1,
        script: '',
        isActive: true
      })
    },
    removeElement() {
      let index = this.layout.findIndex(item => item.i === this.selectedItem)
      this.selectedItem = null
      this.layout.splice(index, 1)
      this.rearrangeLayout(false)
    },
    removePresetAction(index) {
      this.actions.splice(index, 1)
      this.hoveredAction = null
    },
    removeCustomAction() {
      this.selectedActionItem = null
      this.customActions.splice(this.selectedActionItem, 1)
    },
    selectItem(element) {
      if (element.i == this.selectedItem) {
        this.selectedItem = null
        this.selectedElement = {}
      } else {
        this.selectedItem = null
        setTimeout(() => {
          this.selectedActionItem = null
          this.selectedItem = element.i
          this.selectedElement = this.layout.find(item => item.i == this.selectedItem)
        }, 50)
      }

    },
    selectAction(action, index) {
      if (index === this.selectedActionItem) {
        this.selectedActionItem = null
        this.selectedAction = {}
      } else {
        if (this.selectedItem != null) this.selectedItem = null
        this.selectedActionItem = index
        this.selectedAction = this.customActions[index]
      }
    },
    getElementComponent(element) {
      if (element && this.elements) return this.elements.find(item => element.formProperty.elementId === item.id)?.componentName
    },
    getElementIcon() {
      return this.elements.find(element => element.id === this.layout.find(item => item.i === this.selectedItem)?.formProperty.elementId)?.icon
    },
    rearrangeLayout(event) {
      this.layout.sort((a, b) => {
        if (a.y < b.y) return -1
        if (a.y > b.y) return 1
        return a.x - b.x
      })
      if (event !== false) this.layout.find(item => item.i === this.selectedItem).w = +event
      let x = 0
      let y = 0
      this.layout.forEach(item => {
        if ((x + item.w) > 12) {
          x = 0
          y++
        }
        item.x = x
        item.y = y
        x = item.w + x
      })
    },
    refreshLayout() {
      this.layout = [...this.layout]
    },
    mapActions(actions) {
      if (actions)
        return actions.map(action => ({
          id: action.id,
          name: action.name,
          title: action.title,
          colorHex: `#${action.colorHex}`,
          formId: action.formId,
          typeLookup: action.typeLookup,
          script: action.script,
          isActive: action.isActive
        }))
      else return []
    }
  },
  async mounted() {
    if (this.id > 0 && !this.$store.state.forms?.length) await this.$store.dispatch('loadForms')
    if (this.id > 0) await this.loadFormInfo()
    await this.loadElements()
  }
}
</script>

<style lang="scss" scoped>
.border-medium-cyan {
  border: 2px solid $cyan;
}

.border-medium {
  border: 2px solid;
}

.element {
  transition: 0.2s;
  border: 2px solid $grey-2;
  user-select: none;
  box-sizing: border-box !important;

  .icon {
    transition: 0.2s;
    background-color: white;
    color: $cyan;
  }

  .add {
    transition: 0.2s;
    opacity: 0;
  }
}

.element:hover {
  transition: 0.2s;
  border: 2px solid $cyan;
  user-select: none;

  .icon {
    transition: 0.2s;
    background-color: $cyan;
    color: white;
  }

  .add {
    transition: 0.2s;
    opacity: 1;
  }
}

.grid-item {
  transition: 0.2s;
  border-radius: 0.4rem;
  border: 4px solid transparent;
}

.grid-item-selected {
  transition: 0.2s;
  border-radius: 0.4rem;
  border: 4px solid transparent;
  outline: 2px solid $primary;
}

.grid-item-error {
  transition: 0.2s;
  border-radius: 0.4rem;
  border: 4px solid transparent;
  outline: 2px solid $pink;
}

.text-primary-hover {
  transition: 0.2s;
}

.text-primary-hover:hover {
  transition: 0.2s;
  color: $primary;
}
</style>

