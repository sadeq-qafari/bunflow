<template>
  <div class="flex row items-center justify-between bg-grey-4 rounded-borders">
    <div class="col-10">
      <Map :latitude="previewLatitude" :zoom-control="false"
           :attribution="`<span style='font-family:IRANSans !important'>${label}</span>`"
           class="mapField"
           :longitude="previewLongitude" :accuracy="0" :zoom="14"></Map>
    </div>
    <div class="col-1 q-mr-md">
      <q-btn class="q-pa-none" unelevated dense round color="white" text-color="positive" icon="o_edit_location_alt"
             @click="showMap=true"/>
    </div>
    <q-dialog class="col-0" v-model="showMap" @show="initializeMap">
      <q-card :class="['map-card',isMobile?'mobile':'desktop']">
        <q-card-section>
          <q-select class="flex col-md-5"
                    dense
                    outlined
                    @input="setLocationFromSearch"
                    :value="locationLabel"
                    use-input

                    hide-selected
                    label="جستجو"
                    fill-input
                    input-debounce="500"
                    :options="searchOptions"
                    @filter="searchFilterFn"
                    color="primary"
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
        <q-card-section class="mapSection q-pa-none">
          <div :id="mapId" class="block full-width full-height" style="width: 100%; height: 100%;"></div>
        </q-card-section>
        <q-card-section>
          <q-btn
            fab-mini
            color="negative"
            icon="cached"
            class="absolute"
            style="top: 0; right: 12px; transform: translateY(-50%); z-index: 9999"
            @click="resetPolygon"
          />
          <q-btn
            fab-mini
            color="positive"
            icon="check"
            class="absolute"
            v-close-popup
            style="top: 0; left: 12px; transform: translateY(-50%); z-index: 9999"
          />
        </q-card-section>

      </q-card>
    </q-dialog>
  </div>


</template>

<script>
import L from "leaflet";
import {Screen} from "quasar";
import Map from "./Map";
import {OpenStreetMapProvider} from 'leaflet-geosearch';

export default {
  name: "SInputGeoPolygon",
  components: {
    Map
  },
  data: () => ({
    map: null,
    mapId: Math.random().toString(),
    showMap: false,
    polyline: null,
    searchOptions: [],
    locationLabel: ''
  }),
  props: {
    rules: Array,
    dense: Boolean,
    outlined: Boolean,
    placeholder: String,
    label: String,
    value: {
      type: String,
      default: "[]"
    }
  },
  computed: {
    polygon() {

      return this.value && JSON.parse(this.value) || []
    },
    previewLatitude() {
      let lat = 0
      let polygon = Object.assign([], this.polygon)
      if (this.polygon.length > 0) {
        let sum = 0
        this.polygon.forEach(point => {
          sum += point[0]
        })
        lat = (sum / this.polygon.length) || 0;
      }
      return lat
    },
    previewLongitude() {
      let lng = 0
      let polygon = Object.assign([], this.polygon)
      if (this.polygon.length > 0) {
        let sum = 0
        this.polygon.forEach(point => {
          sum += point[1]
        })
        lng = (sum / this.polygon.length) || 0;
      }
      return lng
    },
    isMobile() {
      return Screen && Screen.lt && Screen.lt.md
    }
  },
  methods: {
    setLocationFromSearch(event) {
      this.goTo(event.y, event.x)
      this.locationLabel = event.label
    },
    searchFilterFn(val, update, abort) {
      if (val.length < 2) {
        abort()
        return
      }
      update(async () => {
        this.searchOptions = await this.searchProvider.search({query: val})
      })
    },
    initializeMap() {
      this.map = L.map(this.mapId, {zoomControl: true}).setView([this.previewLatitude, this.previewLatitude], 14)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: this.attribution ? this.attribution : '<a href="https://www.openstreetmap.org/copyright">OSM</a> | <a href="https://www.saanaa.com">Saanaa</a>'
      }).addTo(this.map)
      this.map.on('click', this.addPoint)
      this.setPolygon()
      this.searchProvider = new OpenStreetMapProvider();
    },
    resetPolygon() {
      this.$emit('input', "[]")
      setTimeout(() => {
        this.setPolygon()
      }, 100)

    },
    goTo(latitude, longitude) {
      this.map.panTo([latitude ?? 0, longitude ?? 0])
    },
    setPolygon() {
      if (!this.polyline) {
        this.polyline = L.polygon(this.polygon, {color: '#00bcd4'})
      } else {
        this.polyline.setLatLngs(this.polygon)
      }
      this.polyline.addTo(this.map);
      if (this.polygon.length > 0) {
        this.map.fitBounds(this.polyline.getBounds());
      }

    },
    addPoint(event) {
      this.goTo(event.latlng.lat, event.latlng.lng);
      let polygon = this.polygon
      polygon.push([event.latlng.lat, event.latlng.lng])
      this.$emit('input', JSON.stringify(polygon))
      this.setPolygon()
    }
  },
  mounted() {

  },
}
</script>

<style scoped>
.mapField {
  height: 40px !important;
  width: 100% !important;
  display: block;
  overflow: hidden;
  border-radius: 4px;
}

.mapSection {
  height: 70% !important;
}
</style>

