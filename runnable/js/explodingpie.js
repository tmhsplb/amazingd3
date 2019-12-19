
function explodingPie() {
    var width = 960,
        height = 500;

    var radius = (Math.min(width, height) / 2) + 10;
    
    var cornerRadius = 10;
       
        outerRadius = radius * 0.8
        innerRadius = radius * 0.2;
    

    d3.csv("csv/olympicmedals.csv", function(error, medalCounts) {
        var colordomain = [];
        var color = d3.scale.category10();
        
        var pie = d3.layout.pie()
            .padAngle(.02)
            .sort(null)
            .value(function(d) {
                return d.Total;
            });
         
        var arc = d3.svg.arc()
            .padRadius(outerRadius)
            .innerRadius(innerRadius);
        
        var labelingArc = d3.svg.arc()
           .innerRadius(radius * 0.71)
           .outerRadius(radius * 0.71);

         var outerArc = d3.svg.arc()
           .outerRadius(radius * 0.9)
           .innerRadius(radius * 0.9);

        var svg = d3.select("div.piechart").append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
     
            function pieSlices(medalCounts) {
                 var slices = [];
                 
                 medalCounts.forEach(function (d) {
                     colordomain.push(d.Team);
                     slices.push( 
                         { Team: d.Team, Total: (+d.Gold) + (+d.Silver) + (+d.Bronze)});
                 });
        
                 colordomain.push("Other");
                 slices.push({ Team: "Other", Total: 40});

                 return slices;
            }

        var pieslices = pieSlices(medalCounts);
        
        var arcs = svg.selectAll("g.slice")
           .data(pie(pieslices))
           .enter()
           .append("g")
           .attr("class", "slice");
        
        arcs.append("path")
           .style("fill", function(d) {
                return color(d.data.Team) })
            .each(function(d) { d.outerRadius = outerRadius - 20; })
            .attr("d", arc)
            .on("mouseover", arcTween(outerRadius, 0))
            .on("mouseout", arcTween(outerRadius - 20, 150));
        
        function arcTween(outerRadius, delay) {
          return function() {
            d3.select(this).transition().delay(delay).attrTween("d", function(d) {
              var i = d3.interpolate(d.outerRadius, outerRadius);
              return function(t) { d.outerRadius = i(t); return arc(d); };
            });
          };
        }
        
        function bisectingAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle)/2
        }
      
        arcs.append("text")
           .attr("transform", function(d) {
             // Set the label's origin to the center of the arc.
             return "translate(" + arc.centroid(d) + ")";
            })
           .attr("text-anchor", "middle")
           .attr("dy", ".35em")
           .text(function(d) {
             return (d.data.Total)
            });
         
        arcs.append("text")  // USA, Russia, etc.
          .attr("dy", ".35em")
          .attr("transform", function(d) {
            var pos = outerArc.centroid(d)
            pos[0] = radius * (bisectingAngle(d) < Math.PI ? 1 : -1);
            return("translate(" + pos + ")")
          })
          .attr("text-anchor", function(d) {
             return bisectingAngle(d) < Math.PI ? "start" : "end";
          })
          .text(function(d) {
             return (d.data.Team)
          });
    
        arcs.append("polyline")
         .attr("points", function (d) {
            var pos = outerArc.centroid(d);
            pos[0] = radius * 0.95 * (bisectingAngle(d) < Math.PI ? 1 : -1);
            return [labelingArc.centroid(d), outerArc.centroid(d), pos];
        });
        
    });
}