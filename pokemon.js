var width = 500
var height = 500

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

    // create barchart
    var pokemonGenCount = new Map(d3.rollup(dataset, v => v.length, d => d['gen']))

    var svg = d3.select("#barchart")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)
                       
    var xScale = d3.scaleBand()
                    .domain(d3.map(pokemonGenCount, d => d[0]))
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
        d3.select(this)
        .attr("stroke", "black")
        text.attr("x",  xScale(i[0]) + xScale.bandwidth()/2)
        .attr("y",yScale(+i[1])- 10)
        .text(d.srcElement.__data__[1])
    })
    .on("mouseout", function(){
        d3.select(this)
        .attr("stroke", "none")

        text.text("")
    })
    .attr("x", d => xScale(d[0]))
    .attr("y", d => yScale(+d[1]))
    .attr("height", d => dimensions.height-dimensions.margin.bottom - yScale(+d[1]))
    .attr("width", xScale.bandwidth())
    .style("fill", "#AAB0B7")

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
        .text("Count of Pokemon");
    
  }
)























