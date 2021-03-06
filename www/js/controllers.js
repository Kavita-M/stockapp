angular.module('app.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('MyStocksCtrl', function($scope) {
  $scope.myStocksArray = [
      {ticker: "SPB"},
      {ticker: "VROS"},
      {ticker: "MT3"},
      {ticker: "RIB"},
      {ticker: "HOC"}
    ];
})

.controller('StocksCtrl',['$scope','$stateParams','$http','$window','stockDataService','chartDataService','$ionicPopup','notesService' ,function($scope, $stateParams,$http,$window,stockDataService,chartDataService,$ionicPopup,notesService) {
  $scope.ticker = $stateParams.stockTicker;
  $scope.todayDate=moment().format("YYYY-MM-DD");

  $scope.chartView = 1;
  $scope.$on("$ionicView.afterEnter",function(){
    getPriceData();
    getChartData();
   
  });
  $scope.chartViewFunc = function(n) {
       $scope.chartView = n;
       getChartData();
     };

  function getPriceData(){
    $scope.todayDateString="&start_date="+moment().format("YYYY-MM-DD");
    $scope.todayDateString="&start_date=2017-12-01"
    var promise=stockDataService.getPriceData($scope.ticker,$scope.todayDateString);
  promise.then(function(data){
    
    $scope.stockPriceDetail=data;
   
  });
  }
  function getChartData() {
    if($scope.chartView == 5){
       
         $scope.appendString="" ;
       }else if($scope.chartView == 4){
         var r=moment().subtract(1, 'years').format("YYYY-MM-DD");
               $scope.appendString="&start_date=" +r;
             

       }else if($scope.chartView == 3){
        var r=moment().subtract(6, 'months').format("YYYY-MM-DD");
               $scope.appendString="&start_date=" +r;
         
       
       }else if($scope.chartView == 2){
        var r=moment().subtract(3, 'months').format("YYYY-MM-DD");
        
        $scope.appendString="&start_date=" +r;
        
       }else if($scope.chartView == 1){

        var r=moment().subtract(5, 'days').format("YYYY-MM-DD");
        $scope.appendString="&start_date=" +r;

       
       }

      var promise = chartDataService.getHistoricalData($scope.ticker, $scope.appendString, $scope.todayDateString);
      promise.then(function(data) {
      
 
        $scope.myData = JSON.parse(data)
         .map(function(series) {
           series.values = series.values.map(function(d) {      return  {x: d[0], y: d[1] }; });
           return series;
           console.log(series)
         });
        
       
      });
    }
   
  var xTickFormat = function(d) {
    var dx = $scope.myData[0].values[d] && $scope.myData[0].values[d].x || 0;
    if (dx > 0) {
      return d3.time.format('%x')(new Date(dx));
    }
    return null;
  };
        
  var x2TickFormat = function(d) {
    var dx = $scope.myData[0].values[d] && $scope.myData[0].values[d].x || 0;
    return d3.time.format('%x')(new Date(dx))
  };

  
  var y1TickFormat = function(d) {
    return d3.format(',f')(d);
  };
  
  var y2TickFormat = function(d) { 
    return '$' + d3.format(',.2f')(d) 
  };
  
  var y3TickFormat = function(d) {
    return d3.format(',f')(d);
  };
  
  var y4TickFormat = function(d) { 
    return '$' + d3.format(',.2f')(d) 
  };            
  
  var xValueFunction = function(d, i) { 
    return i;
  };
        console.log($scope.myData)
  $scope.chartOptions = {
    chartType: 'linePlusBarWithFocusChart',
    data: 'myData',
    
    margin: {top: 30, right: 60, bottom: 50, left: 70},
    useInteractiveGuideline: true,
    xValue: xValueFunction,
    xAxisTickFormat: xTickFormat,
    x2AxisTickFormat: x2TickFormat,
    y1AxisTickFormat: y1TickFormat,
    y2AxisTickFormat: y2TickFormat,
    y3AxisTickFormat: y3TickFormat,
    y4AxisTickFormat: y4TickFormat,
    transitionDuration: 50,
    showLegend:true
  }
  


 /*  $scope.chartOptions = {
      chartType: 'linePlusBarWithFocusChart',
      data: 'myData',
     height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 40
                },
      
      
      interpolate: "cardinal",
      useInteractiveGuideline: true,
      yShowMaxMin: true,
      tooltips: true,
      showLegend: true,
      useVoronoi: false,
      xShowMaxMin: true,
      showXAxis:true,
      xValue: xValueFunction,
      xAxisTickFormat: xTickFormat,
      x2AxisTickFormat: x2TickFormat,
      y1AxisTickFormat: y1TickFormat,
      y2AxisTickFormat: y2TickFormat,
      y3AxisTickFormat: y3TickFormat,
      y4AxisTickFormat: y4TickFormat,
      y1AxisLabel:'Price',
      y3AxisLabel:'Volume',
      transitionDuration: 50,
      
   };
 */

 $scope.addNote = function() {
  console.log($scope.todayDate)
       $scope.note = {title: 'Note', body: '', date: $scope.todayDate, ticker: $scope.ticker};
 
       var note = $ionicPopup.show({
         template: '<input type="text" ng-model="note.title" id="stock-note-title"><textarea type="text" ng-model="note.body" id="stock-note-body"></textarea>',
         title: 'New Note for ' + $scope.ticker,
         scope: $scope,
         buttons: [
           {
             text: 'Cancel',
             onTap: function(e) {
               return;
             }
            },
           {
             text: '<b>Save</b>',
             type: 'button-balanced',
             onTap: function(e) {
               notesService.addNote($scope.ticker, $scope.note);
             }
           }
         ]
       });
 
       note.then(function(res) {
         $scope.stockNotes = notesService.getNotes($scope.ticker);
       });
     };
 
     $scope.openNote = function(index, title, body) {
       $scope.note = {title: title, body: body, date: $scope.todayDate, ticker: $scope.ticker};
 
       var note = $ionicPopup.show({
         template: '<input type="text" ng-model="note.title" id="stock-note-title"><textarea type="text" ng-model="note.body" id="stock-note-body"></textarea>',
         title: $scope.note.title,
         scope: $scope,
         buttons: [
           {
             text: 'Delete',
             type: 'button-assertive button-small',
             onTap: function(e) {
               notesService.deleteNote($scope.ticker, index);
             }
           },
           {
             text: 'Cancel',
             type: 'button-small',
             onTap: function(e) {
               return;
             }
            },
           {
             text: '<b>Save</b>',
             type: 'button-balanced button-small',
             onTap: function(e) {
               notesService.deleteNote($scope.ticker, index);
               notesService.addNote($scope.ticker, $scope.note);
             }
           }
         ]
       });
 
       note.then(function(res) {
         $scope.stockNotes = notesService.getNotes($scope.ticker);
       });
     };
}]);
