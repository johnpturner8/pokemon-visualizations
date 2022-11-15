var width = 500
var height = 500
var previousElement = 0
var previousElementColor = 0
var previousXYElement = 0
var previousFontSize = 0 
var svg = d3.select("#pokemon")
  .style("width", width)
  .style("height", height)  

d3.csv("pokemon.csv").then(
  function(dataset){

    var dimensions = {
      width: 1050,
      height: 600,
      margin:{
          top: 50,
          bottom: 50,
          right: 250,
          left: 50
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
    .range([dimensions.margin.left +50 ,dimensions.width - dimensions.margin.right])
  

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
    .range(["white", "#008BF5"])
    .domain([0,max_value])


    var squares = svg
    .selectAll("g")
    .data(transformed_heatmap)
    .enter().append("g")

     squares
    .append("rect")
    .attr("x", d => xScale(d.gen))
    .attr("y", d => yScale(d.type))
    .attr("height", d => yScale.bandwidth()-1)
    .attr("width", xScale.bandwidth()-1)
    .style("fill", d=> myColor(d.count))
    .on("mouseover", function(d,i){
      d3.select(this)
      .attr("stroke", "black")
      .attr("stroke-width", 2)

    })
    .on("mouseout", function(){
        if(d3.select(this).attr("class") != "selected"){
          d3.select(this)
          .attr("stroke", "none")
        }
    })
    .on('click', function(d,i){
      if(previousElement != 0){
        d3.select(previousElement).attr("stroke", "none").attr("class", "unselected")
      }

      if(previousXYElement != 0){
        d3.select(previousXYElement).attr("class", "unselected").style("font-size", "10px")
      }

      previousColor = d3.select(this).style("fill")
      previousElement = this


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


    var svg = d3.select("#selected_heatmap")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)
    svg.selectAll('*').remove()
    d3.select(this)
    .attr("stroke", "black")
    .attr("class", "selected")


    generations = d3.map(dataSelectedHeatmap, d => d.gen)
    generations.forEach((d, j) => generations[j] = generations[j] + ", " + i.type)
    selected_types = d3.map(dataSelectedHeatmap, d => d.type)

    obj = {}
    dataSelectedHeatmap.forEach(function(d){
      obj[d.type] = d.count
    })
    stack_data_formating = [obj]

    var xScale = d3.scaleBand()
    .domain(generations)
    .range([dimensions.margin.left ,dimensions.width/4])

    var yScale = d3.scaleLinear()
    .domain([0, i.count])
    .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])


        
    var stackedData = d3.stack()
                        .keys(selected_types)
                        (stack_data_formating)


    var types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"]
    var typeColors = ["#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A", "#B6A136", "#735797", "#6F35FC", "#705746", "#B7B7CE", "#D685AD"]
   
    
    var colorScale = d3.scaleOrdinal()
    .domain(types)
    .range(typeColors)

    //make color legend
    var size = 15
    legend = svg.selectAll("myLegend")
      .data(types)
      .enter()
      .append("g")
    
    legendBoxes = legend.append("rect")
      .attr("x", dimensions.width/4 + 20)
      .attr("y", function(d,i){ return dimensions.margin.top + i*(size+5)}) 
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d, i){ return typeColors[i]})
      .style("opacity", function(d){
        if (selected_types.includes(d)){
          return 1
        }else{
          return 0.2
        }
      })
        
    legendText = legend.append("text")
      .attr("x", dimensions.width/4 + 20 + size*1.2)
      .attr("y", function(d,i){ return dimensions.margin.top + i*(size+5) + (size/2)}) 
      .style("fill", function(d, i){ return typeColors[i]})
      .text(function(d){ return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .style("opacity", function(d){
        if (selected_types.includes(d)){
          return 1
        }else{
          return 0.2
        }
      })

    var bars = svg.append("g")
                  .selectAll("g")
                  .data(stackedData)
                  .enter()
                  .append("g")
                  .attr("fill", d => colorScale(d.key))
                  .selectAll("rect")
                  .data(function(d){return d;})
                  .enter()
                  .append("rect")
                  .attr("x", d => (dimensions.margin.left + (dimensions.width/4))/2 - xScale.bandwidth()/4)
                  .attr("y", d => yScale(d[1]))
                  .attr("height", d => yScale(d[0]) - yScale(d[1]))
                  .attr("width", d => xScale.bandwidth()/2)


    var xAxisGen = d3.axisBottom(xScale)
    var xAxis = svg.append("g")
                .call(xAxisGen)
                .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

    var yAxisGen = d3.axisLeft().scale(yScale)
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)

    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", (dimensions.width)/4)
    .attr("y", dimensions.height-dimensions.margin.bottom +40)
    .text("Selected generation & primary type");

    // create y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -200)
        .attr("y", 0)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Count of Pokemon");

    })


  squares.append("text")
    .style("fill", "black")
    .style("font-size", "14px")
    .attr("dy", ".35em")
    .attr("x", d => (xScale(d.gen)+xScale.bandwidth()/2))
    .attr("y", d => yScale(d.type)+ yScale.bandwidth()/2)
    .style("style", "label")
    .text(d => d.count);

    var xAxisGen = d3.axisBottom(xScale)
    var xAxis = svg.append("g")
                .call(xAxisGen)
                .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)
                .selectAll("g")
                .on("mouseover", function(d,i){
                  d3.select(this)
                  .style("font-size", "18px")
            
                })
                .on("mouseout", function(){
                    if(d3.select(this).attr("class") != "selected"){
                      d3.select(this)
                      .style("font-size", "10px")
                    }
                })
                .on("click", function(d, i){

                  if(previousElement != 0){
                    d3.select(previousElement).attr("stroke", "none").attr("class", "unselected")
                  }
                  if(previousXYElement != 0){
                    d3.select(previousXYElement).attr("class", "unselected").style("font-size", "10px")
                  }

                  previousXYElement = this
            
                  filteredData = dataset.filter(function(d){return (d.gen == i)})
                  filteredData.forEach(function(d){
                    if(d.secondary_type == ""){
                      d.secondary_type = "normal"
                    }
                  })

                  var groupedData = new Map(d3.rollup(filteredData, v => v.length,d => d['secondary_type']))
                  dataSelectedHeatmap = []
                  //transforming the data in the right format
                  for (let [key, value] of groupedData){
                    dataSelectedHeatmap.push({"type": key, "gen": i, "count": value})
                  }
                  var svg = d3.select("#selected_heatmap")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)
                  
                  //remove last selected visualization
                  svg.selectAll('*').remove()

                  d3.select(this)
                  .style("font-size", "18px")
                  .attr("class", "selected")

                  generations = d3.map(dataSelectedHeatmap, d => d.gen)
                  selected_types = d3.map(dataSelectedHeatmap, d => d.type)

                  obj = {}
                  dataSelectedHeatmap.forEach(function(d){
                    obj[d.type] = d.count
                  })
                  stack_data_formating = [obj]

                  var xScale = d3.scaleBand()
                  .domain(generations)
                  .range([dimensions.margin.left ,dimensions.width/4])

                  var yScale = d3.scaleLinear()
                  .domain([0, filteredData.length])
                  .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])


                      
                  var stackedData = d3.stack()
                                      .keys(selected_types)
                                      (stack_data_formating)


                  var types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"]
                  var typeColors = ["#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A", "#B6A136", "#735797", "#6F35FC", "#705746", "#B7B7CE", "#D685AD"]
                
                  
                  var colorScale = d3.scaleOrdinal()
                  .domain(types)
                  .range(typeColors)

                  //make color legend
                  var size = 15
                  legend = svg.selectAll("myLegend")
                    .data(types)
                    .enter()
                    .append("g")
                  
                  legendBoxes = legend.append("rect")
                    .attr("x", dimensions.width/4 + 20)
                    .attr("y", function(d,i){ return dimensions.margin.top + i*(size+5)}) 
                    .attr("width", size)
                    .attr("height", size)
                    .style("fill", function(d, i){ 
                      return typeColors[i]
                    })
                    .style("opacity", function(d){
                      if (selected_types.includes(d)){
                        return 1
                      }else{
                        return 0.2
                      }
                    })
                      
                  legendText = legend.append("text")
                    .attr("x", dimensions.width/4 + 20 + size*1.2)
                    .attr("y", function(d,i){ return dimensions.margin.top + i*(size+5) + (size/2)}) 
                    .style("fill", function(d, i){ return typeColors[i]})
                    .text(function(d){ return d })
                    .attr("text-anchor", "left")
                    .style("alignment-baseline", "middle")
                    .style("opacity", function(d){
                      if (selected_types.includes(d)){
                        return 1
                      }else{
                        return 0.2
                      }
                    })

                  var bars = svg.append("g")
                                .selectAll("g")
                                .data(stackedData)
                                .enter()
                                .append("g")
                                .attr("fill", d => colorScale(d.key))
                                .selectAll("rect")
                                .data(function(d){return d;})
                                .enter()
                                .append("rect")
                                .attr("x", d => (dimensions.margin.left + (dimensions.width/4))/2 - xScale.bandwidth()/4)
                                .attr("y", d => yScale(d[1]))
                                .attr("height", d => yScale(d[0]) - yScale(d[1]))
                                .attr("width", d => xScale.bandwidth()/2)


                  var xAxisGen = d3.axisBottom(xScale)
                  var xAxis = svg.append("g")
                              .call(xAxisGen)
                              .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

                  var yAxisGen = d3.axisLeft().scale(yScale)
                  var yAxis = svg.append("g")
                                  .call(yAxisGen)
                                  .style("transform", `translateX(${dimensions.margin.left}px)`)
                  svg.append("text")
                  .attr("class", "x label")
                  .attr("text-anchor", "end")
                  .attr("x", (dimensions.width)/4)
                  .attr("y", dimensions.height-dimensions.margin.bottom +40)
                  .text("Selected generation & primary type");
              
                  // create y-axis label
                  svg.append("text")
                      .attr("class", "y label")
                      .attr("text-anchor", "end")
                      .attr("x", -200)
                      .attr("y", 0)
                      .attr("dy", ".75em")
                      .attr("transform", "rotate(-90)")
                      .text("Count of Pokemon");
              
              })



    var yAxisGen = d3.axisLeft().scale(yScale)
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left+50}px)`)
                    .selectAll("g")
                .on("mouseover", function(d,i){
                  d3.select(this)
                  .style("font-size", "18px")
            
                })
                .on("mouseout", function(){
                    if(d3.select(this).attr("class") != "selected"){
                      d3.select(this)
                      .style("font-size", "10px")
                    }
                })
                .on("click", function(d, i){  
                  if(previousElement != 0){
                    d3.select(previousElement).attr("stroke", "none").attr("class", "unselected")
                  }
                  if(previousXYElement != 0){
                    d3.select(previousXYElement).attr("class", "unselected").style("font-size", "10px")
                  }
                  previousXYElement = this
            
                  filteredData = dataset.filter(function(d){return (d.gen == i)})
                  filteredData.forEach(function(d){
                    if(d.secondary_type == ""){
                      d.secondary_type = "normal"
                    }
                  })

                  filteredData = dataset.filter(function(d){return (d.primary_type == i)})
                  filteredData.forEach(function(d){
                    if(d.secondary_type == ""){
                      d.secondary_type = "normal"
                    }
                  })

                  var groupedData = new Map(d3.rollup(filteredData, v => v.length,d => d['secondary_type']))
                  dataSelectedHeatmap = []
                  //transforming the data in the right format
                  for (let [key, value] of groupedData){
                    dataSelectedHeatmap.push({"type": key, "gen": i, "count": value})
                  }
                  var svg = d3.select("#selected_heatmap")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)
                  
                  //remove last selected visualization
                  svg.selectAll('*').remove()

                  d3.select(this)
                  .style("font-size", "18px")
                  .attr("class", "selected")

                  generations = d3.map(dataSelectedHeatmap, d => d.gen)
                  selected_types = d3.map(dataSelectedHeatmap, d => d.type)

                  obj = {}
                  dataSelectedHeatmap.forEach(function(d){
                    obj[d.type] = d.count
                  })
                  stack_data_formating = [obj]

                  var xScale = d3.scaleBand()
                  .domain(generations)
                  .range([dimensions.margin.left ,dimensions.width/4])

                  var yScale = d3.scaleLinear()
                  .domain([0, filteredData.length])
                  .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])


                      
                  var stackedData = d3.stack()
                                      .keys(selected_types)
                                      (stack_data_formating)


                  var types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"]
                  var typeColors = ["#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A", "#B6A136", "#735797", "#6F35FC", "#705746", "#B7B7CE", "#D685AD"]
                
                  
                  var colorScale = d3.scaleOrdinal()
                  .domain(types)
                  .range(typeColors)

                  //make color legend
                  var size = 15
                  legend = svg.selectAll("myLegend")
                    .data(types)
                    .enter()
                    .append("g")
                  
                  legendBoxes = legend.append("rect")
                    .attr("x", dimensions.width/4 + 20)
                    .attr("y", function(d,i){ return dimensions.margin.top + i*(size+5)}) 
                    .attr("width", size)
                    .attr("height", size)
                    .style("fill", function(d, i){ return typeColors[i]})
                    .style("opacity", function(d){
                      if (selected_types.includes(d)){
                        return 1
                      }else{
                        return 0.2
                      }
                    })
                      
                  legendText = legend.append("text")
                    .attr("x", dimensions.width/4 + 20 + size*1.2)
                    .attr("y", function(d,i){ return dimensions.margin.top + i*(size+5) + (size/2)}) 
                    .style("fill", function(d, i){ return typeColors[i]})
                    .text(function(d){ return d })
                    .attr("text-anchor", "left")
                    .style("alignment-baseline", "middle")
                    .style("opacity", function(d){
                      if (selected_types.includes(d)){
                        return 1
                      }else{
                        return 0.2
                      }
                    })

                  var bars = svg.append("g")
                                .selectAll("g")
                                .data(stackedData)
                                .enter()
                                .append("g")
                                .attr("fill", d => colorScale(d.key))
                                .selectAll("rect")
                                .data(function(d){return d;})
                                .enter()
                                .append("rect")
                                .attr("x", d => (dimensions.margin.left + (dimensions.width/4))/2 - xScale.bandwidth()/4)
                                .attr("y", d => yScale(d[1]))
                                .attr("height", d => yScale(d[0]) - yScale(d[1]))
                                .attr("width", d => xScale.bandwidth()/2)


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
                  .attr("x", (dimensions.width)/4)
                  .attr("y", dimensions.height-dimensions.margin.bottom +40)
                  .text("Selected generation & primary type");
              
                  // create y-axis label
                  svg.append("text")
                      .attr("class", "y label")
                      .attr("text-anchor", "end")
                      .attr("x", -200)
                      .attr("y", 0)
                      .attr("dy", ".75em")
                      .attr("transform", "rotate(-90)")
                      .text("Count of Pokemon");
                })

                  // create x-axis label
    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", (dimensions.width)/2)
    .attr("y", dimensions.height-dimensions.margin.bottom+ 50 )
    .text("Generations");

    // create y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -200)
        .attr("y", 0)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Primary type");
    








          // selected heatmap
    filteredData = dataset.filter(function(d){return (d.primary_type == "fire" && d.gen == "I")})
    filteredData.forEach(function(d){
      if(d.secondary_type == ""){
        d.secondary_type = "normal"
      }
    })
    var groupedData = new Map(d3.rollup(filteredData, v => v.length,d => d['secondary_type']))
    dataSelectedHeatmap = []
    //transforming the data in the right format
    for (let [key, value] of groupedData){
      dataSelectedHeatmap.push({"type": key, "gen": "I", "count": value})
    }


    var svg = d3.select("#selected_heatmap")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)

    generations = d3.map(dataSelectedHeatmap, d => d.gen)
    generations.forEach((d, j) => generations[j] = generations[j] + ", " + "fire")
    selected_types = d3.map(dataSelectedHeatmap, d => d.type)

    obj = {}
    dataSelectedHeatmap.forEach(function(d){
      obj[d.type] = d.count
    })
    stack_data_formating = [obj]

    var xScale = d3.scaleBand()
    .domain(generations)
    .range([dimensions.margin.left ,dimensions.width/4])

    var yScale = d3.scaleLinear()
    .domain([0, 12])
    .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])


        
    var stackedData = d3.stack()
                        .keys(selected_types)
                        (stack_data_formating)


    var types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"]
    var typeColors = ["#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A", "#B6A136", "#735797", "#6F35FC", "#705746", "#B7B7CE", "#D685AD"]
   
    
    var colorScale = d3.scaleOrdinal()
    .domain(types)
    .range(typeColors)

    //make color legend
    var size = 15
    legend = svg.selectAll("myLegend")
      .data(types)
      .enter()
      .append("g")
    
    legendBoxes = legend.append("rect")
      .attr("x", dimensions.width/4 + 20)
      .attr("y", function(d,i){ return dimensions.margin.top + i*(size+5)}) 
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d, i){ return typeColors[i]})
      .style("opacity", function(d){
        if (selected_types.includes(d)){
          return 1
        }else{
          return 0.2
        }
      })
        
    legendText = legend.append("text")
      .attr("x", dimensions.width/4 + 20 + size*1.2)
      .attr("y", function(d,i){ return dimensions.margin.top + i*(size+5) + (size/2)}) 
      .style("fill", function(d, i){ return typeColors[i]})
      .text(function(d){ return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .style("opacity", function(d){
        if (selected_types.includes(d)){
          return 1
        }else{
          return 0.2
        }
      })

    var bars = svg.append("g")
                  .selectAll("g")
                  .data(stackedData)
                  .enter()
                  .append("g")
                  .attr("fill", d => colorScale(d.key))
                  .selectAll("rect")
                  .data(function(d){return d;})
                  .enter()
                  .append("rect")
                  .attr("x", d => (dimensions.margin.left + (dimensions.width/4))/2 - xScale.bandwidth()/4)
                  .attr("y", d => yScale(d[1]))
                  .attr("height", d => yScale(d[0]) - yScale(d[1]))
                  .attr("width", d => xScale.bandwidth()/2)


    var xAxisGen = d3.axisBottom(xScale)
    var xAxis = svg.append("g")
                .call(xAxisGen)
                .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

    var yAxisGen = d3.axisLeft().scale(yScale)
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)

    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", (dimensions.width)/4)
    .attr("y", dimensions.height-dimensions.margin.bottom +40)
    .text("Selected generation & primary type");

    // create y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -200)
        .attr("y", 0)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Count of Pokemon");

    })
  
























