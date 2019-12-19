
SunclockServices.factory('Sunclock', ['$http', '$q', '$resource', function ($http, $q, $resource) {

    var getSuntimes = function (year, month, date, lat, lon, gmtOffset, dstOffset) {
        if (debugging == true) {
            
            return $http.get("http://localhost/AmazingD3/api/sunclock", { params: { "year": year, "month": month, "date": date, "latitude": lat, "longitude": lon, "gmtOffset": gmtOffset, "dstOffset": dstOffset } }).then(function (result) {
                return result.data;
            })
        }

        return $http.get("https://amazingd3.apphb.com/api/sunclock/", { params: { "year": year, "month": month, "date": date, "latitude": lat, "longitude": lon, "gmtOffset": gmtOffset, "dstOffset": dstOffset } }).then(function (result) {
            return result.data;
        });
    };

    var getUTCOffset = function (latitude, longitude, timestamp) {
        var googleURL = "https://maps.googleapis.com/maps/api/timezone/json?" + "location=" + latitude + ',' + longitude + "&timestamp=" + timestamp / 1000 + "&key=AIzaSyAFp0_vpwaru89cdAdBZw3SjAj9CMVDFwU" + "&format=json&callback=?";

        //console.log("googleURL = " + googleURL);
        return $http({
            method: 'GET',
            url: googleURL,
            dataType: "json",
            headers: { 'Content-Type': 'application/json' }
        }).success(function (result) {
            // console.log("result = " + JSON.stringify(result));
            return result;
        });
    };

    var getSunyear = function (year, lat, lon, gmtOffset) {
        if (debugging == true) {

            return $http.get("http://localhost/AmazingD3/api/sunclock", { params: { "year": year, "latitude": lat, "longitude": lon, "gmtOffset": gmtOffset } }).then(function (result) {
                return result.data;
            })
        }

        return $http.get("https://amazingd3.apphb.com/api/sunclock/", { params: { "year": year, "latitude": lat, "longitude": lon, "gmtOffset": gmtOffset } }).then(function (result) {
            return result.data;
        });
    };

    return {
        getSuntimes: getSuntimes,
        getUTCOffset: getUTCOffset,
        getSunyear: getSunyear
    }
}]);