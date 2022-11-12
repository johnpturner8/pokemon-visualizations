d3.csv("pokemon.csv").then(
  function(dataset){

    var dimensions = {
      width: 1050,
      height: 600,
      margin:{
          top: 50,
          bottom: 50,
          right: 150,
          left: 50
      }
    }

    var svg = d3.select("#scatterplot")
      .style("width", dimensions.width)
      .style("height", dimensions.height)

    var xAccessor = d => d.gen
    var yAccessor = d => d.base_stat_total   

    var xScale = d3.scaleBand()
                       .domain(dataset.map(xAccessor))
                       .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])

    var yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset.map(d => yAccessor(d)))])
                .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])

    var types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"]
    var typeColors = ["#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A", "#B6A136", "#735797", "#6F35FC", "#705746", "#B7B7CE", "#D685AD"]
    // var typesVisible = new Array(types.size).fill(true)
    var typesVisible = {}
    types.forEach((element, index) => {
      typesVisible[element] = true;
    });
    // typesVisible['normal'] = true;

    //Color scale
    var color = d3.scaleOrdinal()
        .domain(types)
        .range(typeColors);
    
    //make color legend
    var size = 15
    legend = svg.selectAll("myLegend")
      .data(types)
      .enter()
      .append("g")
    
    legendBoxes = legend.append("rect")
      .attr("x", dimensions.width - dimensions.margin.right + 25)
      .attr("y", function(d,i){ return dimensions.margin.top + i*(size+5)}) 
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d, i){ return typeColors[i]})
        
    legendText = legend.append("text")
      .attr("x", dimensions.width - dimensions.margin.right + 25 + size*1.2)
      .attr("y", function(d,i){ return dimensions.margin.top + i*(size+5) + (size/2)}) 
      .style("fill", function(d, i){ return typeColors[i]})
      .text(function(d){ return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

    var select = svg.append("text")
      .attr("x", dimensions.width - dimensions.margin.right + 25)
      .attr("y", dimensions.margin.top + (types.length)*(size+5) + size) 
      .style("fill", "black")
      .text("Select All")
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
    
    var unselect = svg.append("text")
      .attr("x", dimensions.width - dimensions.margin.right + 25)
      .attr("y", dimensions.margin.top + (types.length+1)*(size+5) + size) 
      .style("fill", "black")
      .text("Unselect All")
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

    var text1 = svg
                .append('text')
                .attr("id", 'topbartext')
                .attr("x", dimensions.width - dimensions.margin.right - 200)
                .attr("y", dimensions.margin.top - 30)
                .attr("dx", "-.8em")
                .attr("dy", "0em")
                .attr("font-family", "sans-serif")
                .text("Pokemon: ")

    var text2 = svg
                .append('text')
                .attr("id", 'topbartext')
                .attr("x", dimensions.width - dimensions.margin.right - 200)
                .attr("y", dimensions.margin.top - 30)
                .attr("dx", "-.8em")
                .attr("dy", "1.2em")
                .attr("font-family", "sans-serif")
                .text("Base Stat Total: ")

    x = d => xScale(xAccessor(d))+xScale.bandwidth()/2
    y = d => yScale(yAccessor(d))

    

    dataset.forEach(
      function(d) {
        d.x = x(d);
        d.y = y(d);
        d.color = color(d.primary_type);
        d.r = 4;
      }
    );

    var xStr = 0.1
    var yStr = 0.8
    var collideStr = 1
    var layout = d3.forceSimulation(dataset.filter(function(d) { return typesVisible[d.primary_type] }))
                .force('x', d3.forceX(d => x(d)).strength(xStr))
                .force('y', d3.forceY(d => y(d)).strength(yStr))
                .force('collisions', d3.forceCollide(d => d.r).strength(collideStr))
                .on("tick", tick)

    function drawNodes(){
      console.log(typesVisible)
      var n = svg.append("g")
                .selectAll(".dot")
                .data(dataset.filter(function(d) { return typesVisible[d.primary_type] }))
                .enter()
                .append("circle")
                // .filter(function(d) { return typesVisible[d.primary_type] })
                  .attr("class", "dot")
                  .attr("cx", d => d.x)
                  .attr("cy", d => d.y)
                  // .transition().duration(500)
                  // .attr("r", d => d.r)
                  .attr("fill", d => d.color)
                .on('mouseover', function(d, i){
                    d3.select(this).attr("stroke", "black")
                    .attr("stroke-width", "2px")
                    text1.text("Pokemon: " + i.english_name)
                    text2.text("Base Stat Total" + ": " + yAccessor(i))
                })
                .on('mouseout', function(d, i){
                    d3.select(this)
                    .attr("stroke-width", "0px")
                })
      
      n.transition().duration(500)
      .attr("r", d => d.r)

      return n
    }

    var node = drawNodes();

    // console.log(averages)

    function drawLine(){
      totals = new Array(8).fill(0)
      counts = new Array(8).fill(0)
      averages = new Array(8).fill(0.0)
      generations = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
      dataset.filter(function(d) { return typesVisible[d.primary_type] }).forEach(d => {
        totals[d.gen_numerical - 1] += parseInt(yAccessor(d));
        counts[d.gen_numerical - 1]++;
      })
      for(let i = 0; i < 8; i++){
        if(totals[i] == 0)
          averages[i] = 0
        else
          averages[i] = totals[i] / counts[i];
      }

      var line = svg.append("g")
                  .selectAll("circle")
                  .data(averages)
                  .enter()
                  .append('line')
                  .style("stroke", "red")
                  .style("stroke-width", 2)
      // .transition().duration(500)
      .attr("x1", function(d,i) {
        if(i == 0)
          return xScale(generations[0]);
        return xScale(generations[i-1])+xScale.bandwidth()/2
      })
      .attr("x2", function(d, i) {
        return xScale(generations[i])+xScale.bandwidth()/2
      })
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      // .transition().duration(500)
      // .attr("y1", function(d,i) {
      //   if(i == 0)
      //     return yScale(0);
      //   return yScale(averages[i-1])
      // })
      // .attr("x2", function(d,i) {
      //   if(i == 0)
      //     return xScale(generations[0]);
      //   return xScale(generations[i-1])+xScale.bandwidth()/2
      // })
      // // .transition().duration(500)
      // .attr("y2", function(d,i) {
      //   if(i == 0)
      //     return yScale(0);
      //   return yScale(averages[i-1])
      // })

      
      // .transition()
      
      line
      .transition().duration(500)
      .attr("y1", function(d,i) {
        if(i == 0)
          return yScale(0);
        return yScale(averages[i-1])
      })
      .attr("y2", function(d,i) {
        console.log(d)
        return yScale(d)
      })

      return line
    }

    var line = drawLine()

    var xAxisGen = d3.axisBottom().scale(xScale)
    var xAxis = svg.append("g")
                    .call(xAxisGen)
                    .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

    var yAxisGen = d3.axisLeft().scale(yScale)
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)

    //handle filters
    // console.log(typesVisible)
    function update(){
      layout = d3.forceSimulation(dataset.filter(function(d) { return typesVisible[d.primary_type] }))
                .force('x', d3.forceX(d => x(d)).strength(xStr))
                .force('y', d3.forceY(d => y(d)).strength(yStr))
                .force('collisions', d3.forceCollide(d => d.r).strength(collideStr))
                .on("tick", tick)
      console.log(typesVisible)
      node.filter(function(d) { return !typesVisible[d.primary_type] }).transition().duration(500).attr("r", 0)
      node.filter(function(d) { return typesVisible[d.primary_type] }).transition().duration(500).attr("r", d => d.r)

      totals = new Array(8).fill(0)
      counts = new Array(8).fill(0)
      averages = new Array(8).fill(0.0)
      generations = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
      dataset.filter(function(d) { return typesVisible[d.primary_type] }).forEach(d => {
        totals[d.gen_numerical - 1] += parseInt(yAccessor(d));
        counts[d.gen_numerical - 1]++;
      })
      for(let i = 0; i < 8; i++){
        if(totals[i] == 0)
          averages[i] = 0
        else
          averages[i] = totals[i] / counts[i];
      }

      line
      .transition().duration(500)
      .attr("y1", function(d,i) {
        if(i == 0)
          return yScale(0);
        return yScale(averages[i-1])
      })
      .attr("y2", function(d,i) {
        return yScale(averages[i])
      })
    }

    legend.on("mouseover", function(d) { d3.select(this).style("cursor", "pointer") })
          .on("click", function(d, i){
            typesVisible[i] = !typesVisible[i]
            d3.select(this).style("opacity", typesVisible[i] ? 1:0.2)
            update()
          })

    select.on("mouseover", function(d) { d3.select(this).style("cursor", "pointer") })
          .on("click", function(){

            Object.keys(typesVisible).forEach(key => {
              typesVisible[key] = true
            })
            legend.style("opacity", 1)
            update()
          })
    unselect.on("mouseover", function(d) { d3.select(this).style("cursor", "pointer") })
          .on("click", function(){

            Object.keys(typesVisible).forEach(key => {
              typesVisible[key] = false
            })
            legend.style("opacity", 0.2)
            update()
          })

  function tick(e) {
    svg.selectAll(".dot").attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
})