// Declare slicedata in global scope to enable deep dive after function piechart has run.
var slicedata;

function toDegrees(rad) {
    return rad * (180.0 / Math.PI);
}

function ba(i) {
    var d = slicedata[i];
    return d.startAngle + (d.endAngle - d.startAngle) / 2
}

function currentMedalCounts() {

    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
         width = 860 - margin.left - margin.right,
         height = 450 - margin.top - margin.bottom;

    d3.csv("csv/olympicmedals.csv", function (error, medalCounts) {

        console.log("medalCounts " + JSON.stringify(medalCounts));
        var colordomain = [];

        function pieSlices(medalCounts) {
            var slices = [];

            medalCounts.forEach(function (d) {
                colordomain.push(d.Team);
                slices.push({ Team: d.Team, Total: (+d.Gold) + (+d.Silver) + (+d.Bronze) });
            });

            colordomain.push("Other");
            slices.push({ Team: "Other", Total: 40 });

            return slices;
        }

        function examineSlice(d, i) {
            console.log("slice " + i + ": " + JSON.stringify(d));
            return d;
        }

        var color = d3.scale.category10();

        var pieslices = pieSlices(medalCounts);

        console.log("pieslices = " + JSON.stringify(pieslices));

        var svg = d3.select("div.piechart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
 
        var radius = (Math.min(width, height) / 2) + 10;

        var pieChart = d3.layout.pie()
           .sort(null)
           .value(function (d) {
               return d.Total;
           });

        var arc = d3.svg.arc()
          .outerRadius(radius * 0.8)
          .innerRadius(radius * 0.2);

        var labelingArc = d3.svg.arc()
          .innerRadius(radius * 0.71)
          .outerRadius(radius * 0.71);

        var outerArc = d3.svg.arc()
          .outerRadius(radius * 0.9)
          .innerRadius(radius * 0.9);

        var arcs = svg.selectAll("g.slice")
           .data(pieChart(pieslices))
           .enter()
           .append("g")
           .attr("class", "slice");

        selection = arcs.node();

        // Here is an important technique to see all the data bound to all the slices.
        slicedata = svg.selectAll("g.slice").data();
        //console.log("slicedata = " + JSON.stringify(slicedata));

        // Now let's look at the data bound to the individual slices.
        // Do this by providing data to a "dummy" selection.
        // The callback function examineSlice will be called once for each slice.
        svg.selectAll("g.slice").selectAll("dummy")
               .data(function (d, i) { return examineSlice(d, i); });

        function bisectingAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2
        }

        arcs.append("path")
            .style("fill", function (d) {
                // console.log("Team = " + d.data.Team + ", color = " + color(d.data.Team)); 
                return color(d.data.Team)
            })
            .attr("d", arc);

        arcs.append("text")
           .attr("transform", function (d) {
               // Set the label's origin to the center of the arc.
               return "translate(" + arc.centroid(d) + ")";
           })
           .attr("text-anchor", "middle")
           .attr("dy", ".35em")
           .text(function (d) {
               return (d.data.Total)
           });


        arcs.append("text")  // USA, Russia, etc.
          .attr("dy", ".35em")
          .attr("transform", function (d) {
              var pos = outerArc.centroid(d)
              pos[0] = radius * (bisectingAngle(d) < Math.PI ? 1 : -1);
              return ("translate(" + pos + ")")
          })
          .attr("text-anchor", function (d) {
              return bisectingAngle(d) < Math.PI ? "start" : "end";
          })
          .text(function (d) {
              return (d.data.Team)
          });

        arcs.append("polyline")
         .attr("points", function (d) {
             var pos = outerArc.centroid(d);
             pos[0] = radius * 0.95 * (bisectingAngle(d) < Math.PI ? 1 : -1);
             return [labelingArc.centroid(d), outerArc.centroid(d), pos];
         });

    })

}

