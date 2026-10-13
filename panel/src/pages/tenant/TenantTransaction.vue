<template>
  <div class="q-pa-md">
    <div class="full-width">
      <div class="column full-width q-mt-none q-pt-md q-gutter-y-md">

        <!-- overall info -->
        <div class="row full-width border-radius bg-white q-pr-md q-pb-md q-col-gutter-md">

          <!-- account balance -->
          <div class="col-12 col-md">
            <div
              :class="['row border-radius q-pa-md items-stretch', summary.balance >= 0 ? 'gradient-green' : 'gradient-red']">

              <!-- icon -->
              <div class="col-auto">
                <q-icon name="account_balance_wallet" size="60px" :color="summary.balance >= 0 ? 'green-2' : 'red-2'"/>
              </div>

              <!-- increase balance -->
              <div class="column col-4 q-px-md justify-center">

                <!-- button -->
                <q-btn
                  :class="['full-width border-radius text-white', summary.balance >= 0 ? 'bg-green-13' : 'bg-red-13']"
                  :label="isMobile ? 'افزایش' : 'افزایش اعتبار'" flat dense to="/pricing"/>

                <!-- dialog -->
                <q-dialog ref="balanceDialog" :maximized="isMobile">
                  <div :class="['border-radius bg-white', isMobile ? undefined : 'dialog']">
                    <div class="column full-width full-height justify-between">

                      <!-- header -->
                      <div class="row full-width col-auto q-pa-md justify-between items-center">

                        <!-- title -->
                        <div class="text-subtitle1 text-weight-regular text-black">
                          افزایش اعتبار
                        </div>

                        <!-- icon -->
                        <q-icon name="account_balance_wallet" size="sm" color="light-blue"/>

                      </div>

                      <q-separator/>

                      <!-- body -->
                      <div
                        :class="['column col q-px-md q-py-md justify-center', isMobile ? 'q-gutter-y-md' : undefined]">

                        <!-- image -->
                        <div v-if="isMobile" class="row full-width col q-pa-md justify-center">
                          <q-img src="img/wallet.png" width="100%" height="100%" contain/>
                        </div>

                        <!-- info -->
                        <div class="row full-width justify-center items-center">
                          <div class="text-subtitle1 text-weight-regular text-grey-8">
                            مبلغ مورد نظر را وارد و یا انتخاب کنید
                          </div>
                        </div>

                        <!-- input -->
                        <s-input-money v-model="amount" :class="isMobile ? undefined : 'q-my-md'"
                                       input-class="text-h6 text-weight-regular text-center"
                                       color="light-blue" :bottom-slots="amount > 1000" outlined dense/>

                        <!-- pre-defined amounts -->
                        <div class="row q-col-gutter-x-md">
                          <div v-for="item of amounts" class="col btn-amount" @click="amount = item">
                            <div
                              :class="['column border-radius items-center', isMobile ? 'q-pa-sm' : 'q-pa-md', item === amount ? 'bg-light-blue text-white' : 'bg-grey-2 text-grey-8']">

                              <!-- number -->
                              <div class="q-mb-xs text-h6 text-weight-bolder">
                                {{ item / 10000000 }}
                              </div>

                              <!-- text -->
                              <div :class="['text-weight-regular', isMobile ? 'text-caption' : 'text-subtitle2']">
                                میلیون تومان
                              </div>

                            </div>
                          </div>
                        </div>

                      </div>

                      <q-separator/>

                      <!-- footer -->
                      <div class="row col-auto q-pa-md q-col-gutter-x-md items-center">

                        <!-- cancel -->
                        <div class="col">
                          <q-btn class="full-width border-radius" color="light-blue" label="انصراف" outline
                                 @click="$refs.balanceDialog.hide()"/>
                        </div>

                        <!-- pay -->
                        <div class="col">
                          <q-btn class="full-width border-radius" color="light-blue" label="پرداخت" unelevated/>
                        </div>

                      </div>

                    </div>
                  </div>
                </q-dialog>

              </div>

              <!-- label, value -->
              <div class="column col justify-between items-end">

                <!-- label -->
                <div class="text-subtitle1 text-weight-regular text-grey-2">
                  اعتبار حساب
                </div>

                <!-- value -->
                <div class="text-h6 text-weight-bold text-white">
                  <span class="q-ml-sm" dir="ltr">{{ summary && summary.balance && (summary.balance / 10).toFixed(0).toNumber() }}</span>
                  تومان
                </div>

              </div>

            </div>
          </div>

          <!-- total income -->
          <div class="col-12 col-md">
            <div class="row border-radius gradient-blue q-pa-md">

              <!-- icon -->
              <div class="col-auto">
                <q-icon name="shopping_cart" size="60px" color="blue-2"/>
              </div>

              <!-- label, value -->
              <div class="column col q-pl-md justify-between items-end">

                <!-- label -->
                <div class="text-subtitle1 text-weight-regular text-grey-2">
                  مجموع پرداخت
                </div>

                <!-- value -->
                <div class="text-h6 text-weight-bold text-white">
                  {{ summary && summary.totalIncome && (summary.totalIncome / 10).toFixed(0).toMoney('تومان') }}
                </div>

              </div>

            </div>
          </div>

          <!-- total expenses -->
          <div class="col-12 col-md">
            <div class="row border-radius gradient-orange q-pa-md">

              <!-- icon -->
              <div class="col-auto">
                <q-icon name="paid" size="60px" color="amber-2"/>
              </div>

              <!-- label, value -->
              <div class="column col q-pl-md justify-between items-end">

                <!-- label -->
                <div class="text-subtitle1 text-weight-regular text-grey-2">
                  مجموع هزینه
                </div>

                <!-- value -->
                <div class="text-h6 text-weight-bold text-white">
                  {{ summary && summary.totalExpenses && (summary.totalExpenses / 10).toFixed(0).toMoney('تومان') }}
                </div>

              </div>

            </div>
          </div>

        </div>

        <!-- transactions history -->
        <div :class="['full-width', isMobile ? undefined : 'border-radius bg-white q-pa-md']">

          <!-- table -->
          <s-data-grid v-if="service && model" class="full-width" :service="service" :model="model">
            <template v-slot:actions-append="props">
              <q-btn unelevated outline size="sm" round icon="o_table_view" color="primary" class="q-mx-xs"
                     @click="showTransactionInfoDialog(props.props.row)">
                <q-tooltip>نمایش جزییات</q-tooltip>
              </q-btn>
            </template>
          </s-data-grid>

          <!-- details dialog -->
          <q-dialog ref="detailsDialog">
            <div :class="['dialog-border-radius bg-white', isMobile ? 'full-width' : 'dialog']">
              <div class="column full-width full-height justify-between">

                <!-- header -->
                <div class="row full-width col-auto q-pa-md justify-between items-center">

                  <!-- title -->
                  <div class="text-subtitle1 text-weight-regular text-black">
                    جزییات تراکنش
                  </div>

                  <!-- icon -->
                  <q-icon name="info" size="sm" color="light-blue"/>

                </div>

                <q-separator/>

                <!-- body -->
                <div class="column col q-pa-md q-gutter-y-md justify-center">

                  <!-- pricing item -->
                  <div class="row full-width justify-between items-center">

                    <!-- label -->
                    <div class="text-subtitle2 text-black">
                      خدمت:
                    </div>

                    <!-- value -->
                    <div class="text-subtitle2 text-weight-regular text-grey-8">
                      {{ transaction && transaction.pricingItemTitle }}
                    </div>

                  </div>

                  <!-- cost -->
                  <div class="row full-width justify-between items-center">

                    <!-- label -->
                    <div class="text-subtitle2 text-black">
                      هزینه:
                    </div>

                    <!-- value -->
                    <div class="text-subtitle2 text-weight-regular text-grey-8">
                      {{ transaction && (transaction.cost / 10).toMoney('تومان') }}
                    </div>

                  </div>

                  <!-- discount -->
                  <div class="row full-width justify-between items-center">

                    <!-- label -->
                    <div class="text-subtitle2 text-black">
                      تخفیف:
                    </div>

                    <!-- value -->
                    <div class="text-subtitle2 text-weight-regular text-grey-8">
                      {{ transaction && (transaction.discount || 0) }}
                    </div>

                  </div>

                  <!-- final cost -->
                  <div class="row full-width justify-between items-center">

                    <!-- label -->
                    <div class="text-subtitle2 text-black">
                      هزینه نهایی:
                    </div>

                    <!-- value -->
                    <div class="text-subtitle2 text-weight-regular text-grey-8">
                      {{ transaction && (transaction.finalCost / 10).toMoney('تومان') }}
                    </div>

                  </div>

                  <!-- description -->
                  <div class="row full-width justify-between items-start">

                    <!-- label -->
                    <div class="col-auto text-subtitle2 text-black">
                      توضیحات:
                    </div>

                    <!-- value -->
                    <div class="col q-pl-md text-subtitle2 text-weight-regular text-right text-grey-8">
                      {{ transaction && transaction.description }}
                    </div>

                  </div>

                  <!-- date -->
                  <div class="row full-width justify-between items-center">

                    <!-- label -->
                    <div class="text-subtitle2 text-black">
                      تاریخ:
                    </div>

                    <!-- value -->
                    <div class="text-subtitle2 text-weight-regular text-grey-8">
                      {{
                        transaction && transaction.date && (transaction.date.toJalaliFullDate() + ' - ' + transaction.date.substring(14, 19))
                      }}
                    </div>

                  </div>

                </div>

                <q-separator/>

                <!-- footer -->
                <div class="row full-width col-auto q-pa-md justify-end">
                  <div class="col">
                    <q-btn class="full-width border-radius" color="light-blue" label="بستن" outline
                           @click="$refs.detailsDialog.hide()"/>
                  </div>
                </div>

              </div>
            </div>
          </q-dialog>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
import SInputMoney from "../../components/shared/SInputMoney";
import SDataGrid from "../../components/shared/SDataGrid";
import * as moment from 'jalali-moment'

export default {
  name: "TenantTransaction",
  components: {SInputMoney, SDataGrid},
  data: () => ({
    isLoading: false,
    amount: 10000000,
    summary: {},
    transaction: {},
    amounts: [10000000, 50000000, 100000000]
  }),
  computed: {
    service() {
      return this.$store.getters.getService('Tenant')
    },
    model() {
      return this.$store.getters.getServiceModel('Tenant', 'TenantTransaction')
    },
    isMobile() {
      return this.$q.screen.lt.md
    }
  },
  methods: {
    async loadTenantTransactionSummary() {
      this.isLoading = true
      const res = await this.$axios.get(`${process.env.API_URL}/tenant/transaction/transactionSummary`)
      this.summary = res.data.result
      this.isLoading = false
    },
    async showTransactionInfoDialog(row) {
      const res = await this.$axios.get(`${process.env.API_URL}/tenant/transaction/tenantTransactionInfo`, {
        params: {
          id: row.Id
        }
      })
      if (res.data.success) {
        this.transaction = Object.assign(res.data.result, {description: row.Description})
        this.$refs.detailsDialog.show()
      }
    }
  },
  async mounted() {
    await this.loadTenantTransactionSummary()
  }
}
</script>

<style scoped>
.btn-amount {
  user-select: none;
  cursor: pointer;
}

.dialog {
  border-radius: 1rem !important;
  width: 400px;
}

.dialog-border-radius {
  border-radius: 1rem !important;
}

.gradient-blue {
  background-color: #0093E9;
  background-image: linear-gradient(160deg, #0093E9 0%, #80D0C7 100%);
}

.gradient-green {
  background: #11998e; /* fallback for old browsers */
  background: -webkit-linear-gradient(to left, #38ef7d, #11998e); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to left, #38ef7d, #11998e); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.gradient-orange {
  background-color: #FBAB7E;
  background-image: linear-gradient(62deg, #FBAB7E 0%, #F7CE68 100%);
}

.gradient-red {
  background-color: #f87e7e;
  background-image: linear-gradient(225deg, #f87e7e 0%, #ff4b4b 74%);

}
</style>

