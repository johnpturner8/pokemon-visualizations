d3.csv("pokemon.csv").then(
  function(dataset){

    var dimensions = {
      width: 1000,
      height: 600,
      margin:{
          top: 50,
          bottom: 50,
          right: 10,
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


    //Color scale
    var color = d3.scaleOrdinal()
        .domain(["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"])
        .range(["#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A", "#B6A136", "#735797", "#6F35FC", "#705746", "#B7B7CE", "#D685AD"]);
        
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

    var layout = d3.forceSimulation(dataset)
                .force('x', d3.forceX(d => x(d)).strength(.05))
                .force('y', d3.forceY(d => y(d)).strength(1))
                .force('collisions', d3.forceCollide(d => d.r))
                .on("tick", tick)

    var node = svg.append("g")
                  .selectAll("circle")
                  .data(dataset)
                  .enter()
                  .append("circle")
                    .attr("class", "dot")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", d => d.r)
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

    totals = new Array(8).fill(0)
    counts = new Array(8).fill(0)
    averages = new Array(8).fill(0.0)
    generations = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
    dataset.forEach(d => {
      totals[d.gen_numerical - 1] += parseInt(yAccessor(d));
      counts[d.gen_numerical - 1]++;
    })
    // console.log(totals)
    // console.log(counts)
    for(let i = 0; i < 8; i++){
      // console.log(totals[i])
      // console.log(counts[i])
      // console.log(totals[i] / counts[i])
      averages[i] = totals[i] / counts[i];
    }
    console.log(averages)

    var line = svg.append("g")
                  .selectAll("circle")
                  .data(averages)
                  .enter()
                  .append('line')
                  .style("stroke", "red")
                  .style("stroke-width", 2)
                  .attr("x1", function(d,i) {
                    console.log(d)
                    console.log(i)
                    if(i == 0)
                      return xScale(generations[0]);
                    return xScale(generations[i-1])+xScale.bandwidth()/2
                  })
                  .attr("y1", function(d,i) {
                    if(i == 0)
                      return yScale(0);
                    return yScale(averages[i-1])
                  })
                  .attr("x2", function(d, i) {
                    return xScale(generations[i])+xScale.bandwidth()/2
                  })
                  .attr("y2", function(d,i) {
                    return yScale(d)
                  }); 

    var xAxisGen = d3.axisBottom().scale(xScale)
    var xAxis = svg.append("g")
                    .call(xAxisGen)
                    .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

    var yAxisGen = d3.axisLeft().scale(yScale)
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)

  function tick(e) {
    svg.selectAll("circle").attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
})