{
	"main": "main.js",
	"name": "<%=modname %>",
	"mode": "development",
	"port": 8000,
	"libs": ["routes", "controllers", "services", "validators", "dtos", "daos"],
	"modes": {
		"production": {
			"env": {
				"NODE_TLS_REJECT_UNAUTHORIZED": "0"
			},
			"ssl": {
				"key": "ssl/ssl-key.pem",
				"cert": "ssl/ssl-cert.pem"
			},
			"silent": true
		},
		"development": {
			"allowOrigin": true,
			"silent": false
		},
		"testing": {
			"allowOrigin": true,
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
