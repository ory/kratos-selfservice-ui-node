export const login = {
    "id": "bda73c77-1e21-4bfd-b85a-322fce2e4576",
    "expires_at": "2020-01-28T13:48:04.690715Z",
    "issued_at": "2020-01-28T13:38:04.690732Z",
    "request_url": "http://127.0.0.1:4455/auth/browser/login",
    "methods": {
        "oidc": {
            "method": "oidc",
            "config": {
                "action": "http://127.0.0.1:4455/.ory/kratos/public/auth/browser/methods/oidc/auth/bda73c77-1e21-4bfd-b85a-322fce2e4576",
                "method": "POST",
                "fields": {
                    "csrf_token": {
                        "name": "csrf_token",
                        "type": "hidden",
                        "required": true,
                        "value": "QJreyXtUD4oUSJfGNjA/+6ydsQyq0o/rfTL6QK86VadVFg6mwgX5x1QHVQ6uRqKxmwAcavQup3ILCSwl7ke97g=="
                    }
                }
            }
        },
        "password": {
            "method": "password",
            "config": {
                "action": "http://127.0.0.1:4455/.ory/kratos/public/auth/browser/methods/password/login?request=bda73c77-1e21-4bfd-b85a-322fce2e4576",
                "method": "POST",
                "fields": {
                    "csrf_token": {
                        "name": "csrf_token",
                        "type": "hidden",
                        "required": true,
                        "value": "M1gAKA8fIhw4JOpQ/5m9mKARBAvKhzWkyhbxjtZNLG8m1NBHtk7UUXhrKJhn7yDSl4ypbZR7HT28LSfrlzDEJg=="
                    },
                    "identifier": {"name": "identifier", "type": "text", "required": true, "value": "asfdasdffads"},
                    "password": {"name": "password", "type": "password", "required": true}
                },
                "errors": [{"message": "The provided credentials are invalid. Check for spelling mistakes in your password or username, email address, or phone number."}]
            }
        }
    }
}

export const registration = {
    "id": "dbff7b96-8116-42c5-8624-f9fb28f1db15",
    "expires_at": "2020-01-28T13:49:01.2274112Z",
    "issued_at": "2020-01-28T13:39:01.2274261Z",
    "request_url": "http://127.0.0.1:4455/auth/browser/registration",
    "methods": {
        "oidc": {
            "method": "oidc",
            "config": {
                "action": "http://127.0.0.1:4455/.ory/kratos/public/auth/browser/methods/oidc/auth/dbff7b96-8116-42c5-8624-f9fb28f1db15",
                "method": "POST",
                "fields": {
                    "csrf_token": {
                        "name": "csrf_token",
                        "type": "hidden",
                        "required": true,
                        "value": "xwb6A6iHdsguYwkAM6m3jj196E7TcmiWpAavIRxuAgXSiipsEdaAhW4sy8ir3yrECuBFKI2OQA/SPXlEXRPqTA=="
                    }
                }
            }
        },
        "password": {
            "method": "password",
            "config": {
                "errors": [{"message": "The provided credentials are invalid. Check for spelling mistakes in your password or username, email address, or phone number."}],
                "action": "http://127.0.0.1:4455/.ory/kratos/public/auth/browser/methods/password/registration?request=dbff7b96-8116-42c5-8624-f9fb28f1db15",
                "method": "POST",
                "fields": {
                    "csrf_token": {
                        "name": "csrf_token",
                        "type": "hidden",
                        "required": true,
                        "value": "xLg4B9WnuC0Ue+j9ay5EQvleaJpOl0H9xJJ7W3+Bwv7RNOhobPZOYFQ0KjXzWNkIzsPF/BBraWSyqa0+Pvwqtw=="
                    },
                    "password": {
                        "name": "password", "type": "password", "required": true,
                        "errors": [{"message": "password: Is required"}]
                    },
                    "traits.email": {
                        "name": "traits.email",
                        "type": "text",
                        "value": "",
                        "errors": [{"message": "traits.email: String length must be greater than or equal to 3"}, {"message": "traits.email: Does not match format 'email'"}]
                    }
                }
            }
        }
    }
}