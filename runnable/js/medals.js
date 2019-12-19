

function olympicMedals() {
  d3.csv("csv/olympicmedals.csv", function (medalCounts) {
     medalLeaders(medalCounts);
  })

    colors = {Gold: "gold", Silver: "silver", Bronze: "#CD7F32"};
    
    function medalLeaders(medalCounts) {
      console.log(JSON.stringify(medalCounts));
        
      var maxTotal = d3.max(medalCounts, function(d) {
                     return (+d.Gold) + (+d.Silver) + (+d.Bronze);
                });

      var totalsScale = d3.scale.linear().domain([0, maxTotal]).range([2, 40]);
        
      d3.select("svg")
        .append("g")
        .attr("id", "teamG")
        .attr("transform", "translate(50,100)")
        .selectAll("g")
        .data(medalCounts)
        .enter()
        .append("g")
        .attr("class", "medalTotals")
        .attr("transform",
               function(d,i) { return "translate(" + (i * 100) + ", 0)"});

        var teamG = d3.selectAll("g.medalTotals");

        teamG
         .append("circle")
         .attr("r", 0)
         .transition()
         .delay(function(d,i) { return i * 100 })
         .duration(1000)
         .attr("r", 
               function(d) {
                 return totalsScale((+d.Gold) + (+d.Silver) + (+d.Bronze))
               })
         .style("fill", "cornsilk")
         .style("stroke", "black")
         .style("stroke-width", "1px");

        teamG
         .append("text")
         .style("text-anchor", "middle")
         .text(function(d) { return (+d.Gold) + (+d.Silver) + (+d.Bronze) });
        
        teamG
         .append("text")
         .style("text-anchor", "middle")
         .attr("y", 60)
         .style("font-size", "10px")
         .text(function(d) { return d.team; });
        
        teamG
         .append("image", "text")
       //  .style("text-anchor", "middle")
         .attr("y", 70)
         .attr("x", -30)
         .attr("xlink:href", function(d) { return "images/" +d.Team + ".png"; })
         .attr("width", "68px")
         .attr("height", "40px");
        
        teamG.on("click", teamClick);
        
         d3.text("resources/modal.html", function (data) {
            d3.select("body")
              .append("div")
              .attr("id", "modal")
              .style("top", "280px")
              .html(data);
        });
        
        function teamClick(d) {
            d3.selectAll("td.data").data(d3.values(d))
                    .html(function(p) {
                       return p;
            });
        }
        

        /*
        teamG.on("mouseover", highlightTeam);
                
        function highlightTeam(d) {
            d3.select("circle")
              .style("fill", "red");
        }
        
        teamG.on("mouseout", function() {
            d3.select("circle").style("fill", "pink")
        })
        */
        
        var medals = d3.keys(medalCounts[0]).filter(function(el) {
               return el != "Team";
        });
        
        if (medals[0] != "Totals")
        { 
           medals = ["Totals"].concat(medals);
        }
        
        //console.log("medals = " + JSON.stringify(medals));

        d3.select("#medalTypes").selectAll("button.teams")
          .data(medals).enter()
          .append("button")
          .on("click", buttonClick)
          .html(function(d) { return d; });

        
        function buttonClick(medal) {
             
            if (medal == "Totals")
            {
                teamG.select("circle")
                 .attr("r", 0)
                 .transition()
                 .delay(function(d,i) { return i * 100 })
                 .duration(1000)
                 .attr("r", 
                       function(d) {
                         return totalsScale((+d.Gold) + (+d.Silver) + (+d.Bronze))
                  })
                 .style("fill", "cornsilk")
                 .style("stroke", "black")
                 .style("stroke-width", "1px");
                
                teamG.select("text")
                  .style("text-anchor", "middle")
                  .text(function(d) { return (+d.Gold) + (+d.Silver) + (+d.Bronze) });
            }
            else
            {
                var maxValue = d3.max(medalCounts, function(d) {
                     return parseFloat(d[medal]);
                });

                var radiusScale = d3.scale.linear()
                      .domain([0, maxValue]).range([2, 40]);
                
                teamG.select("circle").transition().duration(1000)
                      .attr("r", function(d) {
                                   return radiusScale(d[medal])
                      })

                      .style("fill", colors[medal]);

                teamG.select("text")
                      .text(function (d) { return d[medal]; });
                }
            }
        
        }
    }
