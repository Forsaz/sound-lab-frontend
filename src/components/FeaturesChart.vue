<template>
  <div>
    <v-menu offset-x>
        <v-btn
          slot="activator"
          color="primary"
          dark
        >
          {{ formatName(chartSelectedFeature) || "Select Feature" }}
        </v-btn>
        <v-list>
          <v-list-tile
            v-for="feature in featureNames"
            :key="feature"
            @click="selectChartFeature(feature)"
          >
            <v-list-tile-title>{{ feature }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    <div ref="chart" class="chart">

    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import {snakeCase} from 'lodash'
import { mapState, mapMutations } from 'vuex'

export default {
  props: {
    sound_slices: Array
  },

  computed: {

    ...mapState('sound', ['chartSelectedFeature']),
    featureNames() {
      if(!this.sound_slices || this.sound_slices.length == 0) return []
      return Object.keys(this.sound_slices[0].features)
    },
  },

  watch: {
    chartSelectedFeature() {
      this.renderChart()
    }
  },

  methods: {
    ...mapMutations('sound', ['selectChartFeature']),
    formatName(name) {
      return snakeCase(name).split(/_/).join(" ")
    },

    selectFeature(feature) {
      this.selectedFeature = feature    
      this.renderChart()
    },

    renderChart() {
      if(!this.$refs.chart) return true 
      if(!this.chartSelectedFeature) return true 

      this.$refs.chart.innerHTML = ""
      let eles = document.body.getElementsByClassName('features-chart-tooltip')
      for(let i=0; i < eles.length; i++) {
        eles[0].remove()
      }

      let dataset = this.sound_slices
      let feature = this.chartSelectedFeature

      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip features-chart-tooltip')
        .style('opacity', 0);

      let margin = {top: 20, right: 30, bottom: 30, left: 60},
          width = this.$refs.chart.offsetWidth - margin.left - margin.right,
          height = 200 - margin.top - margin.bottom,
          xTicks = 10, yTicks = 5;

      let xScale = d3.scaleLinear()
          .domain([0, d3.max(dataset, function(d){ return d.offset; })])
          .range([0, width]);

      let yScale = d3.scaleLinear()
          .domain([d3.min(dataset, function(d){ return parseFloat(d.features[feature]); }), d3.max(dataset, function(d){ return parseFloat(d.features[feature]); })])
          .range([height, 0]);

      let line = d3.line()
          .x(function(d) { return xScale(d.offset); })
          .y(function(d) { return yScale(d.features[feature]); });

      let svg = d3.select(this.$refs['chart'])
            .append('svg:svg')
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(xTicks).tickPadding(10));

      svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale).ticks(yTicks).tickPadding(10));


      svg.append("path")
        .datum(dataset)
        .attr("class", "line")
        .attr("d", line)

      svg.selectAll('.dot')
        .data(dataset)
        .enter()
        .append('circle')
        .attr("class", "dot")
        .attr("cx", function(d, i) { return xScale(d.offset) })
        .attr("cy", function(d) { return yScale(parseFloat(d.features[feature])) })
        .attr("r", 8)
        .on('mouseover', d => {
          tooltip
            .transition()
            .duration(200)
            .style('opacity', 0.9);
          tooltip
            .html(`<b>${feature}</b>: ${d.features[feature]}`)
            .style('left', d3.event.pageX + 'px')
            .style('top', d3.event.pageY - 28 + 'px');
        })
        .on('mouseout', () => {
          tooltip
            .transition()
            .duration(500)
            .style('opacity', 0);
        });

      let gridLinesY = d3.axisLeft(yScale).ticks(yTicks).tickFormat("").tickSize(-width)
      let gridLinesX = d3.axisTop(xScale).ticks(xTicks).tickFormat("").tickSize(-height)
      
      svg.append("g").attr("class", "grid").call(gridLinesY)
      svg.append("g").attr("class", "grid").call(gridLinesX)
    }
  },

  mounted() {
    this.$nextTick(this.renderChart)
  }
}
</script>

<style>

  .axis path,
  .axis line{
    fill: none;
    stroke: black;
  }

  .line{
    fill: none;
    stroke: blue;
    stroke-width: 2px;
  }

  .dot {
    fill: #ffab00;
    stroke: #fff;
    cursor: pointer;
  }

  .tick text{
    font-size: 12px;
  }

  .tick line{
    opacity: 0.2;
  }


  div.tooltip {
    color: white;
    position: absolute;
    text-align: center;
    /* width: 60px; */
    padding: 2px;
    font: 12px sans-serif;
    background: rgba(0,0,0,.8);
    border: 2px solid black;
    pointer-events: none;
  }

  .grid line {
    stroke: #afafaf;
    stroke-opacity: 0.9;
    shape-rendering: crispEdges;
  }

  .grid path {
    stroke-width: 0;
  }

</style>
