(function(){
	
	var customFiltersModule = angular.module("customFiltersModule",[]);
	
	customFiltersModule.filter('capitalize', function() {
		 return function(input, scope) {
			 if (input != null) {
                 input = input.toLowerCase();
                 input = input.substring(0,1).toUpperCase()+input.substring(1);
             }
			 return input;
		 };
	});

    customFiltersModule.filter('trim', function() {
        return function(input, scope) {
            if (input != null){
                input = input.trim();
            }
            return input;
        };
    });

    customFiltersModule.filter('truncateDecimals', function() {
        return function(input, scope) {
            if (input != null && !isNaN(input)){
                input = input.toFixed(1);
            }
            return input;
        };
    });

    customFiltersModule.filter('numberWithCommas', function() {
        return function(input, scope) {
            if (input != null){
                input = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            return input;
        };
    });
})();