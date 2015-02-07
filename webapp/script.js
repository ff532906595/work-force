var mainApp = angular.module('mainApp', ['ngRoute', 'tc.chartjs']);

// configure our routes
mainApp.config(function($routeProvider) {
	$routeProvider

		// route for the dashboard page, default
		.when('/', {
			templateUrl : "partials/dashboard.html",
			controller  : 'dashController'
		})
		
		// route for the dashboard page, redirected from facebook
		.when('/_=_', {
			templateUrl : "partials/dashboard.html",
			controller  : 'dashController'
		})		
		
		.when('/dashboard', {
			templateUrl : "partials/dashboard.html",
			controller  : 'dashController'
		})

		// route for the chart1 page
		.when('/charts1', {
			templateUrl : '/partials/charts1.html',
			controller  : 'chart1Controller'
		})

		// route for the chart2 page
		.when('/charts2', {
			templateUrl : '/partials/charts2.html',
			controller  : 'chart2Controller'
		})

		// route for the talent search page
		.when('/talentsearch', {
			templateUrl : '/partials/talentsearch.html',
			controller  : 'talentController'
		})
		
		// route for the trends page
		.when('/trends', {
			templateUrl : '/partials/trends.html',
			controller  : 'trendController'
		});
});

mainApp.directive('d3pieChart', function($parse, $http) {
	var directiveDefinitionObject = {
		restrict: 'E',
		replace: false,
		scope: {name: '=chartName'},
		link: function(scope, element, attrs) {
			$http.get('dummy_data.json')
			.success(function(response) {
				var dirData = response[scope.name];
				var w = 350,
					h = 350,
					r = 150,
					inner = 70,
					color = d3.scale.category20c();
					
				var vis = d3.select(element[0])
					.append("svg:svg")
					.data([dirData])
					.attr("width", w)
					.attr("height", h)
					.append("svg:g")
					.attr("transform", "translate(" + r * 1.1 + "," + r * 1.1 + ")");

				
				var textTop = vis.append("text")
					.attr("dy", ".35em")
					.style("text-anchor", "middle")
					.attr("class", "textTop")
					.attr("y", -10),
				textBottom = vis.append("text")
					.attr("dy", ".35em")
					.style("text-anchor", "middle")
					.attr("class", "textBottom")
					.attr("y", 10);

				var arc = d3.svg.arc()
					.innerRadius(inner)
					.outerRadius(r);

				var arcOver = d3.svg.arc()
					.innerRadius(inner + 5)
					.outerRadius(r + 5);
				 
				var pie = d3.layout.pie().value(function(d) { return d.value; });
				 
				var arcs = vis.selectAll("g.slice")
					.data(pie)
					.enter()
						.append("svg:g")
							.attr("class", "slice")
							.on("mouseover", function(d) {
								d3.select(this).select("path").transition()
									.duration(200)
									.attr("d", arcOver)
								
								textTop.text(d3.select(this).datum().data.label)
									.attr("y", -10);
								textBottom.text(d3.select(this).datum().data.value + "%")
									.attr("y", 10);
							})
							.on("mouseout", function(d) {
								d3.select(this).select("path").transition()
									.duration(100)
									.attr("d", arc);
								textTop.text("");
								textBottom.text("");
							});

				arcs.append("svg:path")
					.attr("fill", function(d, i) { return color(i); } )
					.attr("d", arc);

				var legend = d3.select(element[0]).append("svg")
					.attr("class", "legend")
					.attr("width", r)
					.attr("height", r * 2)
					.selectAll("g")
					.data(color.domain().slice().reverse())
					.enter().append("g")
					.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

				legend.append("rect")
					.attr("width", 18)
					.attr("height", 18)
					.style("fill", color);

				legend.append("text")
					.attr("x", 24)
					.attr("y", 9)
					.attr("dy", ".35em")
					.text(function(d, i) { return dirData[i].label; });		
						
			});		

		}
	};

	return directiveDefinitionObject;
});

mainApp.directive('d3barChart', function($parse, $http) {
	var directiveDefinitionObject = {
		restrict: 'E',
		replace: false,
		scope: {name: '=chartName'},
		link: function(scope, element, attrs) {
			var width=350, height=350;
			var color = d3.scale.category20c();
			
			// scale to ordinal because x axis is not numerical
			var x = d3.scale.ordinal().rangeRoundBands([0, width * 0.6], .1);
			//scale to numerical value by height
			var y = d3.scale.linear().range([height, 0]);

			var chartSVG = d3.select(element[0])  
					  .append("svg")  //append svg element inside #chart
					  .attr("width", width)    //set width
					  .attr("height", height);  //set height

			var tip = d3.tip()
						.attr('class', 'd3-tip')
						.offset([-10, 0])
						.html(function(d) {
							return "<span style='color:red'>" + d.label + ":" + d.value + "</span>";
						});
			chartSVG.call(tip);	
			
			$http.get('dummy_data.json')
			.success(function(response) {
				var dirData = response[scope.name];
				x.domain(dirData.map(function(d){ return d.label}));
				y.domain([0, d3.max(dirData, function(d){return d.value})]);

				var bar = chartSVG.selectAll("g")
								.data(dirData)
								.enter()
									.append("g")
									.attr("transform", function(d, i){
										return "translate("+x(d.label)+", 0)";
									})
									.on('mouseover', tip.show)
									.on('mouseout', tip.hide);

				bar.append("rect")
					.attr("fill", function(d, i) { return color(i); } )
					.attr("y", function(d) { return y(d.value); })
					.attr("height", function(d) { return height - y(d.value); })
					.attr("width", x.rangeBand());  //set width base on range on ordinal data
				
				var legend = chartSVG.append("svg")
								.attr("class", "legend")
								.attr("x", width * 0.65)
								.selectAll("g")
								.data(color.domain().slice().reverse())
								.enter().append("g")
								.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

				legend.append("rect")
					.attr("width", 18)
					.attr("height", 18)
					.style("fill", color);

				legend.append("text")
					.attr("x", 24)
					.attr("y", 9)
					.attr("dy", ".35em")
					.text(function(d, i) { return dirData[i].label; });	

			});		

		}
	};

	return directiveDefinitionObject;	
});

// create the controller and inject Angular's $scope
mainApp.controller('dashController', function($scope, $http) {
	var hiresData = {
		labels: ["Support", "Executive", "Finance", "HR", "Marketing", "Operations", "Sales", "Technology"],
		datasets: [
			{
				label: "Hires of Employees",
				fillColor: "rgba(220,220,220,0.2)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(220,220,220,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)",
				data: []
			}
		]
	};
	
	var annualIncomeData = {
		labels: ["2012", "2013", "2014"],
		datasets: [
			{
				label: "Annual Income by Year",
				fillColor: "rgba(220,220,220,0.5)",
				strokeColor: "rgba(220,220,220,0.8)",
				highlightFill: "rgba(220,220,220,0.75)",
				highlightStroke: "rgba(220,220,220,1)",
				data: []
			}
		]
	};
	$http.get('dummy_data.json')
	.success(function(response) {
		//overview table
		$scope.overviews = response.overview;
		
		//hiresChart
		//hiresData.labels = response.hires.label;
		hiresData.datasets[0].data = response.hires.value;
		var hiresCtx = document.getElementById("hiresChart").getContext("2d");
		hiresCtx.canvas.width = 600;
		hiresCtx.canvas.height = 400;
		$scope.hiresChart = new Chart(hiresCtx).Line(hiresData);		
		
		//annualIncomeChart
		annualIncomeData.datasets[0].data = response.annualIncome.value;
		var annualIncomeCtx = document.getElementById("annualIncomeChart").getContext("2d");
		annualIncomeCtx.canvas.width = 600;
		annualIncomeCtx.canvas.height = 400;		
		$scope.annualIncomeChart = new Chart(annualIncomeCtx).Bar(annualIncomeData);	

		//salaryChart
		var salaryData = response.salaryIncome;

		var w = 600,
		    h = 400;

		var svg = d3.select("#salaryChart")
			.append("svg")
			.attr("width", w)
			.attr("height", h);
	
		var max_value = 0;
		for (var i = 0; i < salaryData.length; i++) {
			max_value = Math.max(salaryData[i].value, max_value);
		}
	
		var dx = w / max_value;
		var dy = h / salaryData.length;
		
		// bars
		var bars = svg.selectAll(".bar")
			.data(salaryData)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {return 0;})
			.attr("y", function(d, i) {return dy * i;})
			.attr("width", function(d, i) {return dx * d.value})
			.attr("height", 0.8 * dy)
			.attr("fill", "lightgrey");

		// labels
		var text = svg.selectAll("text")
			.data(salaryData)
			.enter()
			.append("text")
			.attr("class", function(d, i) {return "label " + d.label;})
			.attr("x", 15)
			.attr("y", function(d, i) {return dy*i + 15;})
			.text( function(d) {return d.label + " : $" + d.value + "/yr";})
			.attr("font-size", "15px")
			.style("font-weight", "bold");

		
	});
});

mainApp.controller('chart1Controller', function($scope, $http) {

});

mainApp.controller('chart2Controller', function($scope, $http) {

});

mainApp.controller('talentController', function($scope, $http) {
	$http.get('dummy_person.json')
	.success(function(response) {
		$scope.persons = response;
	});
});

mainApp.controller('trendController', function($scope) {
	$scope.message = 'Welcome to the Trends page.';
});























