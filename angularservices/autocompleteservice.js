AmazingD3App.service('autocompleteService', function ($http, $q) {

    this.getCityDetails = function (query) {
        var wundergroundURL = "https://autocomplete.wunderground.com/aq?query=" + query + "&cb=JSON_CALLBACK";
        // console.log("new autocomplete URL = " + wundergroundURL);

        var d = $q.defer();

        $http({
            method: 'JSONP',
            url: wundergroundURL
        }).success(function (data) {
           // console.log("autocomplete data.RESULTS = " + JSON.stringify(data.RESULTS[0]));
            d.resolve(data.RESULTS);
        }).error(function (err) {
           // console.log("autocomplete err = " + JSON.stringify(err));
            $('#location-results').empty();
            d.reject(err);
        });

        return d.promise;
    }
  })

   