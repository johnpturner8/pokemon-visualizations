import { scatterplot } from './scatterplot.js'
import { heatmap } from './heatmap.js'

d3.csv("pokemon.csv").then(
  function(dataset){
    scatterplot(dataset)
    heatmap(dataset)
  }
)