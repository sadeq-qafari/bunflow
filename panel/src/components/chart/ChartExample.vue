<template>
  <canvas :id="id"></canvas>
</template>

<script>
import {Chart, registerables} from 'chart.js'

export default {
  name: "ChartExample",
  data: () => ({
    colors: ['#f44336', '#2196f3', '#8bc34a', '#ff5722', '#e91e63', '#03a9f4', '#cddc39', '#795548', '#9c27b0', '#00bcd4', '#673ab7', '#009688', '#ffc107', '#3f51b5', '#4caf50', '#ff9800']
  }),
  computed: {
    id() {
      return (Math.random() * 10000).toFixed(0)
    }
  },
  props: {
    width: {
      type: String,
      default: "400"
    },
    height: {
      type: String,
      default: "400"
    },
    label: {
      type: String,
      default: "نمودار"
    },
    data: Object | Array,
    type: {
      type: Number,
      default: 1
    },
    chartModel: {
      type:String,
      default: 'bar'
    }
  },
  mounted() {
    Chart.register(...registerables);
    Chart.defaults.font.family = "iransans"
    let labels = [];
    let newData = []
    let data = {}
    if (this.type === 1) {
      if (Array.isArray(this.data)) {
        for (let x in this.data[0]) {
          labels.push(x)
        }
      } else {
        for (let x in this.data) {
          labels.push(x)
        }
      }
      for (let y of this.data) {
        for (let x in y) {
          newData.push(y[x])
        }
      }
      data = {
        labels: labels,
        datasets: [{
          label: this.label,
          backgroundColor: this.colors,
          borderColor: '#fff',
          data: newData,
        }]
      };
    } else {
      let key = Object.keys(this.data[0])[0]
      for (let y of this.data) {
        labels.push(y[key])
      }
      for (let i = 1; i < Object.keys(this.data[0]).length; i++) {
        let k = Object.keys(this.data[0])[i]
        newData.push([])
        for (let y of this.data) {
          newData[i - 1].push(y[k])
        }
      }
      let datasets = []
      Object.keys(this.data[0]).forEach((x, i) => {
        if (i > 0) {
          datasets.push({
            label: x,
            backgroundColor: this.colors,
            borderColor: '#fff',
            data: newData[i-1],
          })
        }
      })
      data = {
        labels: labels,
        datasets
      };
    }

    // console.log('labels', labels)
    // console.log('newData', newData)
    // console.log('data', data)


    const myChart = new Chart(
      document.getElementById(this.id), {
        type: this.chartModel,
        data,
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      }
    );
  }
}
</script>

<style scoped>

</style>

