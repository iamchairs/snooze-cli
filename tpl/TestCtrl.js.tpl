var snooze = require('snooze');

snooze.module('<%= modname %>').controller('TestCtrl', function(
	$RouteResponse,
	Test,
	TestDTO) {

	var _isRunning = function(defer, data) {
		Test.getWelcomeMessage().then(function(msg) {
			defer.resolve($RouteResponse(200, TestDTO.fromString(msg)));
		});
	};

	return {
		isRunning: _isRunning
	}
});