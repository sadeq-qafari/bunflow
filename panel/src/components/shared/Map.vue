<template>
  <div :id="mapId" class="block full-width full-height" style="width: 100%; height: 100%;"></div>
</template>

<script>
import L from 'leaflet'

export default {
  name: 'Map',
  data: () => ({
    map: null,
    marker: null,
    popup: null,
    circle: null,
    mapId: Math.random().toString()
  }),
  props: {
    latitude: {
      default: 0,
      type: Number,
    },
    longitude: {
      default: 0,
      type: Number,
    },
    selector: {
      default: false,
      type: Boolean,
    },
    zoomControl: {
      default: true,
      type: Boolean,
    },
    attribution: {
      default: null,
      type: String,
    },
    zoom: Number,
    popupText: String,
    accuracy: Number
  },
  watch: {
    latitude(newValue, oldValue) {
      this.goTo(newValue, this.longitude, this.zoom, this.popupText, this.accuracy)
    },
    longitude(newValue, oldValue) {
      this.goTo(this.latitude, newValue, this.zoom, this.popupText, this.accuracy)
    },
    zoom(newValue, oldValue) {
      this.goTo(this.latitude, this.longitude, newValue, this.popupText, this.accuracy)
    },
    popupText(newValue, oldValue) {
      this.goTo(this.latitude, this.longitude, this.zoom, newValue, this.accuracy)
    },
    accuracy(newValue, oldValue) {
      this.goTo(this.latitude, this.longitude, this.zoom, this.popupText, newValue)
    },
  },
  mounted() {
    this.map = L.map(this.mapId, {zoomControl: this.zoomControl}).setView([this.latitude, this.longitude], this.zoom)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: this.attribution ? this.attribution :'<a href="https://www.openstreetmap.org/copyright">OSM</a> | <a href="https://www.saanaa.com">Saanaa</a>'
    }).addTo(this.map)

    this.marker = L.marker([this.latitude, this.longitude]).addTo(this.map)
    this.popup = L.popup().setLatLng([this.latitude, this.longitude]).setContent(this.popupText);
    this.circle = L.circle([this.latitude, this.longitude], this.accuracy)
    this.goTo(this.latitude, this.longitude, this.zoom, this.popupText);
    this.map.on('click', this.selectPosition)
  },
  methods: {
    goTo(latitude, longitude, zoom, popupText, accuracy) {
      this.map.panTo([latitude ?? 0, longitude ?? 0])
      if (this.marker) {
        this.marker.setLatLng([latitude, longitude])
        this.map.removeLayer(this.circle)
        if (accuracy > 0) {
          this.circle = L.circle([this.latitude, this.longitude], accuracy).addTo(this.map)
        }
        if (popupText) {
          this.popup.setContent(popupText)
          this.marker.bindPopup(this.popup)
        }
      }
    },
    selectPosition(event) {
      if (this.selector) {
        this.goTo(event.latlng.lat, event.latlng.lng, this.zoom, this.popupText);
        this.$emit('mapInput', {latitude: event.latlng.lat, longitude: event.latlng.lng})
      }
    }
  }
}
</script>

<style lang="scss">
.leaflet-marker-icon {
  z-index: 1000 !important;
}

.leaflet-marker-shadow {
  z-index: 999 !important;
}

.leaflet-popup {
  z-index: 1000 !important;
  font-family: IRANSans;
  text-align: center !important;
}

.leaflet-popup-content {
  text-align: center !important;
}
</style>

