<template>
  <div class="row full-width bg-grey-2 border-radius q-pa-md">

    <!-- header -->
    <div class="row full-width q-mb-md q-col-gutter-md items-center">

      <!-- supply origin -->
      <div class="row col-3 q-pl-none items-center">

        <!-- title -->
        <div class="q-mr-md text-subtitle2 text-weight-regular text-black">
          محل تامین:
        </div>

        <!-- options -->
        <div class="row">

          <!-- edit -->
          <div v-if="edit" class="q-gutter-x-md">
            <q-radio :disable="!!type.isCash" v-for="option of supplyOriginOptions" v-model="detailItem.isDonation"
                     :val="option.value"
                     :label="option.label" :key="JSON.stringify(option)"/>
          </div>

          <!-- view -->
          <div v-else class="text-subtitle2 text-black">
            {{ backupData && backupData.isDonation ? 'اهدایی' : 'پویش' }}
          </div>

        </div>

      </div>

      <!-- total quantity (view mode) -->
      <div v-if="!edit" class="col-2">
        <div class="row full-width items-center">

          <!-- title -->
          <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
            تعداد کل:
          </div>

          <!-- total quantity -->
          <div class="col q-pl-md text-subtitle2 text-black">
            {{ backupData && (backupData.totalQuantity || 'تعیین نشده') }}
          </div>

        </div>
      </div>

      <!-- assigned quantity -->
      <div class="col-2">
        <div class="row full-width items-center">

          <!-- title -->
          <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
            تخصیص داده‌ شده:
          </div>

          <!-- assigned quantity -->
          <div class="col q-pl-md text-subtitle2 text-black">
            {{ backupData && (backupData.assignedQuantity || 0) }}
          </div>

        </div>
      </div>

      <!-- remaining quantity -->
      <div v-if="backupData && backupData.totalQuantity > 0 && backupData.assignedQuantity > 0 && !type.isCash" class="col">
        <div class="row full-width items-center">

          <!-- title -->
          <div v-if="remainingItemsCount >= 0" class="col-auto q-pr-md text-subtitle2 text-weight-regular text-grey-9">
            تعداد باقی‌‌مانده:
          </div>

          <!-- remaining quantity -->
          <div
            :class="['col-auto text-subtitle2', remainingItemsCount >= 0 ? 'text-black' : 'border-radius bg-red-13 q-px-sm text-white']">
            {{
              backupData && (remainingItemsCount >= 0 ? remainingItemsCount : 'تعداد تخصیص بیشتر از تعداد کل می‌باشد!')
            }}
          </div>

        </div>
      </div>

      <!-- gotta fill that empty space somehow... -->
      <q-space/>

      <!-- controls -->
      <div v-if="!isConfirmed" class="row col-auto q-gutter-x-sm items-center">

        <!-- save, edit -->
        <div>

          <!-- save -->
          <q-btn v-if="edit" class="rounded-borders" size="12px" color="cyan-2" text-color="cyan-7" icon="check"
                 unelevated dense @click="save"/>

          <!-- edit -->
          <q-btn v-else class="rounded-borders" size="12px" color="cyan-2" text-color="cyan-7" icon="edit" unelevated
                 dense @click="editItem"/>

        </div>

        <!-- cancel, delete -->
        <div>

          <!-- cancel -->
          <q-btn v-if="edit" class="rounded-borders" size="12px" color="pink-2" text-color="pink-7" icon="close"
                 unelevated dense @click="cancelEdit"/>

          <!-- delete -->
          <q-btn v-else class="rounded-borders" size="12px" color="pink-2" text-color="pink-7" icon="delete" unelevated
                 dense @click="deleteItem"/>

        </div>

      </div>

    </div>

    <!-- inputs / saved data -->
    <div class="full-width">
      <div class="row full-width q-col-gutter-md">

        <!-- project / donation -->
        <div class="col-3 q-pl-none">

          <!-- project -->
          <div v-if="detailItem.isDonation === 0">

            <!-- edit -->
            <s-auto-complete v-if="edit" v-model="detailItem.projectId" bg-color="white"
                             :url="`${baseUrl}/charity/project`"
                             label="پویش" outlined dense @input="validate"
                             @inputItem="detailItem.projectTitle = $event.label"/>

            <!-- view -->
            <div v-else class="row full-width items-center">

              <!-- title -->
              <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
                پویش:
              </div>

              <!-- project title -->
              <div class="col q-pl-md text-subtitle2 text-black">
                {{ backupData && backupData.projectTitle }}
              </div>

            </div>

          </div>

          <!-- donation -->
          <div v-else>

            <!-- edit -->
            <s-auto-complete v-if="edit" v-model="detailItem.donationId" bg-color="white"
                             :url="`${baseUrl}/charity/donation`"
                             label="اهدایی" outlined dense @input="validate"
                             @inputItem="detailItem.donationTitle = $event.label; loadDonationProducts()"/>

            <!-- view -->
            <div v-else class="row full-width items-center">

              <!-- title -->
              <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
                اهدایی:
              </div>

              <!-- donation title -->
              <div class="col q-pl-md text-subtitle2 text-black">
                {{ backupData && backupData.donationTitle }}
              </div>

            </div>

          </div>

        </div>

        <!-- product -->
        <div class="col-2" v-if="type.isNonCash">

          <!-- edit -->
          <s-auto-complete v-if="edit && type.isNonCash" v-model="detailItem.productId" bg-color="white"
                           :url="detailItem.isDonation ? undefined : `${baseUrl}/inventory/product`"
                           :options="detailItem.isDonation ? donationProducts : undefined" label="کالا/خدمات" outlined dense
                           @input="validate"
                           @inputItem="detailItem.productTitle = $event.label; detailItem.isDonation ? setItemQuantityAndPrice($event) : undefined"/>

          <!-- view -->
          <div v-else-if="type.isNonCash" class="row full-width items-center">

            <!-- title -->
            <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
              کالا:
            </div>

            <!-- product title -->
            <div class="col q-pl-md text-subtitle2 text-black">
              {{ backupData && backupData.productTitle }}
            </div>

          </div>

        </div>

        <!-- total quantity (edit mode), quantity, unit price -->
        <div class="col-4">
          <div class="row q-col-gutter-md">

            <!-- total quantity (edit mode) -->
            <div v-if="edit" class="col-3">
              <q-input v-model="detailItem.totalQuantity" bg-color="white" type="number" label="تعداد کل"
                       :disable="!!detailItem.isDonation" outlined dense
                       @input="validate"/>
            </div>

            <!-- quantity -->
            <div v-if="type.isNonCash" :class="edit ? 'col-3' : 'col'">

              <!-- edit -->
              <q-input v-if="edit && type.isNonCash" v-model="detailItem.quantity" bg-color="white" type="number" label="تعداد"
                       outlined
                       dense
                       @input="validate"/>

              <!-- view -->
              <div v-else-if="type.isNonCash" class="row full-width items-center">

                <!-- title -->
                <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
                  تعداد:
                </div>

                <!-- quantity -->
                <div class="col q-pl-md text-subtitle2 text-black">
                  {{ backupData && backupData.quantity }}
                </div>

              </div>

            </div>

            <!-- unit price -->
            <div class="col">

              <!-- edit -->
              <s-input-money v-if="edit" v-model="detailItem.unitPrice" bg-color="white"
                             :label="type.isCash? 'مبلغ پرداختی': 'قیمت واحد'" outlined
                             :disable="!!detailItem.isDonation" dense
                             @input="validate"/>

              <!-- view -->
              <div v-else class="row full-width items-center">

                <!-- title -->
                <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
                  {{ type.isCash ? 'مبلغ پرداختی' : 'قیمت واحد' }}:
                </div>

                <!-- unit price -->
                <div class="col q-pl-md text-subtitle2 text-black">
                  {{ backupData && backupData.unitPrice && backupData.unitPrice.toMoney() }}
                </div>

              </div>

            </div>

          </div>
        </div>

        <!-- description -->
        <div class="col-3">

          <!-- edit -->
          <q-input v-if="edit" v-model="detailItem.description" bg-color="white"
                   :label="type.isService?'عنوان خدمت':type.isCash?'بابت':'توضیحات'" outlined dense/>

          <!-- view -->
          <div v-else class="row full-width items-center">

            <!-- title -->
            <div class="col-auto text-subtitle2 text-weight-regular text-grey-9">
              {{ type.isService ? 'عنوان خدمت' : type.isCash ? 'بابت' : 'توضیحات' }}:
            </div>

            <!-- description -->
            <div class="col q-pl-md text-subtitle2 text-black">
              {{ backupData && backupData.description }}
            </div>

          </div>

        </div>

      </div>
    </div>

    <!-- validation errors -->
    <div v-if="edit && validation && hasErrors"
         class="animated fadeInDown row full-width rounded-borders bg-red-1 q-pa-sm items-start">

      <!-- icon -->
      <q-icon class="col-auto" name="privacy_tip" size="sm" color="red-13"/>

      <!-- error -->
      <div class="col q-pl-sm text-subtitle2 text-weight-regular text-red-13">
        {{ error }}
      </div>

    </div>

  </div>
</template>

<script>
import SAutoComplete from "../shared/SAutoComplete";
import SInputMoney from "../shared/SInputMoney";

export default {
  name: "SupportPackDetailItem",
  components: {SAutoComplete, SInputMoney},
  props: {
    value: Object | null,
    isConfirmed: {
      type: Boolean | null,
      default: false
    },
    typeLookup: Number | null
  },
  data: () => ({
    baseUrl: process.env.API_URL,
    detailItem: null,
    backupData: null,
    error: null,
    edit: false,
    validation: false,
    hasErrors: false,
    supplyOriginOptions: [
      {label: 'پویش', value: 0},
      {label: 'اهدایی', value: 1}
    ],
    donationProducts: []
  }),
  computed: {
    remainingItemsCount() {
      return this.backupData.totalQuantity - this.backupData.assignedQuantity
    },
    type() {
      return {
        isNonCash: this.typeLookup === 1 || this.typeLookup == null || this.typeLookup === 0,
        isService: this.typeLookup === 2,
        isCash: this.typeLookup === 3
      }
    }
  },
  methods: {
    async validate() {
      this.detailItem = Object.assign({}, this.detailItem)
      this.hasErrors = false
      let errors = []

      // project / donation
      if (this.detailItem.isDonation === 0) {
        if (!this.detailItem.projectId) {
          this.hasErrors = true
          errors.push('پویش')
        }
      } else {
        if (!this.detailItem.donationId) {
          this.hasErrors = true
          errors.push('اهدایی')
        }
      }

      // product
      if (!this.detailItem.productId && this.type.isNonCash) {
        this.hasErrors = true
        errors.push('کالا/خدمات')
      }

      // total quantity
      // if (!this.detailItem.totalQuantity || !(this.detailItem.totalQuantity > 0)) {
      //   this.hasErrors = true
      //   errors.push('تعداد کل')
      // }

      // quantity
      if (!this.detailItem.quantity || !(this.detailItem.quantity > 0)) {
        this.hasErrors = true
        errors.push('تعداد')
      }

      // unit price
      if (!this.detailItem.unitPrice || this.detailItem.unitPrice < 1) {
        this.hasErrors = true
        errors.push(this.type.isCash ? 'مبلغ پرداختی' : 'قیمت واحد')
      }

      switch (errors.length) {
        case 1 :
          this.error = errors[0]
          break;
        case 2:
          this.error = errors.join(' و ')
          break;
        default:
          this.error = errors.slice(0, errors.length - 1).join('، ') + ' و ' + errors[errors.length - 1]
      }

      this.error += ' به درستی وارد نشده است.'
    },
    async save() {
      await this.validate()
      if (!this.hasErrors) {
        this.$emit('input', this.detailItem)
        this.backupData = this.detailItem && JSON.parse(JSON.stringify(this.detailItem)) || {}
        this.edit = false
      } else {
        this.validation = true
      }
    },
    cancelEdit() {
      this.edit = false
    },
    editItem() {
      //this.$emit('input', this.backupData)
      this.edit = true
    },
    deleteItem() {
      this.$emit('delete', this.backupData)
    },
    clearData() {
      if (this.detailItem.isDonation) this.detailItem.projectId = null
      else this.detailItem.donationId = null

      this.detailItem.productId = null
    },
    async loadDonationProducts() {
      const res = await this.$axios.get(`${process.env.API_URL}/charity/donationDetail/products`, {
        params: {
          donationId: this.detailItem.donationId
        }
      })
      this.donationProducts = res.data.result.map(x => ({
        label: x.productTitle,
        value: x.productId,
        unitPrice: x.unitPrice,
        remainingCount: x.remainingCount
      }))
    },
    setItemQuantityAndPrice(event) {
      this.detailItem.totalQuantity = event.remainingCount || 0
      this.detailItem.unitPrice = event.unitPrice
    }
  },
  beforeMount() {
    this.detailItem = this.value && JSON.parse(JSON.stringify(this.value)) || {}
  },
  mounted() {
    this.backupData = this.detailItem && JSON.parse(JSON.stringify(this.detailItem)) || {}
    if (!(this.detailItem.id > 0)) {
      this.edit = true
    }
  }
}
</script>

