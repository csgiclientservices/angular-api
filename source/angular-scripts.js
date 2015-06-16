(function(){
		
// Invision Integration
systemId = "a75ee8ce-3b8f-4ec6-99bc-2b7530303cf9";
channelId = "3de19ec6-1e66-4534-bb55-b6a49e6c2771";

// Home
angular.module("homeApp", ['directivesApp'])
.controller("homeScreen", ['$scope', '$http', function($scope, $http){
	$http.get("http://metadata.sbx1.cdops.net/StorefrontPage/SystemId/" + systemId + "/DistributionChannel/" + channelId).success(function(data,status) {
		// Store all Product data into a variable for later reference
		$scope.homeProducts = data.Products;

		// Set two variables to store sub-sets of the returned page data
		$scope.featuredItems = data.Page.FeaturedItems;
		$scope.bucketItems = data.Page.Buckets[0].Products;

		// Declare two empty arrays where we merge our returned Product and Page data
	 	$scope.finalFeatured = [];
	 	$scope.finalBucket = [];

	 	// Output merged featured items to banner
		angular.forEach($scope.homeProducts, function(value1, key1) {
			angular.forEach($scope.featuredItems, function(value2, key2) {
				if (value1.Value.Id === value2.ProductId) {
					$scope.finalFeatured.push({Id: value1.Value.Id, Name: value1.Value.Name, Image: value1.Value.ImageUrl});
				}
			});
		});

		// Output merged bucket items to bucket
		angular.forEach($scope.homeProducts, function(value1, key1) {
			angular.forEach($scope.bucketItems, function(value2, key2) {
				if (value1.Value.Id === value2) {
					$scope.finalBucket.push({Id: value1.Value.Id, Name: value1.Value.Name, Image: value1.Value.ImageUrl});
				}
			});
		});
	});
}]);
	
// Search	
angular.module("searchApp", ['ngRoute', 'directivesApp'])
	.controller("searchScreen", ['$scope', '$location', function($scope, $location){
		$scope.performSearch = function(searchTerm){
			$location.path("/" + searchTerm);
		};
	}])
	.controller("searchResults",['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
		$scope.searchResults = [];
		$scope.searchTerm = $routeParams.term;
		
		$http.get("https://services.sbx1.cdops.net/Subscriber/SearchProducts/systemId/" + systemId + "/SearchString/" + $scope.searchTerm).success(function(data,status) {
			$scope.searchResults = data.Products; 
		});
	}])
	.config(['$routeProvider', function($routeProvider) {
	  $routeProvider.when('/',{
	    templateUrl: "templates/search/search-form.html",
	    controller: "searchScreen"
	  }).when('/:term',{
	  	templateUrl: "templates/search/search-results.html",
	  	controller: "searchResults"
	  }).otherwise({
	  	redirectTo: "/",
	  });
}])

// Product
angular.module("productApp", ['ngRoute'])
	.controller("productPage",['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
		// Empty variables to store data retrieved from the server
		$scope.availablePlans = [];
		$scope.resultItem;

		$http.get("https://metadata.sbx1.cdops.net/Product/SystemId/" + systemId + "/Id/" + $routeParams.id).success(function(data,status) {
			// Data about this specific product request
			$scope.resultItem = data.Product;

			// Data to filter pricing plans based on context
			$http.get("https://services.sbx1.cdops.net/Subscriber/RetrieveProductContext/SystemId/" + systemId + "/ProductId/" + $routeParams.id + "/IncludeOrderablePricingPlans/true").success(function(data,status) {
				angular.forEach(data.ProductContext.OrderablePricingPlans, function(value1, key1) {
					angular.forEach($scope.resultItem.PricingPlans, function(value2, key2) {
						if (value1.Id === value2.Id) {
							$scope.availablePlans.push({"id":value1.Id,"amount":value1.DiscountedAmount,"name":value2.Name});
						}
					});
				});
			});
		});
	}])
	.config(['$routeProvider', function($routeProvider) {
	// Only a single route based on the product ID
	  $routeProvider.when('/:id',{
	  	templateUrl: "templates/product/product.html",
	  	controller: "productPage"
	  });
}]);

// Login and Logout
angular.module("loginApp", ['ngRoute', 'ngCookies'])
	.controller("loginScreen", ['$scope', '$http', '$location', '$cookieStore', function($scope, $http, $location, $cookieStore){
		$scope.performLogin = function(userName,userPass){
			$http.post("https://services.sbx1.cdops.net/Subscriber/CreateSession", {Login: userName, Password: userPass}, {headers: {'CD-SystemID': systemId}}).success(function(data,status) {
				$scope.userData = data;
				$cookieStore.put("sessionID",$scope.userData.SessionId);
				$cookieStore.put("sessionFN",$scope.userData.SessionSummary.FirstName);
				$cookieStore.put("sessionLN",$scope.userData.SessionSummary.LastName);
				$cookieStore.put("sessionLogin",$scope.userData.SessionSummary.Login);
				$scope.mySession = $cookieStore.get('sessionID');
				$scope.myFirst = $cookieStore.get('sessionFN');
				$scope.myLast = $cookieStore.get('sessionLN');
				$scope.myLogin = $cookieStore.get('sessionLogin');
				$location.path("/auth");
			});
		};

		$scope.performLogout = function(){
			$http.post("https://services.sbx1.cdops.net/Subscriber/CloseSession", {}, {headers: {'CD-SystemID': systemId, 'CD-SessionId': $scope.mySession}}).success(function(data,status) {
				$cookieStore.remove("sessionID");
				$cookieStore.remove("sessionFN");
				$cookieStore.remove("sessionLN");
				$location.path("/");
			});
		};

		if ($cookieStore.get("sessionID")) {
			$scope.mySession = $cookieStore.get('sessionID');
			$scope.myFirst = $cookieStore.get('sessionFN');
			$scope.myLast = $cookieStore.get('sessionLN');
			$scope.myLogin = $cookieStore.get('sessionLogin');
			$location.path("/auth");
		}
	}])
	.config(['$routeProvider', function($routeProvider) {
	  $routeProvider.when('/',{
	    templateUrl: "templates/login/login-form.html",
	  }).when('/auth',{
	  	templateUrl: "templates/login/login-panel.html",
	  }).otherwise({
	  	redirectTo: "/",
	  });
}]);

// Locker Items
angular.module("lockerApp", ['ngCookies', 'directivesApp'])
	.controller("lockerItems", ['$scope', '$http', function($scope, $http){

	$scope.lockerResults = [];

	$http.get("https://services.sbx1.cdops.net/Subscriber/SearchLocker/systemId/" + systemId, {headers: {'CD-SessionId': $cookieStore.get("sessionID")}}).success(function(data,status) {
		$scope.lockerResults = data.LockerItems;
	});
}]);

// Shared Directives 
angular.module("directivesApp", [])
	.directive("productSnippet", function() {
		return {
			restrict: "E",
			templateUrl: "templates/directives/product-snippet.html",
			scope: {
				title: "@",
				id: "@",
				image: "@"
			}
		};
	});

})();