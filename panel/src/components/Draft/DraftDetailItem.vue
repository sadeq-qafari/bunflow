<template>
  <transition appear enter-active-class="animated fadeInDown">
    <div class="column full-width border-radius bg-grey-2 overflow-hidden">

      <!-- header -->
      <div class="row full-width bg-blue-grey-1 q-pa-sm justify-between items-center">

        <!-- type -->
        <div class="row items-center">

          <!-- icon -->
          <q-icon :name="icon" size="sm" color="orange"/>

          <!-- title -->
          <div class="q-ml-sm text-subtitle2 text-grey-9">
            {{ detailItem.typeLookupTitle }}
          </div>

        </div>

        <!-- controls -->
        <div class="row items-center">

          <!-- save, edit -->
          <div class="col-auto q-mr-xs">

            <!-- save -->
            <q-btn v-if="edit" class="border-radius" size="12px" color="cyan-2"
                   text-color="cyan-7" icon="check" unelevated dense @click="save()"/>

            <!-- edit -->
            <q-btn v-else class="border-radius" size="12px" color="cyan-2" text-color="cyan-7" icon="edit"
                   unelevated
                   dense @click="editItem"/>

          </div>

          <!-- cancel, delete -->
          <div class="col-auto">

            <!-- cancel -->
            <q-btn v-if="edit" class="border-radius" size="12px" color="pink-2"
                   text-color="pink-7" icon="close" unelevated dense @click="cancelEdit()"/>

            <!-- delete -->
            <q-btn v-else class="border-radius" size="12px" color="pink-2" text-color="pink-7" icon="delete"
                   unelevated
                   dense @click="deleteItem()"/>

          </div>

        </div>

      </div>

      <q-separator/>

      <!-- body -->
      <div class="row full-width q-py-md q-gutter-y-md items-center">

        <!-- sub account -->
        <div class="row col-6 q-px-md items-center">

          <!-- title -->
          <div class="col-3 q-pr-md text-subtitle2 text-weight-regular text-black">
            معین:
          </div>

          <!-- sub account -->
          <div class="col-9">

            <!-- edit -->
            <div v-if="edit" class="border-radius border-medium bg-white q-px-md hover-border-color">
              <s-auto-complete class="full-width" v-model="detailItem.subAccountId"
                               :url="`${baseUrl}/Accounting/subAccount`" :filters="subAccountFilters" :outlined="false"
                               :borderless="true"
                               dense @inputItem="detailItem.subAccountTitle = $event.label" @input="validate"/>
            </div>

            <!-- view -->
            <div v-else class="text-subtitle2 text-bold text-black">
              {{ backupData && backupData.subAccountTitle }}
            </div>

          </div>

        </div>

        <!-- detailed account -->
        <div class="row col-6 q-px-md items-center">

          <!-- title -->
          <div class="col-3 q-pr-md text-subtitle2 text-weight-regular text-black">
            تفصیلی:
          </div>

          <!-- detailed account -->
          <div class="col-9">

            <!-- edit -->
            <div v-if="edit" class="border-radius border-medium bg-white q-px-md hover-border-color">
              <s-auto-complete class="full-width" v-model="detailItem.detailedAccountId"
                               :url="`${baseUrl}/Accounting/detailedAccount`" :outlined="false"
                               :borderless="true"
                               dense @inputItem="detailItem.detailedAccountTitle = $event.label" @input="validate"/>
            </div>

            <!-- view -->
            <div v-else class="text-subtitle2 text-bold text-black">
              {{ backupData && backupData.detailedAccountTitle }}
            </div>

          </div>

        </div>

        <!-- amount -->
        <div class="row col-6 q-px-md items-center">

          <!-- title -->
          <div class="col-3 q-pr-md text-subtitle2 text-weight-regular text-black">
            مبلغ:
          </div>

          <!-- amount -->
          <div class="col-9">

            <!-- edit -->
            <div v-if="edit" class="border-radius border-medium bg-white q-px-md hover-border-color">
              <s-input-money class="full-width" v-model="detailItem.amount" :bottom-slots="false"
                             borderless dense @input="validate"/>
            </div>

            <!-- view -->
            <div v-else class="text-subtitle2 text-bold text-black">
              {{ backupData && backupData.amount && backupData.amount.toMoney() }}
            </div>

          </div>

        </div>

        <!-- commission -->
        <div v-if="detailItem.typeLookup === 1" class="row col-6 q-px-md items-center">

          <!-- title -->
          <div class="col-3 q-pr-md text-subtitle2 text-weight-regular text-black">
            کارمزد:
          </div>

          <!-- commission -->
          <div class="col-9">

            <!-- edit -->
            <div v-if="edit" class="border-radius border-medium bg-white q-px-md hover-border-color">
              <s-input-money class="full-width" v-model="detailItem.commission" :bottom-slots="false" borderless dense/>
            </div>

            <!-- view -->
            <div v-else class="text-subtitle2 text-bold text-black">
              {{ backupData && backupData.commission && backupData.commission.toMoney() }}
            </div>

          </div>

        </div>

        <!-- description -->
        <div class="row col-6 q-px-md items-center">

          <!-- title -->
          <div class="col-3 q-pr-md text-subtitle2 text-weight-regular text-black">
            شرح:
          </div>

          <!-- description -->
          <div class="col-9">

            <!-- edit -->
            <div v-if="edit" class="border-radius border-medium bg-white q-px-md hover-border-color">
              <q-input class="full-width" v-model="detailItem.description" borderless dense/>
            </div>

            <!-- view -->
            <div v-else class="text-subtitle2 text-bold text-black">
              {{ backupData && backupData.description }}
            </div>

          </div>

        </div>

        <!-- validation errors -->
        <div v-if="edit && validation && hasErrors" class="row col-12 q-px-md">
          <transition
            appear
            enter-active-class="animated fadeInDown"
          >
            <div class="row full-width border-radius bg-red-1 q-pa-sm items-start">

              <!-- icon -->
              <q-icon class="col-auto" name="privacy_tip" size="sm" color="red-13"/>

              <!-- error -->
              <div class="col q-pl-sm text-subtitle2 text-weight-regular text-red-13">
                {{ error }}
              </div>

            </div>
          </transition>
        </div>

      </div>

    </div>
  </transition>
</template>

<script>
import SAutoComplete from "../shared/SAutoComplete";
import SInputMoney from "../shared/SInputMoney";

export default {
  name: "DraftDetailItem",
  components: {SAutoComplete, SInputMoney},
  props: {
    value: Object | null,
    generalAccountGroupId: Object | null
  },
  data: () => ({
    baseUrl: process.env.API_URL,
    backupData: null,
    detailItem: null,
    error: null,
    edit: false,
    validation: false,
    hasErrors: false
  }),
  computed: {
    icon() {
      switch (this.detailItem.typeLookup) {
        case 1:
          return 'account_balance'
        case 2:
          return 'perm_identity'
        case 3:
          return 'account_balance_wallet'
        case 4:
          return 'account_box'
        case 5:
          return 'payment'
      }
    },
    // generalAccountId() {
    //   if (this.detailItem.isCredit === true && this.detailItem.typeLookup === 5)
    //     switch (this.detailItem.typeLookup) {
    //       case 1:
    //         return ''
    //       case 2:
    //         return ''
    //       case 3:
    //         return ''
    //       case 4:
    //         return ''
    //       case 5:
    //         return ''
    //     }
    //   else return null
    // },
    subAccountFilters() {
      return this.generalAccountGroupId > 0 ? [{
        name: 'generalAccountGroupId',
        value: this.generalAccountGroupId
      }] : undefined
    }
  },
  methods: {
    editItem() {
      this.validation = false
      this.$emit('input', this.backupData)
      this.edit = true
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
    async validate() {
      this.hasErrors = false
      let errors = []

      // sub account
      if (!this.detailItem.subAccountId) {
        this.hasErrors = true
        errors.push('معین')
      }

      // detailed account
      if (!this.detailItem.detailedAccountId) {
        this.hasErrors = true
        errors.push('تفصیلی')
      }

      // amount
      if (!(this.detailItem.amount > 0)) {
        this.hasErrors = true
        errors.push('مبلغ')
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
    cancelEdit() {
      this.edit = false
    },
    deleteItem() {
      this.$emit('delete')
    },
  },
  beforeMount() {
    this.detailItem = this.value && JSON.parse(JSON.stringify(this.value)) || {}
  },
  mounted() {
    this.backupData = this.detailItem && JSON.parse(JSON.stringify(this.detailItem)) || {}
    if (!(this.detailItem.id > 0)) this.edit = true
  }
}
</script>

<style scoped>
.border-radius {
  border-radius: 10px;
}

.border-medium {
  border: 2px solid;
}

.hover-border-color {
  border-color: #E0E0E0;
  transition: 0.3s;
}

.hover-border-color:hover {
  border-color: #40c4ff;
  transition: 0.3s;
}

.hover-border-color:focus-within {
  border-color: #40c4ff;
  transition: 0.3s;
}
</style>

