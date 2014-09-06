var snooze = require('snooze');

snooze.module('<%= modname %>').service('Test', function($q) {
	var _getWelcomeMessage = function() {
		var defer = $q.defer();

		defer.resolve('We\'re Running!');

		return defer.promise;
	};

	return {
		getWelcomeMessage: _getWelcomeMessage
	}
});