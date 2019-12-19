




function groupedbarchart() {

    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("div.groupedbarchart").append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
   .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
      .range([height, 0]);

    var color = d3.scale.ordinal()
       .range(["gold", "silver", "#CD7F32"]);


    // An invisible x-axis
    var xAxis = d3.svg.axis()
      .scale(x0)
      .tickSize(0)  // eliminates tick marks
      .orient("bottom");

    // An invisible y-axis
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(0);
    //  .tickFormat(d3.format(".2s"));

    d3.csv("csv/Feb7.csv", function (error, data) {
        if (error) throw error;

        var medals = d3.keys(data[0]).filter(function (key) { return key !== "Team"; });

        console.log("medals = " + medals);

        data.forEach(function (d) {
            d.medals = medals.map(function (medal) { return { medal: medal, value: +d[medal] }; });
            console.log("d.medals = " + JSON.stringify(d.medals));
        });

        x0.domain(data.map(function (d) { return d.Team; }));
        x1.domain(medals).rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, d3.max(data, function (d) { console.log("d = " + JSON.stringify(d)); return d3.max(d.medals, function (d) { return d.value; }); })]);

        /*
           Set a breakpoint on the svg statement and do some inspecting:
             x0.domain() = ["USA", "Russia", "Germany", "Sweden", "Norway"]
             x0.rangeExtent() = [0, 900]
             x0.rangeBand() = 158
             x0("USA") = 19,...,x0("Norway") = 723
           
             x1.domain() = ["Gold", "Silver", "Bronze"]
             x1.rangeBand() = 52
             x1.rangeBands() = [1, 53, 105]
             x1("Gold") = 1, x1("Silver") = 53, x1("Bronze") = 105
        */
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)

        var group = svg.selectAll(".group")
            .data(data)
          .enter().append("g")
            .attr("class", "g")
            .attr("transform", function (d) { return "translate(" + x0(d.Team) + ",0)"; });

        group.selectAll("rect")
            .data(function (d) { return d.medals; })
          .enter().append("rect")
            .attr("width", x1.rangeBand() - 4)  // subtracting 4 introduces space between vertical bars in a group
            .attr("x", function (d) { console.log("rect d = " + JSON.stringify(d)); return x1(d.medal) })
            .attr("y", function (d) { return y(d.value); })
            .attr("height", function (d) { return height - y(d.value); })
            .style("fill", function (d) { return color(d.medal); });

        group.selectAll("text")
           .data(function (d) { return d.medals; })
           .enter().append("text")
           .attr("x", function (d) { return x1(d.medal) + x1.rangeBand() / 2.0; })
           .attr("y", function (d) { return y(d.value); })
           .attr("dy", "-0.35em")
           .style("text-anchor", "end")
           .style("fill", "black")
           .text(function (d) { return d.value });

        //console.log("group = " + JSON.stringify(group));

        var legend = svg.selectAll(".legend")
            .data(medals.slice())
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d) { return color(d); });

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) { return d; });

    })
}
