var width = 500
var height = 500

var svg = d3.select("#pokemon")
  .style("width", width)
  .style("height", height)


d3.csv("pokemon.csv").then(
  function(dataset){
    console.log(dataset)

    var dimensions = {
      width: 1400,
      height:600,
      margin:{
          top: 10,
          bottom: 70,
          right: 10,
          left: 90
      }
    }

    // create barchart
    var pokemonGenCount = new Map(d3.rollup(dataset, v => v.length, d => d['gen (numeric)']))

    console.log(pokemonGenCount)

    var svg = d3.select("#barchart")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)
                       
    var xScale = d3.scaleBand()
                    .domain(d3.map(pokemonGenCount, d => +d[0]))
                    .range([dimensions.margin.left ,dimensions.width - dimensions.margin.right])
                    .padding([0.2])

    let maxCount = 0
    for (let [key, value] of pokemonGenCount) {
      if (maxCount < value){
        maxCount = value
      }
    }

    var yScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])

    var bars = svg.append("g")
      .selectAll("rect")
      .data(pokemonGenCount)
      .enter()
      .append("rect")
      .attr("x", d => xScale(+d[0]))
      .attr("y", d => yScale(+d[1]))
      .attr("height", d => dimensions.height-dimensions.margin.bottom - yScale(+d[1]))
      .attr("width", xScale.bandwidth())

    var xAxisGen = d3.axisBottom(xScale)
    var xAxis = svg.append("g")
                .call(xAxisGen)
                .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

    var yAxisGen = d3.axisLeft().scale(yScale)
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)

        
   

    // create heatmap
    var data_heatmap = new Map(d3.rollup(dataset, v => v.length,d => d['primary_type'], d => d['gen']))
    transformed_heatmap = []
    
    //transforming the data in the right format
    for (let [key, value] of data_heatmap){
      for (let [k, v] of value){
        transformed_heatmap.push({"type": key, "gen": k, "count": v})
      }
    }

    var svg = d3.select("#heatmap")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)

    generations = d3.map(transformed_heatmap, d => d.gen)
    types = d3.map(transformed_heatmap, d => d.type)
    

    var xScale = d3.scaleBand()
    .domain(generations)
    .range([dimensions.margin.left ,dimensions.width - dimensions.margin.right])
  

    var yScale = d3.scaleBand()
    .domain(types)
    .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])


    max_value = 0
    transformed_heatmap.forEach(function(d){
      if (max_value < d.count){
        max_value = d.count
      }
    })


    var myColor = d3.scaleLinear()
    .range(["white", "#00008B"])
    .domain([1,max_value])

    var squares = svg.append("g")
    .selectAll("rect")
    .data(transformed_heatmap)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.gen))
    .attr("y", d => yScale(d.type))
    .attr("height", d => yScale.bandwidth())
    .attr("width", xScale.bandwidth())
    .style("fill", d=> myColor(d.count))

    var xAxisGen = d3.axisBottom(xScale)
    var xAxis = svg.append("g")
                .call(xAxisGen)
                .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

    var yAxisGen = d3.axisLeft().scale(yScale)
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)


  }
)