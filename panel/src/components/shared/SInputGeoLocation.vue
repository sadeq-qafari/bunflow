<template>
  <div class="flex row items-center justify-between bg-grey-4 rounded-borders">
    <div class="col-10">
      <Map :latitude="model && model.latitude || 0" :zoom-control="false"
           :attribution="`<span style='font-family:IRANSans !important'>${label}</span>`"
           class="mapField"
           :longitude="model && model.longitude ||0" :accuracy="0" :zoom="14"></Map>
    </div>
    <div class="col-1 q-mr-md">
      <q-btn class="q-pa-none" unelevated dense round color="white" text-color="positive" icon="o_edit_location_alt"
             @click="showMap=true"/>
    </div>
    <q-dialog class="col-0" v-model="showMap" @show="getAddress">
      <q-card :class="['map-card',isMobile?'mobile':'desktop']">
        <q-card-section>
          <q-select class="flex col-md-5"
                    dense
                    @input="setLocationFromSearch"
                    :value="locationLabel"
                    use-input
                    hide-selected
                    label="جستجو"
                    fill-input
                    input-debounce="500"
                    :options="options"
                    @filter="filterFn"
                    color="white"

                    dropdown-icon="search"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  موردی یافت نشد
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <Map @mapInput="onInputMap" :latitude="model && model.latitude || 0"
             :longitude="model && model.longitude ||0" :accuracy="0" :zoom="14"
             class="mapSection" selector></Map>

        <q-card-section>
          <q-btn
            fab-mini
            color="primary"
            icon="my_location"
            class="absolute"
            style="top: 0; right: 12px; transform: translateY(-50%); z-index: 9999"
            @click="getLocation()"
          />
          <q-btn
            fab-mini
            color="positive"
            icon="check"
            class="absolute"
            v-close-popup
            style="top: 0; left: 12px; transform: translateY(-50%); z-index: 9999"
          />
          <q-item v-if="address && address.city">
            <q-item-section avatar>
              <q-icon name="place"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ address.city }}</q-item-label>
              <q-item-label caption lines="2">{{ address.neighbourhood }} {{ address.road }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>
        <q-card-section class="flex row justify-around">
          <q-input class="col-5" outlined dense label="عرض جغرافیایی" :value="model && model.latitude"
                   @input="onInputManual($event,'latitude')"/>
          <q-input class="col-5" outlined dense label="طول جغرافیایی" :value="model && model.longitude"
                   @input="onInputManual($event,'longitude')"/>
        </q-card-section>

      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import Map from "./Map";
import {OpenStreetMapProvider} from 'leaflet-geosearch';
import {Screen} from "quasar";

export default {
  name: "SInputGeoLocation",
  components: {Map},
  props: {
    rules: Array,
    dense: Boolean,
    outlined: Boolean,
    placeholder: String,
    label: String,
    value: Object | null,
  },
  data: () => ({
    searchProvider: null,
    options: [],
    locationLabel: '',
    showMap: false,
    address: {}
  }),
  computed: {
    model() {
      if (this.value != null)
        return this.value
      else return {}
    },
    isMobile() {
      return Screen && Screen.lt && Screen.lt.md
    }
  },
  watch: {
    value(to, from) {
      if (this.model && this.model.latitude && this.model.longitude)
        this.getAddress(this.model.latitude, this.model.longitude)
    }
  },
  methods: {
    async getLocation() {
      await navigator.geolocation.getCurrentPosition(res => {
        this.$emit('input', {latitude: res.coords.latitude, longitude: res.coords.longitude})
      }, positionError => {
        this.$q.notify({
          type: 'negative',
          message: 'خطا در دریافت موقعیت'
        })
      })
    },
    onInputMap(event) {
      console.log('input', event)
      this.$emit('input', event)
    },
    onInputManual(event, type) {
      let value = this.value ?? {}
      if (event.includes(',')) {
        event = event.split('@')[1]
        value.latitude = event.split(',')[0].replace('@', '')
        value.longitude = event.split(',')[1]
      } else {
        if (type === "latitude") {
          value.latitude = event
        } else if (type === "longitude") {
          value.longitude = event
        }
      }
      if (isNaN(parseFloat(value.latitude?.toString()))) {
        value.latitude = 0
      } else {
        value.latitude = parseFloat(value.latitude?.toString())
      }
      if (isNaN(parseFloat(value.longitude?.toString()))) {
        value.longitude = 0
      } else {
        value.longitude = parseFloat(value.longitude?.toString())
      }
      this.$emit('input', value)
    },

    filterFn(val, update, abort) {
      if (val.length < 2) {
        abort()
        return
      }
      update(async () => {
        this.options = await this.searchProvider.search({query: val})
      })
    },
    setLocationFromSearch(event) {
      this.$emit('input', {latitude: event.y, longitude: event.x})
      this.locationLabel = event.label
    },
    async getAddress(lat = (this.value && this.value.latitude), lng = (this.value && this.value.longitude)) {
      if (!lat && !lng) {
        await this.getLocation()
        return
      }
      this.$axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`).then(res => {
        this.address = res.data.address
        if (this.address) {
          this.locationLabel = `${this.address.city} ${this.address.neighbourhood} ${this.address.road}`
        }
      })
    }
  },
  mounted() {
    console.log('geooooo', this.value)
    this.searchProvider = new OpenStreetMapProvider();
  }
}

</script>

<style>
.mapField {
  height: 40px !important;
  width: 100% !important;
  display: block;
  overflow: hidden;
  border-radius: 4px;
}

.mapSection {
  height: 60% !important;
}

.footerSection {
  height: 20% !important;
}

.map-card.desktop {
  height: 80vh;
  width: 80vw;
}

.map-card.mobile {
  height: 100%;
  width: 100%;
}
</style>

