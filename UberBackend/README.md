# Uber Backend API

## Setup

Install dependencies, create an `.env` file, and start the server:

```bash
npm install
node Server.js
```

The server listens on port `3000` by default. Set `PORT` to use a different
port.

| Environment variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string. |
| `JWT_SECRET` | Secret used to sign user and captain JWTs. |
| `GOOGLE_MAPS_API` | Google Maps API key used by the internal map helpers. |
| `PORT` | Optional HTTP port; defaults to `3000`. |

The Google Maps key must be enabled for the Geocoding, Distance Matrix, and
Places Autocomplete APIs. Keep `.env` out of source control.

## API overview

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/users/register` | No | Create a user account. |
| `POST` | `/users/login` | No | Authenticate a user. |
| `GET` | `/users/profile` | User token | Get the authenticated user's profile. |
| `GET` | `/users/logout` | User token | Log out the authenticated user. |
| `POST` | `/captains/register` | No | Create a captain account. |
| `POST` | `/captains/login` | No | Authenticate a captain. |
| `GET` | `/captains/profile` | Captain token | Get the authenticated captain's profile. |
| `GET` | `/captains/logout` | Captain token | Log out the authenticated captain. |

Ride routes are defined in `routes/ride.routes.js`, but the router is not yet
registered in `app.js`. Until `app.use('/rides', rideRoutes)` is added, the ride
endpoints documented below are unavailable and will return `404 Not Found`.

Map HTTP handlers also exist in `controllers/map.controller.js`, but no map
router is currently registered in `app.js`. Consequently, map operations are
not yet public API endpoints. See [Map controller](#map-controller) and
[Map service](#map-service).

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

## Log in a captain

Authenticates a registered captain and returns an authentication token.

**Endpoint:** `POST /captains/login`

### Required request format

Send the request body as JSON with the `Content-Type: application/json` header.

| Field | Required | Rules |
| --- | --- | --- |
| `email` | Yes | Must be a valid email address. |
| `password` | Yes | Must be at least 6 characters long. |

### Example request

```json
{
  "email": "aarav.captain@example.com",
  "password": "securepassword"
}
```

### Status codes

| Status | Meaning |
| --- | --- |
| `200 OK` | The email and password are valid; returns `token` and `captain`. |
| `400 Bad Request` | The request fails email or password validation. |
| `401 Unauthorized` | The email does not exist or the password is incorrect. |

### Invalid-credentials response (`401 Unauthorized`)

```json
{
  "message": "Invalid email or password"
}
```

## Get captain profile

Returns the authenticated captain's profile.

**Endpoint:** `GET /captains/profile`

### Authentication

Send the JWT as `Authorization: Bearer <jwt-token>` or include the `token` cookie created during captain login.

### Status codes

| Status | Meaning |
| --- | --- |
| `200 OK` | Returns the authenticated captain in the `captain` property. |
| `401 Unauthorized` | The token is missing, invalid, expired, or blacklisted. |

### Success response (`200 OK`)

```json
{
  "captain": {
    "_id": "<captain-id>",
    "email": "aarav.captain@example.com",
    "status": "inactive"
  }
}
```

## Log out a captain

Clears the `token` cookie and blacklists the JWT for 24 hours.

**Endpoint:** `GET /captains/logout`

### Authentication

Send the JWT as `Authorization: Bearer <jwt-token>` or include the `token` cookie.

### Status codes

| Status | Meaning |
| --- | --- |
| `200 OK` | The captain was logged out successfully. |
| `401 Unauthorized` | The token is missing, invalid, expired, or blacklisted. |

### Success response (`200 OK`)

```json
{
  "message": "Logged out"
}
```

## Ride routes

> These routes become public only after the ride router is mounted at `/rides`.
> They require `GOOGLE_MAPS_API`, because fare calculation and captain matching
> use the map service.

| Method | Endpoint | Authentication | Request fields | Description |
| --- | --- | --- | --- | --- |
| `POST` | `/rides/create` | User token | `pickup`, `destination`, `vehicleType` | Creates a pending ride and notifies nearby captains by socket event. |
| `GET` | `/rides/get-fare` | User token | Query: `pickup`, `destination` | Returns fare estimates for every vehicle type. |
| `POST` | `/rides/confirm` | Captain token | `rideId` | Marks a ride as accepted by the captain. |
| `GET` | `/rides/start-ride` | Captain token | Query: `rideId`, `otp` | Validates the OTP and marks an accepted ride as ongoing. |
| `POST` | `/rides/end-ride` | Captain token | `rideId` | Marks the captain's ongoing ride as completed. |

Authentication accepts `Authorization: Bearer <jwt-token>` or the `token`
cookie produced by the login endpoints.

### Create a ride

**Endpoint:** `POST /rides/create`

| Field | Rules |
| --- | --- |
| `pickup` | String, at least 3 characters. |
| `destination` | String, at least 3 characters. |
| `vehicleType` | One of `auto`, `car`, or `moto`. |

```json
{
  "pickup": "India Gate, Delhi",
  "destination": "Connaught Place, Delhi",
  "vehicleType": "car"
}
```

Returns `201 Created` with the new ride. The ride begins with `status` set to
`pending`; its OTP is not returned in this response.

### Get fare estimates

**Endpoint:** `GET /rides/get-fare?pickup=India%20Gate%2C%20Delhi&destination=Connaught%20Place%2C%20Delhi`

Returns `200 OK` with estimates for all supported ride types:

```json
{
  "auto": 80,
  "car": 125,
  "moto": 60
}
```

The values vary with the route distance and duration.

### Captain ride lifecycle

Captains progress a ride through these states:

```text
pending --POST /rides/confirm--> accepted
accepted --GET /rides/start-ride (valid OTP)--> ongoing
ongoing --POST /rides/end-ride--> completed
```

`rideId` must be a valid MongoDB ObjectId. The start endpoint additionally
requires a six-character `otp`. Validation failures return `400 Bad Request`;
service or map failures currently return `500 Internal Server Error` with a
`message` property.

Example confirmation request:

```json
{
  "rideId": "<ride-id>"
}
```

## Map controller

`controllers/map.controller.js` contains handlers intended for map routes. A
router must be created and mounted in `app.js` before clients can call them.

| Handler | Query parameters | Success response | Validation failure | Service failure |
| --- | --- | --- | --- | --- |
| `getCoordinates` | `address` | `200 OK` with the coordinate object. | `400 Bad Request` with an `errors` array. | `404 Not Found` with `{ "message": "Coordinates not found" }`. |
| `getDistanceTime` | `origin`, `destination` | `200 OK` with the Google Distance Matrix element. | `400 Bad Request` with an `errors` array. | `500 Internal Server Error`. |
| `getAutoCompleteSuggestions` | `input` | `200 OK` with an array of place-description strings. | `400 Bad Request` with an `errors` array. | `500 Internal Server Error`. |

The controller relies on route-level `express-validator` rules. Those rules are
not defined until a map router is added, so the expected required query
parameters should be validated there.

## Map service

`Services/maps.service.js` provides helpers for use by other backend modules.
They are not registered as Express routes, so clients cannot call them directly.
All helpers that contact Google Maps require `GOOGLE_MAPS_API`.

| Helper | Arguments | Returns | Failure behavior |
| --- | --- | --- | --- |
| `getAddressCoordinate` | `address` | `{ ltd, lng }` latitude/longitude values for the first geocoding result. | Throws when Google cannot return coordinates. |
| `getDistanceTime` | `origin`, `destination` | The first Google Distance Matrix element, including `distance` and `duration` when available. | Throws if either argument is absent, no route is found, or Google returns an error. |
| `getAutoCompleteSuggestions` | `input` | An array of place-description strings. | Throws if `input` is absent or Google returns an error. |
| `getCaptainsInTheRadius` | `ltd`, `lng`, `radius` | Captains matched by a MongoDB geospatial-radius query. | Propagates database errors. `radius` is in kilometres. |

Example usage from an internal service:

```js
const mapsService = require('./Services/maps.service');

const coordinates = await mapsService.getAddressCoordinate('India Gate, Delhi');
const route = await mapsService.getDistanceTime('India Gate, Delhi', 'Connaught Place, Delhi');
const suggestions = await mapsService.getAutoCompleteSuggestions('Indira Gandhi International Airport');
```

> `getAddressCoordinate` currently returns the latitude under the property name
> `ltd`. Consumers should use that spelling until the implementation is changed.
