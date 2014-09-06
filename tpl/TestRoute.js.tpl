var snooze = require('snooze');

snooze.module('<%= modname %>')
	.route('get', '/test', {
		action: 'isRunning',
		controller: 'TestCtrl'
	});