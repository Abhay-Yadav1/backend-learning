# Uber Backend API

## Register a user

Creates a new user account and returns an authentication token.

**Endpoint:** `POST /users/register`

### Required request format

Send the request body as JSON with the `Content-Type: application/json` header.

| Field | Required | Rules |
| --- | --- | --- |
| `fullname.firstname` | Yes | Must be at least 3 characters long. |
| `fullname.lastname` | No | If provided, must be at least 3 characters long. |
| `email` | Yes | Must be a valid email address. |
| `password` | Yes | Must be at least 6 characters long. |

### Example request

```http
POST /users/register
Content-Type: application/json
```

```json
{
  "fullname": {
    "firstname": "Aarav",
    "lastname": "Sharma"
  },
  "email": "aarav@example.com",
  "password": "securepassword"
}
```

### Status codes

| Status | Meaning | Response |
| --- | --- | --- |
| `201 Created` | The user was created successfully. | Returns a JWT `token` and the created `user` object. |
| `400 Bad Request` | One or more request fields failed validation. | Returns an `erros` array describing each validation error. |

### Success response (`201 Created`)

```json
{
  "token": "<jwt-token>",
  "user": {
    "_id": "<user-id>",
    "fullname": {
      "firstname": "Aarav",
      "lastname": "Sharma"
    },
    "email": "aarav@example.com"
  }
}
```

### Validation-error response (`400 Bad Request`)

```json
{
  "erros": [
    {
      "type": "field",
      "value": "ab",
      "msg": "First name must be at least 3 characters long",
      "path": "fullname.firstname",
      "location": "body"
    }
  ]
}
```

> Note: The API currently uses the response property name `erros` (as implemented), rather than `errors`.
