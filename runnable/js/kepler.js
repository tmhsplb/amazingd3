

function kepler() {
    var margin = { left: 90, top: 40, right: 30, bottom: 30 };

    var circleRadius = 5;
    var xColumn = "logT";
    var yColumn = "logR";

    var width = 600 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    // Define the div for the tooltip
    // Technique commes from
    //    bl.ocks.org/d3noob/a22c42db65eb00d4e369
    var tooltip = d3.select("body").append("div")
       .attr("class", "tooltip")
       .style("opacity", 0);

    // Use the margin convention 
    var svg = d3.select("div.planets").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxisG = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");

    var yAxisG = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,0)");


    var xScale = d3.scale.linear().domain([-1, 4]).range([0, 600]).nice();
    var yScale = d3.scale.linear().domain([1, 4]).range([height, 0]).nice();

    // var xScale = d3.scale.linear().range([0, 600]);
    // var yScale = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");



    function render(data) {
        // xScale.domain(d3.extent(data, function (d){ return d[xColumn]; })).nice();
        // yScale.domain(d3.extent(data, function (d){ return d[yColumn]; })).nice();


        //  console.log("xScale.domain = " + xScale.domain());
        //  console.log("xScale.range = " + xScale.range());

        //  console.log("yScale.domain = " + yScale.domain());

        xAxisG.call(xAxis)
            .append("text")
            .attr("x", xScale(3.2))
            .attr("dy", "-0.71em")
            .style("text-anchor", "end")
            .text("log(T)");

        yAxisG.call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("log(R)");

        var circles = svg.selectAll("circle").data(data);
        circles.enter().append("circle");

        circles
          .attr("cx", function (d) {
              // console.log("x = " + d[xColumn] + "; xScale[x] = " + xScale(d[xColumn]));
              return xScale(d[xColumn]);
          })

          .attr("cy", function (d) {
              return yScale(d[yColumn]);
          })

          .attr("r", circleRadius)
          .on("mouseover", function (d) {
              tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
              tooltip.html(d.Planet)
                   .style("left", (d3.event.pageX - 20) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
          })
        .on("mouseout", function (d) {
            tooltip.transition()
               .duration(500)
               .style("opacity", 0)
        });

        var line = d3.svg.line()
          .interpolate('linaer')
          .x(function (d) { return xScale(d[xColumn]) })
          .y(function (d) { return yScale(d[yColumn]) });

        svg.append('path')
         .datum(data)
         .attr('class', 'line')
         .attr('d', line)
         .attr("fill", "none")
         .attr("stroke", "black")
         .attr("stroke-width", 2)
         .style("stroke-dasharray", ("5, 4"))

        circles.exit().remove();
    }

    function type(d) {
        d.T = parseFloat(d.T);
        d.R = parseFloat(d.R);
        d.logT = parseFloat(d.logT);
        d.logR = parseFloat(d.logR);
        return d;
    }

    d3.csv("csv/planets.csv", type, render);

}