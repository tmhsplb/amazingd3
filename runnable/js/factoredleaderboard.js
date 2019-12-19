// To understand this example, first run Feb7() and then run Feb8() with Feb7() still loaded.


function Feb7()
{
    return leaderBoard("Feb7");
}

function Feb8()
{
    return leaderBoard("Feb8");
}

var divTops = { title: "130px", headers: "55px", horizontalrule: "60px", datarow: 30};
                
function leaderBoard(date) {
 d3.csv("csv/" + date + ".csv" , function(error, medalCounts) {
   
   var title = d3.select("body").selectAll("div.title").data([date]);
     
    
   // This example uses the "factored" method of data entry. Credit to Curran Kelleher.
   // First enter static properties, then update with dynamic properties.
   // Enter static properties of div.title.
   title
     .enter()
     .append("div")
     .attr("class", "title")
     .style("top", divTops.title)
     .style("left", "10px")
     .style("color", "black");

   // Update dynamic properties of div.title
   title
      .html(function(d) { 
      // console.log("Use dataset for " + d);
       return "Leaderboard for " + d + " dataset";
      })
  
   var top3 = medalCounts.sort(function(a, b) { return a.Gold - b.Gold < 0 ? 1 : 0 }).slice(0, 3);
   
   manageHeaders(medalCounts[0]);
     
   var stndngs = standings(top3);
   manageLeaderboard(stndngs);

 })
 
    
   function standings(top3)
   {
       var rankOrder = new Array();
       
       for (i = 0; i < 3; i++)
       {
           rankOrder.push( { "Rank": i + 1, 
                                "Flag": "<img src = images/" + top3[i].Team + ".png></img>",
                                "Team": top3[i].Team, 
                                "Gold": top3[i].Gold,
                                "Silver": top3[i].Silver,
                                "Bronze": top3[i].Bronze }
                          );
       }
       
       return rankOrder;      
   }
    
   function manageHeaders(row0)
   {
        var hdr = d3.select("div.table").selectAll("div.tableheader").data([1])
        
        // The first time manageHeaders is called there is no div.tableheader element. 
        // So the .enter() method is called exactly once, corresponding to the one 
        // data element of the data array, [1].
        //
        // After the first time there is exactly one div.tableheader. And since  
        // there is exactly one new element, the .enter() method does not fire.
        // This is a pattern for adding static data elements.
        hdr
        .enter()
        .append("div")
        .attr("class", "tableheader")
        .style("top", function(d) {
           // console.log("hdr.enter fired");
            return divTops.headers;}
        );
        
        addHeaders(row0);
        
        // Adding a horizontal rule should be an exercise for the student
        var hr = d3.select("div.table").selectAll("div.horizontalrule").data([1])
        
        hr
        .enter()
        .append("div")
        .attr("class", "horizontalrule")
        .style("top", divTops.horizontalrule)
        .append("hr")
        .style("border-color", "black")
       
    }
        
   function addHeaders(row0)
   {
        // headers = ["Team", "Gold", "Silver", "Bronze"]
        var headers = d3.keys(row0);
        headers = ["Place"].concat(headers);
       
        var hdrs = d3.select("div.table").selectAll("div.tableheader").selectAll("div.header").data(headers);
       
        // The first time addHeaders is called there is no div.header element. 
        // So the .enter() method is called exactly 5 times, once for each member
        // of the data array, 
        //   ["Place", "Team", "Gold", "Silver", "Bronze"].
        // After the first time there are exactly 5 div.header elements. 
        // And since there are the same number of new elements as existing elements
        // the .enter() method does not fire.
        // This is a pattern for adding static data elements.
        hdrs
          .enter()
          .append("div")
          .attr("class", "header")
          .html(function (d) {
           // console.log("hdrs.enter.html: " + d);
            return d;
          })
          .style("left", function(d, i) { return (i * 100) + "px";});
   }
    
   function reportRank(type, d)
   {
      //  console.log(type + d.Team + ", rank = " + d.Rank);
   }
    
   function manageLeaderboard(standings) {
   
   // console.log("standings = " + JSON.stringify(standings));
          
    // Create a div.datarow container for each unique team name.
    // The team name is an enter/update key for data items. This is the key to the pipeline!
    // For example, when the data row
    //    USA,8,6,12
    // belonging to the top 3 of the Feb7 dataset is encountered, there is no div.datarow for key = USA
    // in the DOM, so a div.datarow is entered by calling the enter() method of the selection dt.
    // The same is true for each of the other data rows in the Feb7 dataset.
    // Now consider processing the Feb8 dataset.
    //  1. When the data row
    //         USA,11,6,12
    //     belonging to the top 3 of the Feb8 dataset is encountered, there is already a div.datarow for key = USA
    //     in the DOM, so this div.datarow item is updated with the new medal counts.
    //  2. When the data row
    //         Russia,10,7,9
    //     belonging to the top 3 of the Feb8 dataset is encountered, there is no div.datarow for key = Russia
    //     in the DOM, so a div.datarow is entered by calling the enter() method of the selection dt.
    //  3. When the data row
    //         Norway,9,8,5
    //     belonging to the top 3 of the Feb8 dataset is encountered, there is already a div.datarow for key = Norway
    //     in the DOM, so this div.datrow is updated with the new medal counts, which happen to be the same as
    //     the old medal counts.
    //  4. Finally, the div.datarow that was added when
    //         Germany,7,8,5
    //     was encountered in the top 3 of the Feb7 dataset will be removed since the selection dt for the Feb8
    //     dataset does not contain an item with key = Germany
    // 
    // This is the magic of D3!
    var dt = d3.select("div.table")
       .selectAll("div.datarow")
       .data(standings, function(d) { return d.Team });
      // .data(standings);
     
       // The setting .data(standings) does not provide a unique enter/update key. It works
       // for the Feb7 dataset, but updating by the Feb8 dataset does not work properly.
       //    
       // The setting .data([1, 2, 3]) will create a div.datarow container for each key in [1, 2, 3].
       // This is NOT what we want, because our key values need to be team names as keys for entering
       // and updating. See the comment above.
       //    .data([1, 2, 3]);
       
   
    // Enter the static properties of each div.datarow
    dt.enter()
     .append("div")
     .attr("class", "datarow")
     .style("color", function (d) {
        // console.log("enter() method fired for team " + d.Team);
         return "black";
       });
     
    // Update each div.datarow with dynamic properties
    dt.attr("class", "datarow")
      .style("top", function(d, i) { reportRank("Update ", d); return (divTops.datarow + (d.Rank * 60)) + "px";})
      .style("color", "green");
       
    // Exit  
    dt.exit()
      .remove();
       
    populateRows();

    
   }
     
       function reportData(type, key, value)
       {
         //  console.log(type + " (key,value) = " + "(" + key + "," + value + ")");
       }
        
       // Debugging function. Important: this functionwill be called 3 times, 
       // once for each div.datarow. Each div.datarow represents a different team.
       function examineRow(d)
       {
        // Calling d3.entries() reshapes the data in this row to make it easier
        // to work with.
       // console.log("1. examineRow: rowdata = " + JSON.stringify(d));
         
        // Get an array of (key,value) pairs. We can filter arrays!
        var entries = d3.entries(d);
      //  console.log("2. examineRow: rowdata = " + JSON.stringify(entries));
        return entries;
       }
    
       function rowData (d)
       {
         // Using  d3.entries(d) reformats each row data so that it is 
         // convenient to work with.
       //  return d3.entries(d).filter(function(d) { return d.key == "Flag"});
         return d3.entries(d).filter(function(d) { return d.key != "Rank"});
       }
    
       function populateRows()
       {           
          //  console.log("Now populate rows");
           
            // A useful technique to see all the data bound to all the rows. 
            var rowdata = d3.selectAll("div.datarow").data();
           // console.log("rowdata = " + JSON.stringify(rowdata));
                      
            // Let's look at the data bound to individual rows.
            // Do this by providing data to a "dummy" selection.
            // The callback function examineRow will be called once for each div.datarow. 
            rowdata = d3.selectAll("div.datarow").selectAll("dummy")
                           // Can't log rowdata by return d3.entries(d), 
                           // because rowdata will be the update selection 
                           // .data(function(d) { return d3.entries(d); } );
                           .data(function(d) { return examineRow(d); } );
           
            // Variable rowdata is the update selection. That's why the log does not work.
            // But examineRow(d) does work!
            //console.log("rowdata = " + JSON.stringify(rowdata));
           
            
            // Populate each div.datarow container with div.data elements.
            // Populating a div.datarow involves either updating its existing div.data elements
            // or entering new div.data elements.
            // d3.entries(d) contains a team name which is used to select the div.datarow whose
            // div.data entries are being populated.
            var tr = d3.selectAll("div.datarow").selectAll("div.data")
                                    // What data do we want to bind to the div.data
                                    // elements to be entered or updated? Answer: the Flag
                                    // data item in d3.entries(d). The callback will be called
                                    // once for each div.datarow as we saw above. 
                                    .data(function(d) { return rowData(d); });
               
             
                // Enter the static properties of each div.datarow
                tr
                 .enter()
                 .append("div")
                 .attr("class", "data")
                 .style("left", function(d,i) { return (i * 100) + "px"; })
                 .style("top", function(d) {return "20px" })
                 .style("color", "blue");
                
                
                // Update each div.datarow by its dynamic properties, the country flag
                // and the medal counts.
                tr
                 // .html(function(d) { return d.value; })
                  .html(function(d) { 
                        reportData("Update: ", d.key, d.value); 
                        return d.value;
                  })
                  .style("color", "red");       
       }  
}

