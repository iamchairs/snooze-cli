{
	"main": "main.js",
	"name": "<%=modname %>",
	"mode": "development",
	"modes": {
		"produciton": {
			"silent": true
		},
		"development": {
			"silent": true
		},
		"testing": {
			"silent": true
		}
	},
	"unitTesting": {
		"path": "tests/unit/",
		"mocks": "tests/unit/mock/",
		"mode": "testing"
	},
	"db": {
		"connections": {
			"development": {
				"mode": "development",
				"engine": "mysql",
				"host": "localhost",
				"user": "admin",
				"password": "password",
				"database": "db"
			},
			"production": {
				"mode": "produciton",
				"engine": "mysql",
				"host": "localhost",
				"user": "admin",
				"password": "password",
				"database": "db"
			},
			"testing": {
				"mode": "testing",
				"engine": "mysql",
				"host": "localhost",
				"user": "admin",
				"password": "password",
				"database": "db"
			}
		}
	}
}
