'use strict';

var app = angular.module('seeFoodApp');

app.service('RestaurantService', function($http, API, $cordovaGeolocation) {
	this.restaurants = [];
	this.likes = [];
	this.filterObj = {};

	this.findMe = function() {
	  var posOptions = {
	    enableHighAccuracy: true,
	    timeout: 20000,
	    maximumAge: 0
	  };

	  var geolocateTimer = window.setTimeout(() => {
	  	this.filterObj = {
		      lat: 37.5489946970847,
		      lng: -121.9429642028612
		    }
		    this.buildFilter(this.filterObj);
	  }, 10000);

	  $cordovaGeolocation.getCurrentPosition(posOptions)
		.then(position => {
			window.clearTimeout(geolocateTimer);
	    this.filterObj = {
	      lat: position.coords.latitude,
	      lng: position.coords.longitude
	    }
	    this.buildFilter(this.filterObj);
	  })

	}

	this.setRestaurants = function(data) {
		data.businesses = _.shuffle(data.businesses);
		this.restaurants = this.restaurants.concat(data.businesses);
	};

	this.swipeRestaurant = function() {
		this.restaurants.splice(0, 1);
		if(this.restaurants.length === 5) this.getRestaurants();
	};

	this.grabRestaurant = function() {
		return this.restaurants[0];
	};

	this.clearRestaurant = function() {
		this.restaurants = [];
	};

	this.grabLikes = function() {
		return this.likes;
	};

	this.addLike = function() {
		this.likes.push(this.restaurants[0]);
	};

	this.findLike = function(param) {
		for (var i = 0; i < this.likes.length; i++) {
			if(this.likes[i].id === param.id) return this.likes[i];
		}
	}

	this.buildFilter = function(obj) {
		var categories = [];
		this.filterObj.count = 0;
		this.filterObj.radius = obj.radius ? obj.radius * 1600 : 10 * 1600;
		this.filterObj.category = '';

		obj.glutenFree ? categories.push('gluten_free') : '';
		obj.vegetarian ? categories.push('vegetarian') : '';
		obj.vegan ? categories.push('vegan') : '';
		obj.kosher ? categories.push('kosher') : '';
		this.filterObj.category = categories.join(',');

		if(obj.location) {
			this.getCoords(obj.location)
				.then(res => {
					this.filterObj.lat = res.data.results[0].geometry.location.lat;
					this.filterObj.lng = res.data.results[0].geometry.location.lng;
					this.getRestaurants();
				}, function(err) {
					console.error(err)
				});
		} else {
			this.getRestaurants();
		}
	}

	this.getRestaurants = function() {
		return $http.put(`${API}/restaurants`, this.filterObj)
		.then(res => {
			res.data.businesses.forEach((ele, ind, arr) => {
				if(!ele.image_url) {
					res.data.businesses.splice(arr.indexOf(ele), 1);
				} else {
					ele.image_url = ele.image_url.replace(/\S{2}(\.jpg)$/, 'o.jpg');
				}
			});

			this.filterObj.count += res.data.businesses.length;
			this.setRestaurants(res.data);
		}, function(err) {
			console.error(err)
		});
	}

	this.getCoords = function(address) {
		var urlAddress = address.split(' ').join('+');
		return $http.get(`https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCVFibjTMF6wEQUlCV_O5zILn5urQUZ6Zo&address=${urlAddress}`);
	}
});