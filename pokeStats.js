var stats = ["HP", "Attack", "Defense", "Special Attack", "Special Defense", "Speed"]
var statIds = ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"]

var drawByName;

export function drawStats(name, num = 0){
  drawByName(name, num);
}

function getImageName(name){
  switch(name){
    case "Nidoran♂":
      return "nidoran-m"
    case "Nidoran♀":
      return "nidoran-f"
    case "Farfetch'd":
      return "farfetchd"
    case "Mr. Mime":
      return "mr-mime"
    case "Mime Jr.":
      return "mime-jr"
    case "Giratina":
      return "giratina-altered"
    case "Shaymin":
      return "shaymin-land"
    case "Flabébé":
      return "flabebe"
    case "Oricorio":
      return "oricorio-baile"
    case "Lycanroc":
      return "lycanroc-midday"
    case "Wishiwashi":
      return "wishiwashi-solo"
    case "Tapu Koko":
      return "tapu-koko"
    case "Tapu Lele":
      return "tapu-lele"
    case "Tapu Bulu":
      return "tapu-bulu"
    case "Tapu Fini":
      return "tapu-fini"
    case "Sirfetch'd":
      return "sirfetchd"
    case "Mr. Rime":
      return "mr-rime"
    case "Eiscue":
      return "eiscue-ice"
    case "Morpeko":
      return "morpeko-full-belly"
    case "Urshifu":
      return "urshifu-single-strike"
    case "Type: Null":
      return "type-null"
    default:
      return name.toLowerCase()
  }
}

export function pokeStats(dataset){
  var dimensions = {
    num: 3,
    width: 300,
    height: 200,
    margin:{
        top: 10,
        bottom: 80,
        right: 100,
        left: 100
    }
  }

  var svg = d3.select("#stats")
    .style("width", dimensions.width * dimensions.num + 100)
    .style("height", dimensions.height)

  var x = d3.scaleBand()
    .range([ dimensions.margin.left, dimensions.width - dimensions.margin.right ])
    .domain(stats)
    .padding(0.2);

  var y = d3.scaleLinear()
    .domain([0, 255])
    .range([ dimensions.height-dimensions.margin.bottom, dimensions.margin.top]);

  for(var n = 0; n < dimensions.num; n++){
    svg.append("g")
    .attr("transform", `translate(${dimensions.width*n},${dimensions.height-dimensions.margin.bottom})`)
    .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
  
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("transform", `translateX(${dimensions.margin.left + dimensions.width*n}px)`)

  }

  var types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"]
  var typeColors = ["#A8A77A", "#EE8130", "#6390F0", "#F7D02C", "#7AC74C", "#96D9D6", "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A", "#B6A136", "#735797", "#6F35FC", "#705746", "#B7B7CE", "#D685AD"]

  var color = d3.scaleOrdinal()
      .domain(types)
      .range(typeColors);

  var current = dataset.filter(d => d.english_name == 'Bulbasaur')[0]
  
  var bars = new Array(dimensions.num)
  var images = new Array(dimensions.num)
  var names = new Array(dimensions.num)
  var types = new Array(dimensions.num)
  for(var n = 0; n < dimensions.num; n++){
    current = dataset.filter(d => d.national_number == n+1)[0]
    bars[n] = svg.selectAll("mybar")
    .data(stats)
    .enter()
    .append("rect")
      .attr("x", function(d, i) { return (x(d)) + (dimensions.width*n); })
      .attr("y", function(d, i) { return y(current[statIds[i]]); })
      .attr("width", x.bandwidth())
      .attr("height", function(d, i) { return dimensions.height - dimensions.margin.bottom - y(current[statIds[i]]); })
      .attr("fill", "#69b3a2")
    images[n] = svg.append("svg:image")
      .attr('x', dimensions.width*(n+1) - dimensions.margin.right + 20)
      .attr('y', dimensions.margin.top + 30)
      .attr('width', 80)
      .attr('height', 80)
      .attr("xlink:href", `https://img.pokemondb.net/artwork/${getImageName(current.english_name)}.jpg`);
    names[n] = 
    svg.append('text')
      .attr('x', dimensions.width*(n+1) - dimensions.margin.right + 20)
      .attr('y', dimensions.margin.top + 10)
      .style("font-size", "14px")
      .attr("dx", "-.8em")
      .attr("dy", "0em")
      .attr("font-family", "sans-serif")
    names[n].text("Name: " + current.english_name)

    types[n] =
        svg.append('text')
        .attr('x', dimensions.width*(n+1) - dimensions.margin.right + 20)
        .attr('y', dimensions.margin.top + 10)
        .style("font-size", "14px")
        .attr("dx", "-.8em")
        .attr("dy", "1em")
        .attr("font-family", "sans-serif")
    types[n]
        .text("Type: ")
        .append('tspan')
          .style('fill', color(current.primary_type))
          .text(current.primary_type)
    if(current.secondary_type != "none"){
      types[n]
      .append('tspan')
        .text(' / ')
        .style("fill", "black")
      .append('tspan')
      .style('fill', color(current.secondary_type))
        .text(current.secondary_type)
    }
  }
  
  drawByName = (name, num) => {
    if(!name){
      bars[num].transition()
        .attr("y", function(d, i) { return y(0); })
        .attr("height", function(d, i) { return dimensions.height - dimensions.margin.bottom - y(0); })
      images[num]
          .attr("xlink:href", null);

      names[num].text("")

      types[num].text("")
    }
    else{
      var current = dataset.filter(d => d.english_name == name)[0]

      bars[num].transition()
          .attr("y", function(d, i) { return y(current[statIds[i]]); })
          .attr("height", function(d, i) { return dimensions.height - dimensions.margin.bottom - y(current[statIds[i]]); })

      images[num]
            .attr("xlink:href", `https://img.pokemondb.net/artwork/${getImageName(name)}.jpg`);

      names[num].text("Name: " + current.english_name);
      types[num]
        .text("Type: ")
        .append('tspan')
        .text(current.primary_type)
        .style('fill', color(current.primary_type))
      if(current.secondary_type != "none"){
        types[num].append('tspan')
          .text(' / ')
          .style("fill", "black")
        .append('tspan')
        .style('fill', color(current.secondary_type))
          .text(current.secondary_type)
      }
    }
  }
}