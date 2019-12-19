AmazingD3App.controller('sunyearController', ['$scope', '$timeout', 'Sunclock', 'autocompleteService', function ($scope, $timeout, Sunclock, autocompleteService) {

    //
    // The $timeout service is injected here to wait for the partial view to be loaded. Just doing the usual jQuery
    //   $(document).ready(function() {...})
    // does not work in a partial view because of the digest loop. This solution was found at StackOverflow:
    //  http://stackoverflow.com/questions/27129829/angularjs-viewcontentloaded-fired-before-partial-view-appears
    //
    $scope.$on('$viewContentLoaded', function (event) {
        $timeout(function () {
            var gmtOffset;
            var dstOffset;
            var city = "Houston, Texas"; // default
            var latitude = 29.719400; // values for
            var longitude = -95.222847; // city, latitude and longitude
            var locationInput = $('#location-input');
            var year = (new Date().getFullYear());
            var today = new Date();
            //var today = new Date(year, 8, 25);
          
            $scope.fetchCities = autocompleteService.getCityDetails;

            $('body').on('click', '.location-list li', function () {
                var location = $(this).data('location');

                city = $(this).text();
                //   alert("sunlight body on-click location = " + location + " city = " + city);
               
                //   $.cookie('location', location);
                //    $.cookie('location_text', locationText);
             
                coords = location.split(" ");
                latitude = +coords[0];
                longitude = +coords[1];

                setCity(city, latitude, longitude);
            });


            function setCity(city, latitude, longitude) {
                // alert("setCity: " + city);
                //  $('#location-results').empty();
                locationInput.val(city);

                var cityObj = {  // default city is Houston, TX
                    "Name": city,
                    "Latitude": latitude,
                    "Longitude": longitude,
                    "GmtOffset": +0
                };

                var gmtPromise = setTimezoneOffsets(cityObj);

                // To make sure that setGmtOffset has completed, we execute it as a promise.
                gmtPromise.then(function (result) {
                    console.log("default gmtOffset = " + gmtOffset + " dstOffset = " + dstOffset);
                    updateHeader(today, cityObj, gmtOffset, dstOffset);
                    cityObj.GmtOffset = +gmtOffset;
                    $('#location-results').empty();
                    sunyear(cityObj);
                })
            };

            setCity(city, latitude, longitude); // Call to set default city, Houston


            function setTimezoneOffsets(city) {
                //alert("city = " + JSON.stringify(city));
                var timezonePromise = Sunclock.getUTCOffset(city.Latitude, city.Longitude, new Date().getTime());
                return timezonePromise.then(function (result) {
                    //  console.log("rawOffset = " + result.data.rawOffset + " dstOffset = " + result.data.dstOffset); 
                    gmtOffset = result.data.rawOffset / 3600;  // reset global variable gmtOffset
                    dstOffset = result.data.dstOffset / 3600;
                    // console.log("setTimezoneOffsets: gmtOffset = " + gmtOffset + " dstOffset = " + dstOffset);
                    return true;
                });
            }

            function updateHeader(date, city, gmtOffset, dstOffset) {
               // var suntimesPromise = Sunclock.getSuntimes(date.getFullYear(), date.getMonth() + 1, date.getDate(), city.Latitude, city.Longitude, gmtOffset, dstOffset);
                // Don't adjust for dst (daylight savings time).
                var suntimesPromise = Sunclock.getSuntimes(date.getFullYear(), date.getMonth() + 1, date.getDate(), city.Latitude, city.Longitude, gmtOffset, 0);
                suntimesPromise.then(function (result) {
                    var suntimes = result;
                    $scope.longitude = suntimes.Longitude;
                    $scope.latitude = suntimes.Latitude;
                    $scope.sunrise = suntimes.Sunrise;
                    $scope.midday = suntimes.Midday;
                    $scope.sunset = suntimes.Sunset;
                    $scope.daylength = suntimes.DayLength;
                });
            }

            function sunyear(cityObj) {
                var width = 700;
                var height = 525;
                var padding = 40;
                var suntimes;

                // The vertical axis is a time scale that runs from 00:00 - 23:59
                // The horizontal axis is a time scale that runs from the 2011-01-01 to 2011-12-31

                var y = d3.time.scale().domain([new Date(year, 0, 1), new Date(year, 0, 1, 23, 59)]).range([0, height]);
                var x = d3.time.scale().domain([new Date(year, 0, 1), new Date(year, 11, 31)]).range([0, width]);

                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                // Sunrise and sun set times for dates in 2011. I have picked the 1st
                // and 15th day of every month, plus other important dates like equinoxes
                // and solstices and dates around the standard time/DST transition.

                console.log("city = " + cityObj.Name + " gmtOffset = " + cityObj.GmtOffset);
                var sunyearPromise = Sunclock.getSunyear(year, cityObj.Latitude, cityObj.Longitude, cityObj.GmtOffset);

                sunyearPromise.then(function (result) {
                    console.log("result = " + JSON.stringify(result[0]));
                    suntimes = result;
 
                function yAxisLabel(d) {
                    if (d == 12) { return "noon"; }
                    if (d < 12) { return d; }
                    return (d - 12);
                }

                // The labels along the x axis will be positioned on the 
                // 15th of the month.
                function midMonthDates() {
                    return d3.range(0, 12).map(function (i) { return new Date(year, i, 15) });
                }

                var dayLength = d3.select("svg")
                  .attr("width", width + padding * 2)
                  .attr("height", height + padding * 2);

                // Create a group to hold the axis-related elements
                var axisGroup = dayLength.append("svg:g").
                  attr("transform", "translate(" + padding + "," + padding + ")");

                // Draw the x and y tick marks. Since they are behind the visualization, they
                // can be drawn all the way across it. Because they have been
                // translated, they stick out the left side by going negative.

                axisGroup.selectAll(".yTicks")
                  .data(d3.range(5, 22))
                  .enter().append("svg:line")
                  .attr("x1", -5)
                  // Round and add 0.5 to fix anti-aliasing effects (see above)
                  .attr("y1", function (d) { return d3.round(y(new Date(year, 0, 1, d))) + 0.5; })
                  .attr("x2", width + 5)
                  .attr("y2", function (d) { return d3.round(y(new Date(year, 0, 1, d))) + 0.5; })
                  .attr("stroke", "lightgray")
                  .attr("class", "yTicks");

                axisGroup.selectAll(".xTicks")
                  .data(midMonthDates)
                  .enter().append("svg:line")
                  .attr("x1", x)
                  .attr("y1", -5)
                  .attr("x2", x)
                  .attr("y2", height + 5)
                  .attr("stroke", "lightgray")
                  .attr("class", "yTicks");

                // Draw the text for the labels. Since it is the same on top and
                // bottom, there is probably a cleaner way to do this by copying the
                // result and translating it to the opposite side

                axisGroup.selectAll("text.xAxisTop").
                  data(midMonthDates).
                  enter().
                  append("svg:text").
                  text(function (d, i) { return monthNames[i]; }).
                  attr("x", x).
                  attr("y", -8).
                  attr("text-anchor", "middle").
                  attr("class", "axis xAxisTop");

                axisGroup.selectAll("text.xAxisBottom")
                  .data(midMonthDates)
                  .enter()
                  .append("svg:text")
                  .text(function (d, i) { return monthNames[i]; })
                  .attr("x", x)
                  .attr("y", height + 15)
                  .attr("text-anchor", "middle")
                  .attr("class", "xAxisBottom");

                axisGroup.selectAll("text.yAxisLeft")
                  .data(d3.range(5, 22))
                  .enter()
                  .append("svg:text")
                  .text(yAxisLabel)
                  .attr("x", -7)
                  .attr("y", function (d) { return y(new Date(year, 0, 1, d)); })
                  .attr("dy", "3")
                  .attr("class", "yAxisLeft")
                  .attr("text-anchor", "end");

                axisGroup.selectAll("text.yAxisRight")
                  .data(d3.range(5, 22))
                  .enter()
                  .append("svg:text")
                  .text(yAxisLabel)
                  .attr("x", width + 7)
                  .attr("y", function (d) { return y(new Date(year, 0, 1, d)); })
                  .attr("dy", "3")
                  .attr("class", "yAxisRight")
                  .attr("text-anchor", "start");

                // Create a group for the sunrise and sunset paths
                var lineGroup = dayLength.append("svg:g").
                  attr("transform", "translate(" + padding + ", " + padding + ")");

                // Draw the background. The part of this that remains uncovered will
                // represent the daylight hours
                lineGroup.append("svg:rect")
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("height", height)
                  .attr("width", width)
                  .attr("fill", "PaleGoldenRod");

                 // Draw a circle for today's sunrise
                 if ($scope.sunrise != "N/A")
                 {
                     var sunrise = ($scope.sunrise).split(":");
                     lineGroup.append("circle")
                       .attr("cx", x(today))
                       .attr("cy", y(new Date(year, 0, 1, sunrise[0], sunrise[1])))
                       .attr("r", 5)
                       .attr("fill", "yellow")
                 }

                // The meat of the visualization is surprisingly simple. sunriseLine
                // and sunsetLine are areas (closed svg:path elements) that use the date
                // for the x coordinate and sunrise and sunset (respectively) for the y
                // coordinate. The sunrise shape is anchored at the top of the chart, and
                // sunset area is anchored at the bottom of the chart.

                function extremeSunrise(sunriseHr, sunriseMin)
                {
                    if (sunriseHr == 0 && sunriseMin == 0) {
                        return true;
                    }
                    else if (sunriseHr == -1 && sunriseMin == -1) {
                        return true;
                    }
                    else if (sunriseHr == -2 && sunriseMin == -2) {
                        console.log("sunrise could not be calculated");
                        return true;
                    }
                    else if (sunriseHr < 0 || sunriseMin < 0) {
                        console.log("extreme sunrise");
                        return true;
                    }

                    return false;
                }

                var sunriseLine = d3.svg.area()
                  .x(function (d) { return x(new Date(d.year, d.month, d.day)) })
                  .y0(0)
                  .y1(function (d) {
                      var sunriseHr = d.sunrise[0], sunriseMin = d.sunrise[1];
                    
                      // console.log(d.month + "/" + d.day + "/" + d.year + " sunriseHr = " + sunriseHr + " sunriseMin = " + sunriseMin);
                      if (extremeSunrise(sunriseHr, sunriseMin))
                      {
                          return 0;
                      }

                      return y(new Date(year, 0, 1, sunriseHr, sunriseMin));
                  })
                  .interpolate("linear");

                lineGroup.
                  append("svg:path")
                  .attr("d", sunriseLine(suntimes))
                  .attr("fill", "#707070")
                  .attr("opacity", 0.60);

                function extremeSunset(sunsetHr, sunsetMin)
                {
                    if (sunsetHr == 0 && sunsetMin == 0) {
                        return true;
                    }
                    else if (sunsetHr == -1 && sunsetMin == -1) {
                        return true;
                    }
                    else if (sunsetHr == -2 && sunsetMin == -2) {
                        console.log("sunset could not be calculated");
                        return true;
                    }
                    else if (sunsetHr < 0 || sunsetMin < 0) {
                        console.log("extreme sunset");
                        return true;
                    }

                    return false;
                }

                var sunsetLine = d3.svg.area()
                  .x(function(d) { return x(new Date(d.year, d.month, d.day))})
                  .y0(height)
                  .y1(function (d) {
                      var sunsetHr = d.sunset[0], sunsetMin = d.sunset[1];
                      
                      if (extremeSunset(sunsetHr, sunsetMin))
                      {
                          if (sunsetHr == 0 && sunsetMin == 0)
                          {
                              return 0;
                          }
                          return height;
                      }

                      return y(new Date(year, 0, 1, sunsetHr, sunsetMin));
                  })
                  .interpolate("linear");

                lineGroup.append("svg:path")
                  .attr("d", sunsetLine(suntimes))
                  .attr("fill", "#707070")
                  .attr("opacity", 0.60);


                 // Add line for the spring equinox
                 var springEquinox = new Date(year, 2, 21);

                 lineGroup.append('line')
                  .attr('x1', x(springEquinox))
                  .attr('x2', x(springEquinox))
                  .attr('y1', 0)
                  .attr('y2', height)
                  .attr("stroke", "gray")
                  .attr("stroke-width", 1)
                  .style('stroke-dasharray', ('8, 3'))
                  .attr('class', 'equinox');

                 // Add line for the fall equinox
                 var fallEquinox = new Date(year, 8, 22);

                 lineGroup.append('line')
                  .attr('x1', x(fallEquinox))
                  .attr('x2', x(fallEquinox))
                  .attr('y1', 0)
                  .attr('y2', height)
                  .attr("stroke", "gray")
                  .attr("stroke-width", 1)
                  .style('stroke-dasharray', ('8, 3'))
                  .attr('class', 'equinox');

                 // Add a line for today
                 lineGroup.append('line')
                  .attr('x1', x(today))
                  .attr('x2', x(today))
                  .attr('y1', 0)
                  .attr('y2', height)
                  .attr("stroke", "black")
                  .attr("stroke-width", 1)
                  .style('stroke-dasharray', ('8, 3'))
                  .attr('class', 'today');

                 // Draw a circle for today's sunrise
                 if ($scope.sunrise != "N/A")
                 {
                     var sunrise = ($scope.sunrise).split(":");
                     lineGroup.append("circle")
                       .attr("cx", x(today))
                       .attr("cy", y(new Date(year, 0, 1, sunrise[0], sunrise[1])))
                       .attr("r", 5)
                       .attr("fill", "orange")
                 }

                 // Draw a circle for today's midday
                 if ($scope.midday != "N/A") {
                     var midday = ($scope.midday).split(":");
                     lineGroup.append("circle")
                       .attr("cx", x(today))
                       .attr("cy", y(new Date(year, 0, 1, midday[0], midday[1])))
                       .attr("r", 5)
                       .attr("fill", "yellow")
                 }

                 // Draw a circle for today's sunset
                 if ($scope.sunset != "N/A") {
                     var sunset = ($scope.sunset).split(":");
                     lineGroup.append("circle")
                       .attr("cx", x(today))
                       .attr("cy", y(new Date(year, 0, 1, sunset[0], sunset[1])))
                       .attr("r", 5)
                       .attr("fill", "red")
                 }
                
                 // Finally, draw a line representing 12:00 noon across 
                 // the entire visualization
                lineGroup.append("svg:line")
                  .attr("x1", 0)
                  .attr("y1", d3.round(y(new Date(year, 0, 1, 12))) + 0.5)
                  .attr("x2", width)
                  .attr("y2", d3.round(y(new Date(year, 0, 1, 12))) + 0.5)
                  .attr("stroke", "lightgray");

             }) // close sunyearPromise.then
            }  // close sunlight

            }, 0);
        })
    
}])