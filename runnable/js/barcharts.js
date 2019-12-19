
function barcharts() {
    rowchart();
    barchart();
}

function rowchart() {

    var barHeight = 20;  // Parameterized by barHeight

    var margin = { top: 20, right: 20, bottom: 30, left: 100 },
      width = 350 - margin.left - margin.right,
      // The multiplier of barHeight affects the spacing between bars.
      // Adjust the padding used by rangeRoundBands accordingly
      height = (10 * barHeight) - margin.top - margin.bottom;
    //  height = (15*barHeight) - margin.top - margin.bottom;

    d3.csv("csv/olympicmedals.csv", type, function (error, medalCounts) {

        console.log("data = " + JSON.stringify(medalCounts));

        medalCounts.forEach(function (d) {;
            d.Totalmedals = (+d.Gold) + (+d.Silver) + (+d.Bronze);
        });

        var x = d3.scale.linear()
          .range([0, width]);

        x.domain([0, d3.max(medalCounts, function (d) { return d.Totalmedals; })]);

        console.log("x.domain = " + x.domain());

        var yy = medalCounts.map(function (d) { return d.Team; });

        // console.log("yy = " + yy);

        // See comment about multiplier of barHeight above
       // var y = d3.scale.ordinal().domain(yy).rangeRoundBands([0, height], .2, .1);
        var y = d3.scale.ordinal().domain(yy).rangeRoundBands([0, height]);
        //var y = d3.scale.ordinal().domain(yy).rangeRoundBands([0, height], .6, .1);

        console.log("y.domain = " + y.domain());
        console.log("height = " + height);
        console.log("y.range = " + y.range());
        console.log("y.rangeExtent = " + y.rangeExtent());

        var yAxis = d3.svg.axis()
         .scale(y)
         .orient("left");

        var svg = d3.select("div.rowchart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        //  if (error) throw error;

        svg.append("g")
           .attr("class", "y axis")
           .call(yAxis)
           .call(adjustTextLabels);

        // http://stackoverflow.com/questions/17544546/d3-js-align-text-labels-between-ticks-on-the-axis
        function adjustTextLabels(selection)
        {
            selection.selectAll("text")
              .attr("dy", "-0.30em");
        }

        var bar = svg.selectAll("bar")
          .data(medalCounts)
          .enter().append("g")
          .attr("transform", function (d, i) { return "translate(0, " + y(d.Team) + ")"; });

        bar.append("rect")
            .attr("class", "bar")
            .attr("width", (function (d) { return x(d.Totalmedals); }))
            .attr("height", barHeight);

        bar.append("text")
            .attr("class", "bar text")
            .attr("x", function (d) { return x(d.Totalmedals); })
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .style("fill", "white")
            .text(function (d) { return d.Totalmedals; });

        d3.select("#bHeight").on("input", function() {
          adjustbarHeight(+this.value);
        })
 
       adjustbarHeight(20);
    
       function adjustbarHeight(bHeight) {
         // Adjust the text on the range slider
        d3.select("#bHeight-value").text(bHeight);
        d3.select("#bHeight").property("value", bHeight);
     
        barHeight = bHeight;
        //console.log("barHeight = " + barHeight);
     
       // var selected = bar.selectAll("rect");
       // console.log("selected = " + JSON.stringify(selected));
       bar.selectAll("rect")
         .attr("height", barHeight);
     
       bar.selectAll("text")
         .attr("y", barHeight/2);
   }
  
    })

    function type(d) {
        d.value = +d.value; // coerce to number
        return d;
    }
}

    function barchart() {

        var barWidth = 20;  // In this example the chart is parameterized by the bar width.

        var margin = { top: 20, right: 20, bottom: 70, left: 40 },
         width = 350 - margin.left - margin.right,
         height = 300 - margin.top - margin.bottom;

        d3.csv("csv/olympicmedals.csv", function (error, medalCounts) {

            medalCounts.forEach(function (d) {;
                d.Totalmedals = (+d.Gold) + (+d.Silver) + (+d.Bronze);
            });

            var xDomain = medalCounts.map(function (d) { return d.Team });
            var medalMax = d3.max(medalCounts, function (d) { return d.Totalmedals; });

            var x = d3.scale.ordinal().domain(xDomain).rangeRoundBands([0, width], .1);

            var y = d3.scale.linear().range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(0);  // display no tick marks

            var svg = d3.select("div.barchart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");

            y.domain([0, medalMax]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            var bar = svg.selectAll("bar")
                .data(medalCounts)
              .enter().append("g")
            //.attr("transform", function(d, i) { return "translate(" + x(d.Team) + ", 0)" });

            bar.append("rect")
                .attr("class", "bar")
               // .style("fill", "steelblue")
                .attr("x", function (d) { return x(d.Team) + x.rangeBand() / 2.0 - barWidth / 2.0 })

                .attr("width", barWidth)
                .attr("y", function (d) { return y(d.Totalmedals) })
                .attr("height", function (d) { return height - y(d.Totalmedals); });

            bar.append("text")
                .attr("class", "bar text")
                .attr("x", function (d) { return x(d.Team) + x.rangeBand() / 2.0 + barWidth / 2.0 })
                .attr("y", function (d) { return y(d.Totalmedals) })
                .attr("dx", "1.25em")
                .attr("dy", "0.85em")
                .style("text-anchor", "end")
                .style("fill", "white")
                .text(function (d) { return d.Totalmedals; });

            svg.append("g")
              .attr("class", "y axis")
              .call(yAxis);

            d3.select("#bWidth").on("input", function () {
                adjustbarWidth(+this.value);
            })

            adjustbarWidth(20);

            function adjustbarWidth(bWidth) {
                // Adjust the text on the range slider
                d3.select("#bWidth-value").text(bWidth);
                d3.select("#bWidth").property("value", bWidth);
     
                barWidth = bWidth;
                // console.log("barWidth = " + barWidth);
     
                // var selected = bar.selectAll("rect");
                // console.log("selected = " + JSON.stringify(selected));
        
                bar.selectAll("rect")
                    .attr("x", function (d) { return x(d.Team) + x.rangeBand()/2.0 - barWidth/2.0 })
                    .attr("width", barWidth);
     
                bar.selectAll("text")
                    .attr("x", function (d) { return x(d.Team) + x.rangeBand()/2.0 - barWidth/2.0 });
            }
        })
    }
