// Declare slicedata in global scope to enable deep dive after function piechart has run.
var slicedata;

function toDegrees(rad) {
    return rad * (180.0 / Math.PI);
}

function ba(i) {
    var d = slicedata[i];
    return d.startAngle + (d.endAngle - d.startAngle) / 2
}

function massalerts() {

    // Angles measured in radians.
    var piedata = [
        { facility: "HMH", alerts: 34 }
         , { facility: "MSLH", alerts: 12 }
         , { facility: "MSJH", alerts: 14 }
         , { facility: "MWHH", alerts: 8 }
         , { facility: "MWB", alerts: 21 }
    ];

    console.log("piedata " + JSON.stringify(piedata));

    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
       width = 860 - margin.left - margin.right,
       height = 500 - margin.top - margin.bottom;

    var colordomain = [];

    function pieSlices(arcs) {
        var slices = [];
        piedata.forEach(function (d) {
            colordomain.push(d.facility);
            slices.push({ Facility: d.facility, Alerts: d.alerts });
        });

        return slices;
    }

    function examineSlice(d, i) {
        console.log("slice " + i + ": " + JSON.stringify(d));
        return d;
    }

    var color = d3.scale.category10();

    var pieslices = pieSlices(arcs);

    console.log("pieslices = " + JSON.stringify(pieslices));

    var svg = d3.select("div.mass")
       .append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var radius = (Math.min(width, height) / 2) + 10;

    var pieChart = d3.layout.pie()
       .sort(null)
       .value(function (d) {
           return d.Alerts;
       });

    // startAngle and endAngle are automatically calculated when we use the pie layout.
    var arc = d3.svg.arc()
      .outerRadius(radius * 0.8)
      .innerRadius(radius * 0.2)

    var labelingArc = d3.svg.arc()
      .innerRadius(radius * 0.71)
      .outerRadius(radius * 0.71)

    var outerArc = d3.svg.arc()
      .outerRadius(radius * 0.9)
      .innerRadius(radius * 0.9)

    //  svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

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
            return color(d.data.Facility)
        })
        .attr("d", arc);


    arcs.append("text")
       .attr("transform", function (d) {
           // Set the label's origin to the center of the arc.
           return "translate(" + arc.centroid(d) + ")";
       })
       .attr("text-anchor", "middle")
       .attr("dy", ".35em")
       .text(function (d, i) {
           return d.data.Alerts;
       });

    arcs.append("polyline")
     .attr("points", function (d) {
         var pos = outerArc.centroid(d);
         pos[0] = radius * 0.95 * (bisectingAngle(d) < Math.PI ? 1 : -1);
         return [labelingArc.centroid(d), outerArc.centroid(d), pos];
     });


    arcs.append("text")
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
          return (d.data.Facility)
      });

}

