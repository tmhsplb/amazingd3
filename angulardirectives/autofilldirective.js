AmazingD3App.directive('autoFill', function($timeout) {
    return {
        restrict: 'EA',
        scope: {
            autoFill: '&',
            ngModel: '='
        },
        
        compile: function (tEle, tAttrs) {
          //  console.log("compile: tEle = " + JSON.stringify(tEle));
          //  console.log("compile: tAttrs = " + JSON.stringify(tAttrs));

            /*
            var tplEl = angular.element('<div class="typeahead">' +
                  '<input id="location-input" type="text" autocomplete="off" />' 
                  //'<ul id="autolist" ng-show="{{reslist}}">' +
                  //  '<ul id="autolist" ng-show="reslist">' +
                  //  '<li ng-repeat="res in reslist">{{res.name}}</li>' +
                 // '</ul>' +
                 // '</div>'
                  );
                
            var input = tplEl.find('input');
            
            console.log("tAttrs.type = " + tAttrs.type);
            console.log("tAttrs.ngModel = " + tAttrs.ngModel);
            input.attr('type', tAttrs.type);
            input.attr('ng-model', tAttrs.ngModel);
         //   input.attr('id', 'location-input')
            tEle.replaceWith(tplEl);
          */
           // console.log("compile: tEle = " + JSON.stringify(tEle));
          
            // link function
            return function (scope, ele, attrs, ctrl) {
             //   console.log("link: ele = " + JSON.stringify(ele));
                var minKeyCount = attrs.minKeyCount || 2,
                timer,
               // original: input = ele.find('input');
                input = $("#location-input");
             

                input.bind('keyup', function (e) {
                    // console.log("e = " + JSON.stringify(e));
                   // Original: val = ele.val();
                    val = input.val();
                  
                    if (val.length < minKeyCount) {
                        console.log("link: cancel timer");
                        if (timer) $timeout.cancel(timer);
                        scope.reslist = null;
                        return;
                    } else {
                        if (timer) $timeout.cancel(timer);
                        timer = $timeout(function () {
                            console.log("Call scope.autoFill");
                           // var data = scope.autoFill()(val)
                           // console.log("data = " + data);
                            
                            scope.autoFill()(val)
                            .then(function (data) {
                               // console.log("data = " + JSON.stringify(data));
                                if (data && data.length > 0) {
                                        var items = [];
                                        $('#location-results').empty();
                                        $.each(data, function (index, location) {
                                          //  items.push('<li data-location="' + location.l + '">' + location.name + " " + location.lat + '</li>');
                                           items.push('<li data-location="' + location.ll + '">' + location.name + '</li>');
                                            // items.push("<li style='font-size:16px; line-height:1.4; cursor:pointer; background:white; border:1px solid #ccc; border-top:none; padding:5px 10px 3px;' data-location='" + location.l + '">' + location.name + '</li>');
                                        });
                                        $('<ul/>', {
                                           //  $("<ul style='list-style-type:none; font-family: helvetica, sans-serif; padding-left:0; margin-top: 0px;' />", {
                                            'class': 'location-list',
                                            html: items.join('')
                                        }).appendTo('#location-results');
                                    
                                   // scope.reslist = data;
                                   // scope.ngModel = data[0].zmw;
                                   // scope.ngModel = data[0].name;
                                    //  console.log("link: scope.reslist = " + JSON.stringify(scope.reslist))
                                }
                                
                            })
                            
                        }, 300);
                    }
                });

                // Hide the reslist on blur
                /*
                input.bind('blur', function (e) {
                    alert("blur");
                    scope.reslist = null;
                    scope.$digest();
                })
                */
            }
        }
    }
}
)
                
       