
function plotCities() {
    
      var margin = { left: 90, top: 40, right: 30, bottom: 30 };

      var xColumn = "longitude";
      var yColumn = "latitude";
      var rColumn = "population";
      var peoplePerPixel = 1000000;

      
      var width = 500 - margin.left - margin.right;
      var height = 250 - margin.top - margin.bottom;

      var svg = d3.select("div.cities").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

      var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var xScale = d3.scale.linear().range([0, width]);
      var yScale = d3.scale.linear().range([height, 0]);
      var rScale = d3.scale.sqrt();

      function render(data) {

        xScale.domain( d3.extent(data, function (d){ return d[xColumn]; }));
        yScale.domain( d3.extent(data, function (d){ return d[yColumn]; }));
        rScale.domain([0, d3.max(data, function (d){ return d[rColumn]; })]);

        // Compute the size of the biggest circle as a function of peoplePerPixel.
        var peopleMax = rScale.domain()[1];
        var rMin = 0;
        var rMax = Math.sqrt(peopleMax / (peoplePerPixel * Math.PI));
        rScale.range([rMin, rMax]);

        var circles = g.selectAll("circle").data(data);
        circles.enter().append("circle");
        circles
          .attr("cx", function (d){ return xScale(d[xColumn]); })
          .attr("cy", function (d){ return yScale(d[yColumn]); })
          .attr("r",  function (d){ return rScale(d[rColumn]); });
        circles.exit().remove();
      }

      function type(d){
        d.latitude   = +d.latitude;
        d.longitude  = +d.longitude;
        d.population = +d.population;
        return d;
      }

      d3.csv("csv/cities.csv", type, render);
}
    