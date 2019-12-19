

function stackedbarchart() {

    var barWidth = 15;

    var margin = { top: 20, right: 50, bottom: 30, left: 40 },
        width = (40 * barWidth) - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("div.stackedbarchart").append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
     .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    d3.csv("csv/olympicmedals.csv", function (error, medalCounts) {
        if (error) throw error;

        var medals = d3.keys(medalCounts[0]).filter(function (key) { return key !== "Team"; });
        var teams = medalCounts.map(function (d) { return d.Team });
        stackData = [];


        // Transform the data
        // See https://square.github.io/intro-to-d3/examples/#stacked-bars
        for (x in medalCounts[0]) {
            if (x != "Team") {
                // Add one team object for each countray: USA, Russia, Germany, Swden, Norway
                var newTeamObject = { medal: x, values: [] };
                for (y in medalCounts) {
                    newTeamObject.values.push({
                        Team: medalCounts[y]["Team"],
                        Count: parseInt(medalCounts[y][x])
                    });
                };
                stackData.push(newTeamObject);
            };
        };


        var stack = d3.layout.stack()
             .values(function (d) { return d.values; })
             .x(function (d) { return d.Team })
             .y(function (d) { return d.Count });

        var stacked = stack(stackData);

        // Calculate the maximum y-value across all layers.
        // To do so, combine the start d.y0 and the height d.y
        // to get the highest point.
        var maxY = d3.max(stacked, function (d) {
            return d3.max(d.values, function (d) {
                return d.y0 + d.y;
            });
        });

        var color = d3.scale.ordinal()
          .range(["gold", "silver", "#CD7F32"]);

        var y = d3.scale.linear()
           .range([height, 0])
           .domain([0, maxY]);

        var x = d3.scale.ordinal()
           .domain(teams)
           .rangeRoundBands([0, width], .1);

        var xAxis = d3.svg.axis()
         .scale(x)
         .tickSize(0)  // eliminates tick marks
         .orient("bottom");


        var yAxis = d3.svg.axis()
         .scale(y)
         .orient("left")
         .ticks(0);


        svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0," + height + ")")
         .call(xAxis);

        svg.append("g")
         .attr("class", "y axis")
         .call(yAxis);

        var layers = svg.selectAll("g.layer")
          .data(stacked, function (d) { return d.medal; })
          .enter()
           .append("g")
           .attr("class", "layer")
           .attr("fill", function (d) { return color(d.medal) });

        layers.selectAll("rect")
          .data(function (d) { return d.values; })
          .enter()
          .append("rect")
          .attr("x", function (d) { return x(d.Team) + x.rangeBand() / 2.0 - barWidth / 2.0 })
          .attr("width", barWidth)
          .attr("y", function (d) { return y(d.y0 + d.y); })
          .attr("height", function (d) { return height - y(d.y) });


        var legend = svg.selectAll(".legend")
            .data(medals)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(30," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 10)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d) { return color(d); });

        legend.append("text")
            .attr("x", width - 16)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) { return d; });
    })

}