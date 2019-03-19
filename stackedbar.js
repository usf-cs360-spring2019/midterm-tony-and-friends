 // javascript

/* helper method to make translating easier */
var translate = function(x, y) { return "translate(" + x + "," + y + ")"; };

function createChart(seasons, color) {
  d3.csv("DerrickDataModified.csv", function(d) {
    return {
      Year : d["Year of Call Date"] + ", " + d["Call Type"],
      Spring : +d["Spring Percent"],
      Summer : +d["Summer Percent"],
      Fall : +d["Fall Percent"],
      Winter : +d["Winter Percent"],
      Total : +d["Total"]
    };
  }).then(function(data) {
    console.log(data)
    
    var margin = {
      top: 60,
      right: 150,
      bottom: 40,
      left: 125
    };

    // get a map with only the states.
    var years = d3.map(data, function(d) { return d.Year; });
    console.log(years);

    // dataset is used for min/max functionality
    //var numberset = [];
    var percentset = [0];
    var i = 0;
    for (i = 0; i < data.length; i++) {
      //numberset[i] = data[i].Number;
      var temp = data[i]["Spring"];
      percentset.push(temp);
      temp += data[i]["Summer"];
      percentset.push(temp);
      temp += data[i]["Fall"];
      percentset.push(temp);
      temp += data[i]["Winter"];
      percentset.push(temp);
    }
    var xlabels = ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"]

    //console.log(numberset);
    console.log(percentset);
    
    var min = d3.min(percentset);
    var max = d3.max(percentset);
    var mid = d3.mean(percentset);

    var svg = d3.select("#Derrick");

    
    var plot = svg.append("g");
    plot.attr("id", "plot");
    plot.attr("transform", translate(margin.left, margin.top));

    var bounds = svg.node().getBoundingClientRect();
    
    var rect = plot.append("rect");
    rect.attr("id", "background");
    var plotWidth = bounds.width - margin.right - margin.left;
    var plotHeight = bounds.height - margin.top - margin.bottom;
    
    rect.attr("x", 0);
    rect.attr("y", 0);
    rect.attr("width", plotWidth);
    rect.attr("height", plotHeight);
    rect.style("fill", "white");

    var x = d3.scaleLinear()
      .domain([0, 100])
      .rangeRound([0, plotWidth]);
    
    var y = d3.scaleBand()
      .domain(years.keys().reverse())
      .range([plotHeight, 0]);

    var xAxis = d3.axisBottom(x)
      .tickPadding(0);
     
    var yAxis = d3.axisLeft(y)
      .tickPadding(0);

    var gx = svg.append("g");
    gx.attr("id", "x-axis");
    gx.attr("class", "axis");
    gx.attr("transform", translate(margin.left, margin.top + plotHeight));
    gx.call(xAxis);

    var gy = svg.append("g");
    gy.attr("id", "y-axis");
    gy.attr("class", "axis");
    gy.attr("transform", translate(margin.left, margin.top));
    gy.call(yAxis);

    var stack = d3.stack()
      .keys(seasons)
      /*.order(d3.stackOrder)*/
      .offset(d3.stackOffsetNone);

    var layers= stack(data);

    console.log(layers);

    var gapLine = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];

    var layer = svg.selectAll(".layer")
      .data(layers)
      .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return color[i]; });

      layer.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("y", function(d) { return y(d.data["Year"]) + margin.top + 2; })
        .attr("x", function(d) { return x(d[0]) + margin.left; })
        .attr("height", y.bandwidth() - 4)
        .attr("width", function(d) { return x(d[1]) - x(d[0]) });

      layer.selectAll("text")
        .data(function(d) { return d; })
        .enter().append("text")
        .attr("x", function(d) { return (x(d[0]) + margin.left) + ((x(d[1]) - x(d[0])) / 2); })             
        .attr("y", function(d) { return y(d.data["Year"]) + margin.top + (y.bandwidth() / 2) + 6; })
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .style("fill", "black")
        .text(function(d) { return d3.format("1d")((d[1] - d[0]) * 0.01 * d.data["Total"])});

      layer.selectAll("line")
        .data(gapLine)
        .enter().append("line")
        .attr("x1", margin.left / 5)
        .attr("y1", function(d) { return (y(d + ", Outside Fire") + y.bandwidth() + margin.top) }) 
        .attr("x2", plotWidth + margin.left)
        .attr("y2", function(d) { return (y(d + ", Outside Fire") + y.bandwidth() + margin.top) })
        .attr("stroke-width", 1)
        .attr("stroke", "black");

    var legend = svg.selectAll(".legend")
      .data(seasons)
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return translate(0 + margin.right, i * 20 + margin.top); })
        .style("font", "10px sans-serif");

    legend.append("rect")
        .attr("x", plotWidth + 18)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", function(d, i) {return color[i];});

    legend.append("text")
        .attr("x", plotWidth + 44)
        .attr("y", 9)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .text(function(d) { return d; });

    svg.append("text")
        .attr("x", margin.left / 5)             
        .attr("y", margin.top / 1.5)
        .attr("text-anchor", "left")  
        .style("font-size", "20px") 
        .style("text-decoration", "underline")  
        .text("Fires Occuring in the Lone Mountain/USF Area, By Percentage Based on Season from 2009 to 2018");

    svg.append("text")
        .attr("x", ((plotWidth + margin.left + margin.right) / 2))           
        .attr("y", plotHeight + margin.top + (margin.bottom /1.2))
        .attr("text-anchor", "middle")  
        .style("font-size", "14px")   
        .text("Percent of Total Alarms in the Year");

    svg.append("text")
        .attr("x", margin.left / 5)           
        .attr("y", margin.top / 1.01)
        .attr("text-anchor", "left")  
        .style("font-size", "14px")   
        .style("text-decoration", "bold")  
        .text("Year, Call Type");

  });
}

createChart(["Spring", "Summer", "Fall", "Winter"], ["#ff9da7", "#59a14f", "#f28e2b", "#76b7b2"]);
//var color = ["#9e3a26", "#de5d1f", "#f49538", "#f4d166"];

function updateSpringData() {
  console.log("Spring is here!");
  d3.selectAll("svg > *").remove();
  createChart(["Spring", "Summer", "Fall", "Winter"], ["#ff9da7", "#59a14f", "#f28e2b", "#76b7b2"]);
}
//var color = ["#9e3a26", "#de5d1f", "#f49538", "#f4d166"];

function updateSummerData() {
  console.log("Umi! Umi!");
  d3.selectAll("svg > *").remove();
  createChart(["Summer", "Fall", "Winter", "Spring"], ["#59a14f", "#f28e2b", "#76b7b2", "#ff9da7"]);
}
//var color = ["#de5d1f", "#f49538", "#f4d166", "#9e3a26"];

function updateFallData() {
  console.log("Just don't trip!");
  d3.selectAll("svg > *").remove();
  createChart(["Fall", "Winter", "Spring", "Summer"], ["#f28e2b", "#76b7b2", "#ff9da7", "#59a14f"]);
}
//var color = ["#f49538", "#f4d166", "#9e3a26", "#de5d1f"];

function updateWinterData() {
  console.log("<Insert Frozen Joke>");
  d3.selectAll("svg > *").remove();
  createChart(["Winter", "Spring", "Summer", "Fall"], ["#76b7b2", "#ff9da7", "#59a14f", "#f28e2b"]);
}
//var color = ["#f4d166", "#9e3a26", "#de5d1f", "#f49538"];