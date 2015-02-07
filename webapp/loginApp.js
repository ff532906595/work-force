
var app = angular.module('loginApp', []);

app.controller('loginController', function($scope) {
	$scope.inputEmail = "suki.yangzz@gmail.com";
	$scope.inputPassword = "12345678";
	$scope.submitLogin = function() {
		window.location = "main.html";
	}
});

