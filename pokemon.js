// todo
// on click bar chart bigger + show difference to other bars
// heatmap numbers
// heatmap legend





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
    var pokemonGenCount = new Map(d3.rollup(dataset, v => v.length, d => d['gen_numeric']))

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

    var text = svg
    .append('text')
    .attr("id", 'topbartext')
    .attr("x", 500)
    .attr("y", 20)
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("font-family", "sans-serif")
    .text("")

    var bars = svg
      .selectAll("g")
      .data(pokemonGenCount)
      .enter().append("g")
      
    bars.append("rect")
      .on("mouseover", function(d,i){
        console.log(d)
        d3.select(this)
        .attr("stroke", "blue")
        console.log(d.srcElement.__data__[1])
        text.attr("x",  xScale(+i[0]) + xScale.bandwidth()/2)
        .attr("y",yScale(+i[1])- 10)
        .text(d.srcElement.__data__[1])
    })
    .on("mouseout", function(){
        d3.select(this)
        .attr("stroke", "none")

        text.text("")
    })
    .on('click', function(d,i){
      d3.select(this)
      .attr("fill", "blue")
      
    })
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

    // create x-axis label
    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", dimensions.width/2)
    .attr("y", dimensions.height-dimensions.margin.right)
    .text("Generation");

    // create y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -200)
        .attr("y", dimensions.margin.top)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Count of Pokemon");


        
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
    .domain([0,max_value])


    var squares = svg
    .selectAll("g")
    .data(transformed_heatmap)
    .enter().append("g")


     squares
    .append("rect")
    .attr("x", d => xScale(d.gen))
    .attr("y", d => yScale(d.type))
    .attr("height", d => yScale.bandwidth())
    .attr("width", xScale.bandwidth())
    .style("fill", d=> myColor(d.count))
    .on("mouseover", function(d,i){
      d3.select(this)
      .attr("stroke", "grey")
    })
    .on("mouseout", function(){
        d3.select(this)
        .attr("stroke", "none")
    })
    .on('click', function(d,i){
      // selected heatmap
    
    filteredData = dataset.filter(function(d){return (d.primary_type == i.type && d.gen == i.gen)})
    filteredData.forEach(function(d){
      if(d.secondary_type == ""){
        d.secondary_type = "normal"
      }
    })
    var groupedData = new Map(d3.rollup(filteredData, v => v.length,d => d['secondary_type']))
    dataSelectedHeatmap = []
    //transforming the data in the right format
    for (let [key, value] of groupedData){
      dataSelectedHeatmap.push({"type": key, "gen": i.gen, "count": value})
    }

    console.log(dataSelectedHeatmap)

    var svg = d3.select("#selected_heatmap")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)
    svg.selectAll('*').remove()
    generations = d3.map(dataSelectedHeatmap, d => d.gen)
    console.log(generations)
    types = d3.map(dataSelectedHeatmap, d => d.type)

    var xScale = d3.scaleBand()
    .domain(generations)
    .range([dimensions.margin.left ,dimensions.width - dimensions.margin.right])
  

    var yScale = d3.scaleBand()
    .domain(types)
    .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])


    max_value = 0
    dataSelectedHeatmap.forEach(function(d){
      if (max_value < d.count){
        max_value = d.count
      }
    })


    var myColor = d3.scaleLinear()
    .range(["white", "#00008B"])
    .domain([0,max_value])

    var squares = svg
    .selectAll("g")
    .data(dataSelectedHeatmap)
    .enter().append("g")

   squares
    .append("rect")
    .attr("x", d => xScale(d.gen))
    .attr("y", d => yScale(d.type))
    .attr("height", d => yScale.bandwidth())
    .attr("width", xScale.bandwidth())
    .style("fill", d=> myColor(d.count))

    squares.append("text")
    .style("fill", "black")
    .style("font-size", "14px")
    .attr("dy", ".35em")
    .attr("x", d => xScale(d.gen)+xScale.bandwidth()/2)
    .attr("y", d => yScale(d.type)+ yScale.bandwidth()/2)
    .style("style", "label")
    .text(d => d.count);

    var xAxisGen = d3.axisBottom(xScale)
    var xAxis = svg.append("g")
                .call(xAxisGen)
                .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

    var yAxisGen = d3.axisLeft().scale(yScale)
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)

    })


  squares.append("text")
    .style("fill", "black")
    .style("font-size", "14px")
    .attr("dy", ".35em")
    .attr("x", d => xScale(d.gen)+xScale.bandwidth()/2)
    .attr("y", d => yScale(d.type)+ yScale.bandwidth()/2)
    .style("style", "label")
    .text(d => d.count);

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























