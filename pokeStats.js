var stats = ["HP", "Attack", "Defense", "Special Attack", "Special Defense", "Speed"]
var statIds = ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"]

var drawByName;

export function drawStats(name){
  drawByName(name);
}

export function pokeStats(dataset){
  var dimensions = {
    width: 300,
    height: 200,
    margin:{
        top: 10,
        bottom: 80,
        right: 100,
        left: 80
    }
  }

  var svg = d3.select("#stats")
    .style("width", dimensions.width)
    .style("height", dimensions.height)

  var x = d3.scaleBand()
    .range([ dimensions.margin.left, dimensions.width - dimensions.margin.right ])
    .domain(stats)
    .padding(0.2);

  svg.append("g")
  .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)
  .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  var y = d3.scaleLinear()
    .domain([0, 255])
    .range([ dimensions.height-dimensions.margin.bottom, dimensions.margin.top]);

  svg.append("g")
    .call(d3.axisLeft(y))
    .style("transform", `translateX(${dimensions.margin.left}px)`)

    var current = dataset.filter(d => d.english_name == 'Bulbasaur')[0]

  var image = svg.append("svg:image")
    .attr('x', dimensions.width - dimensions.margin.left)
    .attr('y', dimensions.margin.top)
    .attr('width', 80)
    .attr('height', 80)
    .attr("xlink:href", `https://img.pokemondb.net/artwork/bulbasaur.jpg`);

  var bars = svg.selectAll("mybar")
    .data(stats)
    .enter()
    .append("rect")
      .attr("x", function(d, i) { console.log(d); return x(d); })
      .attr("y", function(d, i) { console.log(current[statIds[i]]); return y(current[statIds[i]]); })
      .attr("width", x.bandwidth())
      .attr("height", function(d, i) { return dimensions.height - dimensions.margin.bottom - y(current[statIds[i]]); })
      .attr("fill", "#69b3a2")
  
  drawByName = (name) => {
  var current = dataset.filter(d => d.english_name == name)[0]

  bars.transition()
    // .data(stats)
    // .enter()
      .attr("y", function(d, i) { console.log(current[statIds[i]]); return y(current[statIds[i]]); })
      .attr("height", function(d, i) { return dimensions.height - dimensions.margin.bottom - y(current[statIds[i]]); })

  name.toLowerCase()
  image
        .attr("xlink:href", `https://img.pokemondb.net/artwork/${name.toLowerCase()}.jpg`);
  }
}