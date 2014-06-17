var snooze = require('snooze');

snooze.module('<%= modname %>')
	.libs(['routes', 'controllers', 'services', 'validators', 'dtos'])
	.setPort(8000);

snooze.module('flint').wakeup();