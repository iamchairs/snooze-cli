var snooze = require('snooze');

snooze.module('<%= modname %>')
	.libs(['routes', 'controllers', 'services', 'validators', 'dtos', 'daos'])
	.setPort(8000);

snooze.module('<%=modname%>').wakeup();