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
        d.color = "green";
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