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

## Log in a user

Authenticates a registered user and returns an authentication token.

**Endpoint:** `POST /users/login`

### Required request format

Send the request body as JSON with the `Content-Type: application/json` header.

| Field | Required | Rules |
| --- | --- | --- |
| `email` | Yes | Must be a valid email address. |
| `password` | Yes | Must be at least 6 characters long. |

### Example request

```http
POST /users/login
Content-Type: application/json
```

```json
{
  "email": "aarav@example.com",
  "password": "securepassword"
}
```

### Status codes

| Status | Meaning | Response |
| --- | --- | --- |
| `200 OK` | The email and password are valid. | Returns a JWT `token` and the authenticated `user` object. |
| `400 Bad Request` | The email or password does not meet the request validation rules. | Returns an `erros` array describing each validation error. |
| `401 Unauthorized` | The email does not exist or the password is incorrect. | Returns an invalid-credentials message. |

### Success response (`200 OK`)

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

### Invalid-credentials response (`401 Unauthorized`)

```json
{
  "message": "Invalid email or password"
}
```

## Get user profile

Returns the currently authenticated user's profile.

**Endpoint:** `GET /users/profile`

### Authentication

Send the JWT in either of the following ways:

```http
Authorization: Bearer <jwt-token>
```

or use the `token` cookie returned by the login endpoint.

### Example request

```http
GET /users/profile
Authorization: Bearer <jwt-token>
```

### Status codes

| Status | Meaning | Response |
| --- | --- | --- |
| `200 OK` | The token is valid and belongs to a user. | Returns the authenticated user's profile. |
| `401 Unauthorized` | The token is missing, invalid, expired, or blacklisted. | Returns an unauthorized message. |

### Success response (`200 OK`)

```json
{
  "_id": "<user-id>",
  "fullname": {
    "firstname": "Aarav",
    "lastname": "Sharma"
  },
  "email": "aarav@example.com"
}
```

### Unauthorized response (`401 Unauthorized`)

```json
{
  "message": "Unauthorized"
}
```

## Log out a user

Logs out the authenticated user by clearing the `token` cookie and adding the JWT to the token blacklist. Blacklisted tokens expire after 24 hours.

**Endpoint:** `GET /users/logout`

### Authentication

This endpoint requires the same authentication as the profile route: send `Authorization: Bearer <jwt-token>` or include the `token` cookie.

### Example request

```http
GET /users/logout
Authorization: Bearer <jwt-token>
```

### Status codes

| Status | Meaning | Response |
| --- | --- | --- |
| `200 OK` | The token was blacklisted and the cookie was cleared. | Returns a logout confirmation. |
| `401 Unauthorized` | The token is missing, invalid, expired, or blacklisted. | Returns an unauthorized message. |

### Success response (`200 OK`)

```json
{
  "message": "Logged out"
}
```

## Register a captain

Creates a captain account with vehicle information and returns an authentication token.

**Endpoint:** `POST /captains/register`

### Required request format

Send the request body as JSON with the `Content-Type: application/json` header.

| Field | Required | Rules |
| --- | --- | --- |
| `fullname.firstname` | Yes | Must be at least 3 characters long. |
| `fullname.lastname` | No | If provided, must be at least 3 characters long. |
| `email` | Yes | Must be a valid email address. |
| `password` | Yes | Must be at least 6 characters long. |
| `vehicle.color` | Yes | Must be at least 3 characters long. |
| `vehicle.plate` | Yes | Must be at least 3 characters long. |
| `vehicle.capacity` | Yes | Must be an integer of at least `1`. |
| `vehicle.vehicleType` | Yes | Must be one of: `car`, `auto`, or `motorcycle`. |

### Example request

```http
POST /captains/register
Content-Type: application/json
```

```json
{
  "fullname": {
    "firstname": "Aarav",
    "lastname": "Sharma"
  },
  "email": "aarav.captain@example.com",
  "password": "securepassword",
  "vehicle": {
    "color": "Black",
    "plate": "DL01AB1234",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

### Status codes

| Status | Meaning | Response |
| --- | --- | --- |
| `201 Created` | The captain was created successfully. | Returns a JWT `token` and the created `captain` object. |
| `400 Bad Request` | Request validation failed, or a captain is already registered with that email. | Returns validation `errors` or a duplicate-email message. |

### Success response (`201 Created`)

```json
{
  "token": "<jwt-token>",
  "captain": {
    "_id": "<captain-id>",
    "fullname": {
      "firstname": "Aarav",
      "lastname": "Sharma"
    },
    "email": "aarav.captain@example.com",
    "status": "inactive",
    "vehicle": {
      "color": "Black",
      "plate": "DL01AB1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

### Duplicate-email response (`400 Bad Request`)

```json
{
  "message": "Captain already exist"
}
```
