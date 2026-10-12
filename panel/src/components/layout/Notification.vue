﻿<template>
  <q-btn dense flat round icon="o_notifications" class="q-pa-xs">
<!--    <q-badge color="red" v-if="notificationCount>0" floating>{{notificationCount}}</q-badge>-->
    <q-menu  anchor="bottom middle" self="top middle">
      <div class="q-pa-md">بدون پیام جدید</div>
<!--      <q-item clickable v-ripple>-->
<!--        <q-item-section side>-->
<!--          <q-avatar size="48px" color="orange">-->
<!--            H-->
<!--          </q-avatar>-->
<!--        </q-item-section>-->
<!--        <q-item-section>-->
<!--          <q-item-label>پیام جدید</q-item-label>-->
<!--          <q-item-label caption>محمد پهلوان</q-item-label>-->
<!--        </q-item-section>-->
<!--        <q-item-section side>-->
<!--          12:45-->
<!--        </q-item-section>-->
<!--      </q-item>-->
    </q-menu>
  </q-btn>
</template>

<script>
  export default {
    name: 'Notification',
    data:()=>({
      notificationCount:1
    })
  }
</script>

<style scoped>

</style>

