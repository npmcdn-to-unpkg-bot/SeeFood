'use strict';

var app = angular.module('seeFoodApp');

app.controller('detailCtrl', function($scope, $stateParams, RestaurantService) {
	$scope.restaurant = RestaurantService.findLike($stateParams);
	console.log('detail resto: ', $scope.restaurant);

	$scope.distanceInMiles = function(meters) {
		return Math.round(meters * 0.000621371192);
	}

	console.log($scope.distanceInMiles($scope.restaurant.distance));
})
