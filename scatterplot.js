import { drawStats } from "./pokeStats.js";

var maxSelected = 3; //should be same as num in pokeStats
var sinceSelected = [0, 0, 0];
var selected = [null, null, null] 

//filters
var types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy", "none"]
var typeColors = ["#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A", "#B6A136", "#735797", "#6F35FC", "#705746", "#B7B7CE", "#D685AD", "#555151"]
var typesVisible = {}
types.forEach((element, index) => {
  typesVisible[element] = true;
});

var gens = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]
var gensVisible = {}
gens.forEach((element, index) => {
  gensVisible[element] = true;
});

var genTypesVisible = new Array(gens.length)
for(var i = 0; i < gens.length; i++){
  genTypesVisible[i] = new Array(types.length).fill(true)
}

var finalEvolutionOnly = false;

var update;

export function scatterplot(dataset){
  var dimensions = {
    width: 700,
    height: 400,
    margin:{
        top: 50,
        bottom: 50,
        right: 20,
        left: 50
    }
  }

  console.log(dimensions)

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
      .domain(types)
      .range(typeColors);

  //handle filters
  function nodeFilter(d){
    return genTypesVisible[gens.indexOf(d.gen)][types.indexOf(d.primary_type)] && (!finalEvolutionOnly || d.is_final_evo == "TRUE")
  }

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
      d.r = 3;
    }
  );

  var xStr = 0.1
  var yStr = 0.8
  var collideStr = 1
  var layout = d3.forceSimulation(dataset.filter(function(d) { return nodeFilter(d) }))
              .force('x', d3.forceX(d => x(d)).strength(xStr))
              .force('y', d3.forceY(d => y(d)).strength(yStr))
              .force('collisions', d3.forceCollide(d => d.r).strength(collideStr))
              .on("tick", tick)

  function drawNodes(){
    var n = svg.append("g")
              .selectAll(".dot")
              .data(dataset.filter(function(d) { return nodeFilter(d) }))
              .enter()
              .append("circle")
                .attr("class", "dot")
                .attr("id", d => {d.english_name})
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("fill", d => d.color)
              .on('mouseover', function(d, i){
                  d3.select(this).attr("stroke", "black")
                  .attr("stroke-width", "2px")
                  .style("cursor", "pointer")

                  text1.text("Pokemon: " + i.english_name)
                  text2.text("Base Stat Total" + ": " + yAccessor(i))
              })
              .on('mouseout', function(d, i){
                if(!selected.includes(i.english_name)){
                  d3.select(this)
                  .attr("stroke-width", "0px")
                }
              })
              .on('click', function(d, i){
                if(!selected.includes(i.english_name)){
                  var ind = selected.indexOf(null)
                  if(ind == -1){
                    var max = Math.max(...sinceSelected);
                    ind = sinceSelected.indexOf(max)
                    d3.select(`#${selected[ind]}`)
                      .attr("stroke-width", "0px")
                  }
                  selected[ind] = i.english_name;
                  for(var num = 0; num < maxSelected; num++){
                    sinceSelected[num]++;
                  }
                  sinceSelected[ind] = 0;
                  drawStats(i.english_name, ind)

                  d3.select(this).attr("stroke", "black")
                  .attr("stroke-width", "2px")
                }
                else{
                  var ind = selected.indexOf(i.english_name);
                  selected[ind] = null;
                  drawStats(null, ind)
                  
                  d3.select(this)
                    .attr("stroke-width", "0px")
                }
              })
    
    n.transition().duration(500)
    .attr("r", d => d.r)

    return n
  }

  var node = drawNodes();

  var xAxisGen = d3.axisBottom().scale(xScale)
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
      .attr("x", dimensions.width/2)
      .attr("y", dimensions.height-dimensions.margin.bottom + 50)
      .text("Generations");
  
  update = () => {

    layout.nodes(dataset.filter(function(d) { return nodeFilter(d) }));
    layout.force('x', d3.forceX(d => x(d)).strength(xStr))
              .force('y', d3.forceY(d => y(d)).strength(yStr))
              .force('collisions', d3.forceCollide(d => d.r).strength(collideStr))
              .on("tick", tick)
    layout.alpha(1).restart();

    node.filter(function(d) { return !nodeFilter(d) }).transition().duration(500).attr("r", 0)
    node.filter(function(d) { return nodeFilter(d) }).transition().duration(500).attr("r", d => d.r)
  }

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
}

//process heatmap selections
// visibleGens: object with gens and true/false
// visibleTypes: object with types and true/false
// finalEvolution: boolean, true is showing final evolutions only
export function updateFilters(visibleGenTypes = genTypesVisible, finalEvolution = finalEvolutionOnly){
  if(visibleGenTypes.every(i => i.every(j => j === false))){
    for(var i = 0; i < gens.length; i++){
      genTypesVisible[i] = new Array(types.length).fill(true)
    }
  }
  else{
    for(var i = 0; i < genTypesVisible.length; i++)
      for(var j = 0; j < genTypesVisible[i].length; j++)
        genTypesVisible[i][j] = visibleGenTypes[i][j]
  }
  finalEvolutionOnly = finalEvolution;
  update()
};