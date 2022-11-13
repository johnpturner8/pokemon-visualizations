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

    var finalEvolutionOnly = false;
    var setEvolution = svg.append("text")
      .attr("x", dimensions.width - dimensions.margin.right + 25)
      .attr("y", dimensions.margin.top + (types.length+2)*(size+5) + size*2) 
      .style("fill", "black")
      .text("Show final evolutions only")
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

    var x = d => xScale(xAccessor(d))+xScale.bandwidth()/2
    var y = d => yScale(yAccessor(d))

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
                  .attr("class", "dot")
                  .attr("cx", d => d.x)
                  .attr("cy", d => d.y)
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

    function drawLine(){
      totals = new Array(8).fill(0)
      counts = new Array(8).fill(0)
      averages = new Array(8).fill(0.0)
      generations = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
      dataset.filter(function(d) { return typesVisible[d.primary_type] }).forEach(d => {
        totals[d.gen_numeric - 1] += parseInt(yAccessor(d));
        counts[d.gen_numeric - 1]++;
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
      
      line
      .transition().duration(500)
      .attr("y1", function(d,i) {
        if(i == 0)
          return yScale(0);
        return yScale(averages[i-1])
      })
      .attr("y2", function(d,i) {
        // console.log(d)
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
    function nodeFilter(d){
      return typesVisible[d.primary_type] && (!finalEvolutionOnly || d.is_final_evo == "TRUE")
    }

    function updateLine(){
      totals = new Array(8).fill(0)
      counts = new Array(8).fill(0)
      averages = new Array(8).fill(0.0)
      generations = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
      dataset.filter(function(d) { return nodeFilter(d) }).forEach(d => {
        totals[d.gen_numeric - 1] += parseInt(yAccessor(d));
        counts[d.gen_numeric - 1]++;
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
    
    function update(){
      // node.transition()
      //   .duration(2000)
      //   .attr("cx", d => d.x)
      //   .attr("cy", d => d.y)

      layout.nodes(dataset.filter(function(d) { return nodeFilter(d) }));
      layout.force('x', d3.forceX(d => x(d)).strength(xStr))
                .force('y', d3.forceY(d => y(d)).strength(yStr))
                .force('collisions', d3.forceCollide(d => d.r).strength(collideStr))
                .on("tick", tick)
      layout.alpha(1).restart();

      // layout = d3.forceSimulation(dataset.filter(function(d) { return typesVisible[d.primary_type] }))
      //           .force('x', d3.forceX(d => x(d)).strength(xStr))
      //           .force('y', d3.forceY(d => y(d)).strength(yStr))
      //           .force('collisions', d3.forceCollide(d => d.r).strength(collideStr))
      //           .on("tick", tick)

      node.filter(function(d) { return !nodeFilter(d) }).transition().duration(500).attr("r", 0)
      node.filter(function(d) { return nodeFilter(d) }).transition().duration(500).attr("r", d => d.r)

      updateLine()
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

    setEvolution.on("mouseover", function(d) { d3.select(this).style("cursor", "pointer") })
                .on("click", function(){
                  d3.select(this).text(finalEvolutionOnly ? "Show final evolutions only":"Show all evolutions")
                  finalEvolutionOnly = !finalEvolutionOnly
                  update()
                })

    d3.select("#stat").on('change', function(d){
      var selectedOption = d3.select(this).property("value")

      yAccessor = d => parseInt(d[selectedOption])

      yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset.map(d => yAccessor(d)))])
                .range([dimensions.height-dimensions.margin.bottom, dimensions.margin.top])

      yAxisGen = d3.axisLeft().scale(yScale)
      yAxis.transition().call(yAxisGen)

      x = d => xScale(xAccessor(d))+xScale.bandwidth()/2
      y = d => yScale(yAccessor(d))

      dataset.forEach(
        function(d) {
          d.x = x(d);
          d.y = y(d);
        }
      );
      
      update()
    })

  function tick(e) {
    svg.selectAll(".dot").attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
})