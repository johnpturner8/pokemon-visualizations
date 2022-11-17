import {updateFilters} from './scatterplot.js'

export function heatmap(dataset){
    var previousElement = 0
    var previousColor = 0
    var previousXYElement = 0
    var previousFontSize = 0 

    var dimensions = {
      width: 400,
      height: 600,
      margin:{
          top: 50,
          bottom: 50,
          right: 20,
          left: 50
      }
    }
        
    // create heatmap
    var data_heatmap = new Map(d3.rollup(dataset, v => v.length,d => d['primary_type'], d => d['gen']))
    var transformed_heatmap = []
    
    //transforming the data in the right format
    for (let [key, value] of data_heatmap){
      for (let [k, v] of value){
        transformed_heatmap.push({"type": key, "gen": k, "count": v})
      }
    }

    var svg = d3.select("#heatmap")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)
                    
    var generations = d3.map(transformed_heatmap, d => d.gen)
    // types = d3.map(transformed_heatmap, d => d.type)
    var types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy", "none"]
    var typeColors = ["#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A", "#B6A136", "#735797", "#6F35FC", "#705746", "#B7B7CE", "#D685AD", "#555151"]

    var xScale = d3.scaleBand()
      .domain(generations)
      .range([dimensions.margin.left +50 ,dimensions.width - dimensions.margin.right])
  

    var yScale = d3.scaleBand()
      .domain(types.slice(0, -1))
      .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])

    var colorScale = d3.scaleOrdinal()
      .domain(types)
      .range(typeColors)

    var max_value = 0
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
    .on("mouseover", function(d,i){
      d3.select(this)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")

    })
    .on("mouseout", function(){
        if(d3.select(this).attr("class") != "selected"){
          d3.select(this)
          .attr("stroke", "none")
        }
    })
    .on('click', function(d,i){
      var len = d3.selectAll(".selected")._groups[0].length
      if(d3.select(this).attr("class") == "selected" && len == 1){
        createSelectAll(this, i, "All")
        d3.select(this)
        .attr("stroke", "none")
      }else if (d3.select(this).attr("class") == "selected"){
        d3.select(this)
        .attr("stroke", "none")
        .attr("class", "unselected")
      }else{

        previousColor = d3.select(this).style("fill")
        previousElement = this

        updateFilters([i.gen], [i.type]);
        var filteredData = filterDataByGenAndType(i.gen, i.type)

        createSpecificHeatmap(this, filteredData, i)

        createXAxisLabel(svg, "Selected generation & primary type",  (dimensions.width)/4, dimensions.height-dimensions.margin.bottom+ 40)

        createYAxisLabel(svg, "Count of Pokemon", -200, 0)
      }
    })

     squares
    .append("rect")
    .attr("x", d => xScale(d.gen))
    .attr("y", d => yScale(d.type))
    .attr("height", d => yScale.bandwidth()-1)
    .attr("width", xScale.bandwidth()-1)
    .style("fill", d=> myColor(d.count))
    


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
                  .style("cursor", "pointer")
            
                })
                .on("mouseout", function(){
                    if(d3.select(this).attr("class") != "selected"){
                      d3.select(this)
                      .style("font-size", "10px")
                    }
                })
                .on("click", function(d, i){
                  var len = d3.selectAll(".selected")._groups[0].length
                  if(d3.select(this).attr("class") == "selected" && len == 1){
                    createSelectAll(this, i, "All")
                    d3.select(this)
                    .style("font-size", "10px")
                  }else if (d3.select(this).attr("class") == "selected"){
                    d3.select(this)
                    .style("font-size", "10px")
                    .attr("class", "unselected")
                  }else
                  {
                    previousXYElement = this
          
                    updateFilters([i], types.slice(0, -1));
              
                    var filteredData = filterDataByGeneration(i)
                    createHeatmap(this, filteredData, i, "Selected generation")
                  }

              })

    var yAxisGen = d3.axisLeft().scale(yScale)
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left+50}px)`)
                    .selectAll("g")
                    
                .on("mouseover", function(d,i){
                  d3.select(this)
                  .style("font-size", "18px")
                  .style("cursor", "pointer")
                })
                .on("mouseout", function(){
                    if(d3.select(this).attr("class") != "selected"){
                      d3.select(this)
                      .style("font-size", "10px")
                    }
                })
                .on("click", function(d, i){  
                  var len = d3.selectAll(".selected")._groups[0].length
                  if(d3.select(this).attr("class") == "selected" && len == 1){
                    createSelectAll(this, i, "All")
                    d3.select(this)
                    .style("font-size", "10px")
                  }else if (d3.select(this).attr("class") == "selected"){
                    d3.select(this)
                    .style("font-size", "10px")
                    .attr("class", "unselected")
                  }else{

                    previousXYElement = this

                    updateFilters(["I", "II", "III", "IV", "V", "VI", "VII", "VIII"], [i]);
              
                    var filteredData = filterDataByGeneration(i)
                    filteredData = filterDataByPrimaryType(i)

                    createHeatmap(this, filteredData, i, "Selected primary type")
                  }
                })

    yAxis.select(".tick text")
      .style("fill", function(d, i){ return typeColors[i]})
    

    createXAxisLabel(svg, "Generations", (dimensions.width)/2, dimensions.height-dimensions.margin.bottom+ 50)

    createYAxisLabel(svg, "Primary type", -200, 0)


    // selected heatmap
    var filteredData = filterDataByGenAndType("I", "fire")
    var groupedData = new Map(d3.rollup(filteredData, v => v.length,d => d['secondary_type']))
    var dataSelectedHeatmap = []
    //transforming the data in the right format
    for (let [key, value] of groupedData){
      dataSelectedHeatmap.push({"type": key, "gen": "I", "count": value})
    }


    var svg = d3.select("#selected_heatmap")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)

    generations = d3.map(dataSelectedHeatmap, d => d.gen)
    generations.forEach((d, j) => generations[j] = generations[j] + ", " + "fire")
    var selected_types = d3.map(dataSelectedHeatmap, d => d.type)

    var obj = {}
    dataSelectedHeatmap.forEach(function(d){
      obj[d.type] = d.count
    })
    var stack_data_formating = [obj]

    var xScale = d3.scaleBand()
    .domain(generations)
    .range([dimensions.margin.left ,dimensions.width/4])

    var yScale = d3.scaleLinear()
    .domain([0, 12])
    .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])


        
    var stackedData = d3.stack()
                        .keys(selected_types)
                        (stack_data_formating)   

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


    createXAxisLabel(svg, "Selected generation & primary type", (dimensions.width)/4, dimensions.height-dimensions.margin.bottom +40)


    createYAxisLabel(svg, "Count of Pokemon", -200, 0)


    function createSelectAll(ele, i, xLabel){

      var groupedData = new Map(d3.rollup(dataset, v => v.length,d => d['secondary_type']))
      console.log(dataset.length)
      var dataSelectedHeatmap = []
      //transforming the data in the right format
      for (let [key, value] of groupedData){
        dataSelectedHeatmap.push({"type": key, "gen": i, "count": value})
      }
      var svg = d3.select("#selected_heatmap")
        .style("width", dimensions.width)
        .style("height", dimensions.height)
      
      //remove last selected visualization
      svg.selectAll('*').remove()

      d3.select(ele)
      .style("font-size", "10px")
      .attr("class", "unselected")

      generations = d3.map(dataSelectedHeatmap, d => d.gen)
      var selected_types = d3.map(dataSelectedHeatmap, d => d.type)

      var obj = {}
      dataSelectedHeatmap.forEach(function(d){
        obj[d.type] = d.count
      })
      var stack_data_formating = [obj]

      var xScale = d3.scaleBand()
      .domain(generations)
      .range([dimensions.margin.left ,dimensions.width/4])

      var yScale = d3.scaleLinear()
      .domain([0, dataset.length])
      .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])

      var stackedData = d3.stack()
                          .keys(selected_types)
                          (stack_data_formating)

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
      
      createXAxisLabel(svg, xLabel, (dimensions.width)/4 , dimensions.height-dimensions.margin.bottom +40)
      createYAxisLabel(svg, "COunt of Pokemon", -200, 0)
  
    }



        function createHeatmap(ele, filteredData, i, xLabel){

          var groupedData = new Map(d3.rollup(filteredData, v => v.length,d => d['secondary_type']))
          var dataSelectedHeatmap = []
          //transforming the data in the right format
          for (let [key, value] of groupedData){
            dataSelectedHeatmap.push({"type": key, "gen": i, "count": value})
          }
          var svg = d3.select("#selected_heatmap")
            .style("width", dimensions.width)
            .style("height", dimensions.height)
          
          //remove last selected visualization
          svg.selectAll('*').remove()

          d3.select(ele)
          .style("font-size", "18px")
          .attr("class", "selected")

          generations = d3.map(dataSelectedHeatmap, d => d.gen)
          var selected_types = d3.map(dataSelectedHeatmap, d => d.type)

          var obj = {}
          dataSelectedHeatmap.forEach(function(d){
            obj[d.type] = d.count
          })
          var stack_data_formating = [obj]

          var xScale = d3.scaleBand()
          .domain(generations)
          .range([dimensions.margin.left ,dimensions.width/4])

          var yScale = d3.scaleLinear()
          .domain([0, filteredData.length])
          .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])

          var stackedData = d3.stack()
                              .keys(selected_types)
                              (stack_data_formating)

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
          
          createXAxisLabel(svg, xLabel, (dimensions.width)/4 , dimensions.height-dimensions.margin.bottom +40)
          createYAxisLabel(svg, "COunt of Pokemon", -200, 0)
      
        }

        function createSpecificHeatmap(ele, filteredData, i){
          // selected heatmap
          var groupedData = new Map(d3.rollup(filteredData, v => v.length,d => d['secondary_type']))
          var dataSelectedHeatmap = []
          //transforming the data in the right format
          for (let [key, value] of groupedData){
            dataSelectedHeatmap.push({"type": key, "gen": i.gen, "count": value})
          }


          var svg = d3.select("#selected_heatmap")
                          .style("width", dimensions.width)
                          .style("height", dimensions.height)
          svg.selectAll('*').remove()
          d3.select(ele)
          .attr("stroke", "black")
          .attr("class", "selected")


          generations = d3.map(dataSelectedHeatmap, d => d.gen)
          generations.forEach((d, j) => generations[j] = generations[j] + ", " + i.type)
          var selected_types = d3.map(dataSelectedHeatmap, d => d.type)

          var obj = {}
          dataSelectedHeatmap.forEach(function(d){
            obj[d.type] = d.count
          })
          var stack_data_formating = [obj]

          var xScale = d3.scaleBand()
          .domain(generations)
          .range([dimensions.margin.left ,dimensions.width/4])

          var yScale = d3.scaleLinear()
          .domain([0, i.count])
          .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])

          var stackedData = d3.stack()
                              .keys(selected_types)
                              (stack_data_formating)

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

        }

        function filterDataByGeneration(i){
          var filtered = dataset.filter(function(d){return (d.gen == i)})
          filtered.forEach(function(d){
            if(d.secondary_type == ""){
              d.secondary_type = "none"
            }
          })
          return filtered
        }

        function filterDataByPrimaryType(i){
          var filtered = dataset.filter(function(d){return (d.primary_type == i)})
          filtered.forEach(function(d){
            if(d.secondary_type == ""){
              d.secondary_type = "none"
            }
          })
          return filtered
        }

        function filterDataByGenAndType(gen, type){
          var filtered = dataset.filter(function(d){return (d.primary_type == type && d.gen == gen)})
          filtered.forEach(function(d){
            if(d.secondary_type == ""){
              d.secondary_type = "none"
            }
          })
          return filtered
        }

        function checkSelection(){
          if(previousElement != 0){
            d3.select(previousElement).attr("stroke", "none").attr("class", "unselected")
          }
          if(previousXYElement != 0){
            d3.select(previousXYElement).attr("class", "unselected").style("font-size", "10px")
          }
        }
                  
        function createXAxisLabel(svg, labelText, x, y){
          svg.append("text")
          .attr("class", "x label")
          .attr("text-anchor", "end")
          .attr("x", x)
          .attr("y",y)
          .text(labelText);
        }

        function createYAxisLabel(svg, labelText, x, y){
          svg.append("text")
              .attr("class", "y label")
              .attr("text-anchor", "end")
              .attr("x", x)
              .attr("y", y)
              .attr("dy", ".75em")
              .attr("transform", "rotate(-90)")
              .text(labelText);
        }
    }