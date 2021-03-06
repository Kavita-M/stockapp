angular.module('app.services', [])
.factory('stockDataService', function($q, $http){
	var getPriceData=function(ticker,todayDateString){

		var deferred=$q.defer(),
		url="https://www.quandl.com/api/v3/datasets/SSE/"+ticker+".json?api_key=8D-yP6L3JtwcMJ4a9M1D"+todayDateString;
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
.factory('chartDataCacheService', function(CacheFactory) {

	var chartDataCache;

	if(!CacheFactory.get('chartDataCache')) {

		chartDataCache = CacheFactory('chartDataCache', {
			maxAge: 60 * 60 * 8 * 1000,
			deleteOnExpire: 'aggressive',
			storageMode: 'localStorage'
		});
	}
	else {
		chartDataCache = CacheFactory.get('chartDataCache');
	}

	return chartDataCache;
})
.factory('notesCacheService', function(CacheFactory) {
 
   var notesCache;
 
   if(!CacheFactory.get('notesCache')) {
     notesCache = CacheFactory('notesCache', {
       storageMode: 'localStorage'
     });
   }
   else {
     notesCache = CacheFactory.get('notesCache');
   }
 
   return notesCache;
 })
.factory('chartDataService', function($q, $http,chartDataCacheService) {
	var getHistoricalData = function(ticker,appendString) {
		var deferred = $q.defer(),
		cacheKey = ticker+appendString,
		chartDataCache = chartDataCacheService.get(cacheKey),
		url="https://www.quandl.com/api/v3/datasets/SSE/"+ticker+".json?api_key=8D-yP6L3JtwcMJ4a9M1D"+appendString;
		if(chartDataCache) {
       deferred.resolve(chartDataCache);
     }
     else {
		$http.get(url)
		.success(function(json) {
			var jsonData = json.dataset.data;

			var priceData = [],
			volumeData = [],
			lowData=[],
			lastData=[],
			highData=[];
			angular.forEach(jsonData, function(value1, key1) {
				var dateToMillis = value1[0],
				date = Date.parse(dateToMillis),

				high= parseFloat(Math.round(value1[1] * 100) / 100).toFixed(3),
				low= parseFloat(Math.round(value1[2] * 100) / 100).toFixed(3),
				last= parseFloat(Math.round(value1[3] * 100) / 100).toFixed(3),
				price = parseFloat(Math.round(value1[4] * 100) / 100).toFixed(3),
				volume = value1[5],
				highDatum = '[' + date + ',' + high + ']',
				lowDatum = '[' + date + ',' + low + ']',
				lastDatum = '[' + date + ',' + last + ']',
				volumeDatum = '[' + date + ',' + volume + ']',
				priceDatum = '[' + date + ',' + price + ']';

				highData.unshift(highDatum);

				lowData.unshift(lowDatum);
				lastData.unshift(lastDatum);

				volumeData.unshift(volumeDatum);
				priceData.unshift(priceDatum);

			});
			var formattedChartData =
			'['+'{' +
			'"key":' + '"high",' +
			'"bar":' + 'true,' +
			'"values":' + '[' + highData + ']' +
			'},' +
			'{' +
			'"key":' + '"low",' +

			'"values":' + '[' + lowData + ']' +
			'},' +
			'{' +
			'"key":' + '"last",' +

			'"values":' + '[' + lastData + ']' +
			'},' +
			'{' +
			'"key":' + '"previous Day Price",' +

			'"values":' + '[' + priceData+ ']' +
			'}' 
			+']';		

			deferred.resolve(formattedChartData);
			chartDataCacheService.put(cacheKey, formattedChartData);
			
		})
		.error(function(error) {
			console.log("Chart data error: " + error);
			deferred.reject();
		});
	}
		return deferred.promise;
	}
	return {
		getHistoricalData: getHistoricalData
	};
})
.factory('notesService', function(notesCacheService) {
 
   return {
 
     getNotes: function(ticker) {
       return notesCacheService.get(ticker);
     },
 
     addNote: function(ticker, note) {
 
       var stockNotes = [];
 
       if(notesCacheService.get(ticker)) {
         stockNotes = notesCacheService.get(ticker);
         stockNotes.push(note);
       }
       else {
         stockNotes.push(note);
       }
 
       notesCacheService.put(ticker, stockNotes);
     },
 
     deleteNote: function(ticker, index) {
 
       var stockNotes = [];
 
       stockNotes = notesCacheService.get(ticker);
       stockNotes.splice(index, 1);
       notesCacheService.put(ticker, stockNotes);
     }
   };
 })

;
