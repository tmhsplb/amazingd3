// Place in global namespace so that we can dive deep after function poem has run. 
var stanzaVerses;
 
function poem() {
 d3.csv("csv/theroadnottaken.csv" , function(error, verses) {
            
  // console.log("verses = " + JSON.stringify(verses));
     
   function fillArrayWithNumbers(n) {
       var arr = Array.apply(null, Array(n));
       return arr.map(function(x, i) { return i + 1 });
   }
     
   var maxStanza = d3.max(verses, function(s) { return s.Stanza; });
     
   var stanzasArray = fillArrayWithNumbers(+maxStanza);
     
 //  console.log("stanzasArray = " + JSON.stringify(stanzasArray));
                      
     
   var titleDiv = d3.select("body").selectAll("div.title").data(["title"]);
     
    titleDiv
          .html(function(d) { return "The Road not Taken<br/>&nbsp;&nbsp;--&nbsp;Robert Frost"})
          .style("left", "12px")
          .style("top", "30px")
          .style("color", "black");
     
    function examineStanza(d, i)
    {
         console.log("examineStanza " + i + ": " + JSON.stringify(d));
         return d;
    }
   
    var stanzas = d3.select("div.poem").selectAll("div.stanza").data(stanzasArray);
     
      stanzas
      .enter()
      .append("div")
      .attr("class", "stanza")
      .style("top", function(d) { return (d * 120) + "px" });
     
    // The DOM now contains a div.stanza as a placeholder for the verses
    // belonging to each stanza.
    // Here is an important technique to see the data bound to the stanzas.
    var stanzasData = stanzas.data();
    console.log("stanzasData = " + JSON.stringify(stanzasData));
     
    // Now let's look at the data bound to the individual stanzas.
    // Do this by providing data to a "dummy" selection.
    // The callback function examineStanza is called once for each stanza.
    stanzasData 
      = stanzas.selectAll("dummy").data(function(d, i) { return examineStanza(d, i + 1); });
     
    // Provide data for each div.stanza by filtering set of all verses by stanza number
    stanzaVerses = stanzas.selectAll("div.stanza")
         .data(function(d, i) {
                 var selectedVerses = verses.filter(function(v) { return v.Stanza == d});
                 console.log("selectedVerses for stanza " + (i + 1) + ": " 
                                  + JSON.stringify(selectedVerses));
                 return selectedVerses;
         });
        
    // The DOM already contains a div.stanza for each stanza.
    // Now populate each div.stanza with its set of verses.
    stanzaVerses
      .enter(console.log("stanzaVerses enter fires"))
      .append("div")
      .attr("class", "verse")
      .style("top", function(d, i) { return (i * 20) + "px" })
      .html(function(d) { return d.Verse });
     
 })
            
}

