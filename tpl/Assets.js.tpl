var snooze = require('snooze');

snooze.module('<%=modname%>')
	.route('resource', '/assets/**/*', {})
	.route('resource', '/assets/*', {});