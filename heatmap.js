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
          top: 50,
          bottom: 70,
          right: 10,
          left: 90
      }
    }

    


        
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
    .style("fill", function(d){
      if (d.count >10){
        return "white"
      }else{
        return "black"
      }
    })
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
    .style("fill", function(d){
      if (d.count >10){
        return "white"
      }else{
        return "black"
      }
  })
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























