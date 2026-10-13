<template>
  <q-card bordered class="border-radius q-my-md no-shadow">
    <q-card-section>
      <div class="text-h6">موقعیت فعلی</div>
    </q-card-section>

    <q-separator/>

    <q-card-section class="q-pa-none">
      <!-- Current Location of user -->
      <Map :latitude="mapPosition.latitude" :zoom-control="false" style="height: 300px !important;"
           :attribution="`<span style='font-family:IRANSans !important'>نقشه</span>`"
           class="mapField"
           :longitude="mapPosition.longitude" :accuracy="mapPosition.accuracy" :zoom="14"></Map>
    </q-card-section>
  </q-card>
</template>

<script>
import Map from "../shared/Map";

export default {
  name: "TourManagementMap",
  data() {
    return {
      mapPosition: {
        latitude: 0,
        longitude: 0,
        accuracy: 0
      }
    }
  },
  components: {Map},
  // === Send request for grabbing location of user
  mounted() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition, positionError => {
        console.log(positionError)
      });
    }
  },
  methods: {
    // === if location is not null fills the data and displays user location
    showPosition(position) {
      if (position) {
        this.mapPosition.latitude = position.coords.latitude;
        this.mapPosition.longitude = position.coords.longitude;
        this.mapPosition.accuracy = position.coords.accuracy;
      }
    }
  }
}
</script>

<style scoped>

</style>

