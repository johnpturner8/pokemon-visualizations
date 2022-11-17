import {updateFilters} from './scatterplot.js'

export function heatmap(dataset){
    var previousElement = 0
    var previousColor = 0
    var previousXYElement = 0
    var previousFontSize = 0 
    var selectedGenType = []
    var gens = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]
    var types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy", "none"]
    var typeColors = ["#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A", "#B6A136", "#735797", "#6F35FC", "#705746", "#B7B7CE", "#D685AD", "#555151"]

//  initialize adjacency matrix which represent what type and gen is selected in the heatmap
    for (let i = 0; i < gens.length; i++) {
      selectedGenType[i] = new Array()
      for (let j = 0; j < types.length; j++) {
        selectedGenType[i][j] = false
      }
    }

    var dimensions = {
      width: 400,
      height: 400,
      margin:{
          top: 50,
          bottom: 50,
          right: 20,
          left: 50
      }
    }

    dataset.forEach(function(d){
      if(d.secondary_type == ""){
        d.secondary_type = "none"
      }
    })

    console.log(dimensions)
        
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
                    
    var xScale = d3.scaleBand()
      .domain(gens)
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
        d3.select(this)
        .attr("stroke", "none")

        deselect([i.gen], [i.type])
      }else if (d3.select(this).attr("class") == "selected"){
        d3.select(this)
        .attr("stroke", "none")
        .attr("class", "unselected")

        deselect([i.gen], [i.type])
      }else{
        d3.select(this)
                      .style("font-size", "18px")
                      .attr("class", "selected")

        previousColor = d3.select(this).style("fill")
        previousElement = this

        select([i.gen], [i.type])

        createYAxisLabel(svg, "Count of secondary types from the selected primary types in the heatmap", -200, 0)
      }
      updateFilters(selectedGenType);
      updateSelections();
      createStackedBars();
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
    .style("text-anchor", "middle")
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
                    d3.select(this)
                    .style("font-size", "10px")
                    deselect([i], types)
                  }else if (d3.select(this).attr("class") == "selected"){
                    d3.select(this)
                    .style("font-size", "10px")
                    .attr("class", "unselected")
                    deselect([i], types)
                  }else{
                    d3.select(this)
                      .style("font-size", "18px")
                      .attr("class", "selected")

                    previousXYElement = this
          
                    select([i], types)
                  }
                  updateFilters(selectedGenType);
                  updateSelections();
                  createStackedBars()
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
                    d3.select(this)
                    .style("font-size", "10px")
                    deselect(gens, [i])
                  }else if (d3.select(this).attr("class") == "selected"){
                    d3.select(this)
                    .style("font-size", "10px")
                    .attr("class", "unselected")
                    deselect(gens, [i])
                  }else{
                    d3.select(this)
                      .style("font-size", "18px")
                      .attr("class", "selected")

                    previousXYElement = this
              
                    select(gens, [i])                    
                  }
                  updateFilters(selectedGenType);
                  updateSelections();
                  createStackedBars()
                })

    yAxis.select(".tick text")
      .style("fill", function(d, i){ return typeColors[i]})
    

    createXAxisLabel(svg, "Generations", (dimensions.width)/2, dimensions.height-dimensions.margin.bottom+ 50)

    createYAxisLabel(svg, "Primary type", -200, 0)


    // selected heatmap
    var groupedData = new Map(d3.rollup(dataset, v => v.length,d => d['secondary_type']))
    var dataSelectedHeatmap = []
    //transforming the data in the right format
    for (let [key, value] of groupedData){
      dataSelectedHeatmap.push({"type": key, "count": value})
    }


    var svg = d3.select("#selected_heatmap")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)
    
    var obj = {}
    dataSelectedHeatmap.forEach(function(d){
      obj[d.type] = d.count
    })
    var stack_data_formating = [obj]

    var xScale = d3.scaleBand()
    .domain(["selected fields"])
    .range([dimensions.margin.left, dimensions.width/4])

    var yScale = d3.scaleLinear()
    .domain([0, dataset.length])
    .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])

    // var xAxisGen = d3.axisBottom(xScale)
    // var xAxis = svg.append("g")
    //             .call(xAxisGen)
    //             .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

    const yAxisTicks = yScale.ticks().filter(tick => Number.isInteger(tick));
    var yAxisGen = d3.axisLeft().scale(yScale).tickValues(yAxisTicks).tickFormat(d3.format("d"));
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)
        
    var stackedData = d3.stack()
                        .keys(types)
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

    createYAxisLabel(svg, "Count of secondary types from the selected primary types in the heatmap", -200, 0)


    function createSelectAll(ele, i, xLabel){

      var groupedData = new Map(d3.rollup(dataset, v => v.length,d => d['secondary_type']))
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

      var selected_types = d3.map(dataSelectedHeatmap, d => d.type)

      var obj = {}
      dataSelectedHeatmap.forEach(function(d){
        obj[d.type] = d.count
      })
      var stack_data_formating = [obj]

      var xScale = d3.scaleBand()
      .domain(["selected fields"])
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


      // var xAxisGen = d3.axisBottom(xScale)
      // var xAxis = svg.append("g")
      //             .call(xAxisGen)
      //             .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

      const yAxisTicks = yScale.ticks().filter(tick => Number.isInteger(tick));
      var yAxisGen = d3.axisLeft().scale(yScale).tickValues(yAxisTicks).tickFormat(d3.format("d"));
      var yAxis = svg.append("g")
                      .call(yAxisGen)
                      .style("transform", `translateX(${dimensions.margin.left}px)`)

            createYAxisLabel(svg, "Count of secondary types from the selected primary types in the heatmap", -200, 0)
  
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

          var selected_types = d3.map(filteredData, d => d.type)

          var obj = {}
          dataSelectedHeatmap.forEach(function(d){
            obj[d.type] = d.count
          })
          var stack_data_formating = [obj]

          var xScale = d3.scaleBand()
          .domain(["selected fields"])
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


          // var xAxisGen = d3.axisBottom(xScale)
          // var xAxis = svg.append("g")
          //             .call(xAxisGen)
          //             .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)
          const yAxisTicks = yScale.ticks().filter(tick => Number.isInteger(tick));
          var yAxisGen = d3.axisLeft().scale(yScale).tickValues(yAxisTicks).tickFormat(d3.format("d"));
          var yAxis = svg.append("g")
                          .call(yAxisGen)
                          .style("transform", `translateX(${dimensions.margin.left}px)`)

          createYAxisLabel(svg, "Count of secondary types from the selected primary types in the heatmap", -200, 0)
      
        }

        // function createStackedBars()

        function createStackedBars(){
          if(selectedGenType.every(i => i.every(j => j === false))){
            filteredData = dataset
          }
          else{
            var filteredData = filterDataByGenAndType2()
          }
          // selected heatmap
          var groupedData = new Map(d3.rollup(filteredData, v => v.length,d => d['secondary_type']))
          var dataSelectedHeatmap = []
          //transforming the data in the right format
          for (let [key, value] of groupedData){
            dataSelectedHeatmap.push({"type": key, "count": value})
          }


          var svg = d3.select("#selected_heatmap")
                          .style("width", dimensions.width)
                          .style("height", dimensions.height)
          svg.selectAll('*').remove()

          var selected_types = d3.map(dataSelectedHeatmap, d => d.type)

          var obj = {}
          dataSelectedHeatmap.forEach(function(d){
            obj[d.type] = d.count
          })
          var stack_data_formating = [obj]

          var xScale = d3.scaleBand()
          .domain(["selected fields"])
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


          // var xAxisGen = d3.axisBottom(xScale)
          // var xAxis = svg.append("g")
          //             .call(xAxisGen)
          //             .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

          const yAxisTicks = yScale.ticks().filter(tick => Number.isInteger(tick));
          var yAxisGen = d3.axisLeft().scale(yScale).tickValues(yAxisTicks).tickFormat(d3.format("d"));
          var yAxis = svg.append("g")
                          .call(yAxisGen)
                          .style("transform", `translateX(${dimensions.margin.left}px)`)
        }



        function filterDataByGenAndType2(){
          return dataset.filter(function(d){return selectedGenType[gens.indexOf(d.gen)][types.indexOf(d.primary_type)]})
          // var filtered = []
          // for (let i = 0; i < gens.length; i++) {
          //   for (let j = 0; j < types.length; j++) {
          //     if(selectedGenType[i][j]){
          //       dataset.filter(function(d){
          //         if ((d.primary_type == types[i] && d.gen == gens[i])){
          //           filtered.push(d)
          //         }
          //       })
          //     }   
          //   }
          // } 

          // filtered.forEach(function(d){
          //   if(d.secondary_type == ""){
          //     d.secondary_type = "none"
          //   }
          // })
          // return filtered
        }


        function deselect(gen, type){
          var gen_idx = []
          var type_idx = []
          gen.forEach(function(d){
            var i = gens.indexOf(d)
            gen_idx.push(i)
          })

          type.forEach(function(d){
            var i = types.indexOf(d)
            type_idx.push(i)
          })

          for (let i = 0; i < gen_idx.length; i++) {
            for (let j = 0; j < type_idx.length; j++) {
              selectedGenType[gen_idx[i]][type_idx[j]] = false
            }
          }
        }


        function select(gen, type){
          var gen_idx = []
          var type_idx = []
          gen.forEach(function(d){
            var i = gens.indexOf(d)
            gen_idx.push(i)
          })

          type.forEach(function(d){
            var i = types.indexOf(d)
            type_idx.push(i)
          })

          for (let i = 0; i < gen_idx.length; i++) {
            for (let j = 0; j < type_idx.length; j++) {
              selectedGenType[gen_idx[i]][type_idx[j]] = true
            }
          }
        }


        // function filterDataByGenAndType(gen, type){
        //   var filtered = dataset.filter(function(d){return (d.primary_type == type && d.gen == gen)})
        //   filtered.forEach(function(d){
        //     if(d.secondary_type == ""){
        //       d.secondary_type = "none"
        //     }
        //   })
        //   return filtered
        // }

        function updateSelections(){
          squares.attr("stroke", "black").attr("stroke-width", function(d){return selectedGenType[gens.indexOf(d.gen)][types.indexOf(d.type)] ? 1 : 0})
                .attr("class", function(d){return selectedGenType[gens.indexOf(d.gen)][types.indexOf(d.type)] ? "selected" : "unselected"})
        }
                  
        function createXAxisLabel(svg, labelText, x, y){
          svg.append("text")
          .attr("class", "x label")
          .attr("text-anchor", "end")
          .attr("x", x)
          .attr("y",y)
          .style("text-anchor", "middle")
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
              .style("text-anchor", "middle")
              .text(labelText);
        }
    }