<template>
  <div class="row">
  <q-btn flat dense class="row items-center" :loading="isLoading" to="/service/Tenant/TenantTransaction">
    <small class="text-black text-bold q-pr-sm">
      اعتبار:
    </small>
    <div :class="['text-bold q-pr-xs',hasCredit?'text-positive':'text-negative']" style="direction: ltr">
      {{ credit && credit.balance && credit.balance.toFixed(0).toNumber() }}
    </div>
    <div :class="hasCredit?'text-positive':'text-negative'">ريال</div>
    <q-tooltip>
      <div class="row" style="max-width: 130px">
        <div class="row justify-between col-12">
          <div> هزینه ها:</div>
          <div>{{ credit.totalExpenses.toMoney() }}</div>
        </div>
        <div class="row justify-between col-12">
          <div> پرداخت ها:</div>
          <div>{{ credit.totalIncome.toMoney() }}</div>

        </div>
      </div>
    </q-tooltip>
  </q-btn>
    <q-btn
      :class="['q-px-sm q-mx-sm border-radius text-white', hasCredit ? 'bg-green-13' : 'bg-red-13']"
      label="افزایش اعتبار" flat dense to="/pricing" padding="0 10px"/>
  </div>
</template>

<script>
export default {
  name: "TenantMenu",
  data: () => ({
    isLoading: false,
    credit: {
      balance: 0,
      totalExpenses: 0,
      totalIncome: 0
    }
  }),
  computed: {
    hasCredit() {
      return this.credit && this.credit.balance && this.credit.balance > 0
    }
  },
  methods: {
    async loadTenantTransactionSummary() {
      this.isLoading = true
      const res = await this.$axios.get(`${process.env.API_URL}/tenant/transaction/transactionSummary`)
      this.credit = res.data.result
      this.isLoading = false
    },
  },
  async mounted() {
    await this.loadTenantTransactionSummary()
  }
}
</script>

<style scoped>

</style>

