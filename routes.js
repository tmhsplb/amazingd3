AmazingD3App.config(function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/', { controller: 'homeController', templateUrl: 'partials/home.html' })
      .when('/Background', { controller: 'backgroundController', templateUrl: 'partials/background.html' })
      .when('/Examples', { controller: 'examplesController', templateUrl: 'partials/examples.html' })
      .when('/Extras', { controller: 'extrasController', templateUrl: 'partials/extras.html' })
      .when('/Sunyear', { controller: 'sunyearController', templateUrl: 'partials/sunyear.html' })
      .otherwise({ redirectTo: '/' });

   // $httpProvider.defaults.useXDomain = true;
  //  delete $httpProvider.defaults.headers.common['X-Requested-With'];
});


 
