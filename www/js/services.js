angular.module('app.services', [])
.factory('stockDataService', function($q, $http){
	var getPriceData=function(ticker,todayDate){

			var deferred=$q.defer(),
			url="https://www.quandl.com/api/v3/datasets/SSE/"+ticker+".json?api_key=8D-yP6L3JtwcMJ4a9M1D"+todayDate;
				$http.get(url).success(function(json){
					var jsonData=json.dataset;
					deferred.resolve(jsonData);
					
				})
				.error(function(error){
					console.log("Price data error:" + error)
					deferred.reject();
				});
			
			return deferred.promise;
		};	 
 
	return {
		getPriceData:getPriceData
	}
})

;
