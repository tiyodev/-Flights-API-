## Description

This API has been design for a technical test for BCM Energy/Planet Oui.

Its objective is to design an API to get all departure flights with a list of return flights group by price and departure date. 

Flights is get from multiple supplier (JAZZ and MOON).

## Technical choice

For the test i choose to use the framework [Express](https://github.com/expressjs/express) with [Typescript](https://www.typescriptlang.org/).

I used the minimal of dependencies.

I fragmented my code as best I could to make it maintainable, scalable and testable.

I also created a light logger to help development and to be ready to production.

For the Flights API I tried to use a JSON format with the least amount of redundant information. I also ordered flights by price and by departur date.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the [npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/). 
Node.js last version is required.

```bash
$ npm install && npm update
```

## Env file

A environment variable file must be created.

Example:

```js

NODE_ENV=dev
PORT=3000
#LOGGER_LEVEL possible value ALL, DEBUG, INFO, ERROR, OFF
LOGGER_LEVEL=INFO
JWT_SECRET=your secret
JWT_EXPIRY_SECONDS=300
AIR_JAZZ_SUPPLIER_URL=jazz api url http://...
AIR_MOON_SUPPLIER_URL=moon api url http://...

```

## Running the app

```bash
# development (run typescript)
$ npm run start:dev

# production mode (run the build)
$ npm run start:prod
```

## Build the app

```bash
# remove last build then execute linter then build
$ npm run build

```

## Run tests

```bash
# tests
$ npm run test

```

## API

### Version (Ping)

In production is useful to have an endpoint to ping the API for monitoring application.

Example:

 ```curl -X GET http://localhost:3000/api/v1/ -H "Content-Type: application/json"```

This API return a message like:

```json
    {
        "message": "Welcome to the Flight API v1"
    }
```

### Sign in

<aside class="warning">
    This API is restricted by 5 requests per 5 minutes.
</aside>

Some endpoints are secured by authentication. To use theses API you must send a token.

This API return a token when authentication is success.

For the test, I manually created two users:

| username  | password          | role   |
|-----------|-------------------|--------|
| admin     | password123admin  | admin  |
| member    | password123member | member |

Example:

```bash
    curl -X POST http://localhost:3000/api/v1/user/signIn -d "{\"username\":\"admin\",\"password\":\"password123admin\"}" -H "Content-Type: application/json"
```

This API return a json like:

```json
    {
        "status": "success",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwicGFzc3dvcmQiOiJwYXNzd29yZDEyM2FkbWluIiwiaWF0IjoxNTgxNTQ5NDY2LCJleHAiOjE1ODE1NDk3NjZ9.nXSQFmkjH4VgJJFtnB4KS_Bg7PKe3auZgscZL5LNuww"
    }
```

### Flights

<aside class="warning">
    This API is restricted by 5 requests per 5 minutes.
</aside>

You must send a token to use this API.

They are two main uses: 
* Get a list of departure flights group by price and departure date. 

Example:

```bash
    curl -X GET http://localhost:3000/api/v1/flights -d "departure_airport=CDG&arrival_airport=LHR&departure_date=2019-03-28&tripType=OW" -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwicGFzc3dvcmQiOiJwYXNzd29yZDEyM2FkbWluIiwiaWF0IjoxNTgxNTUzNzMwLCJleHAiOjE1ODE1NTQwMzB9.u21p6roQl6O-tbOw-GCH9-Qzy-Yd83p8fSnfy44fbJQ"
```

This API return a json like:

```json
    {
        "criterias": {
            "departureAirport": "CDG",
            "arrivalAirport": "LHR",
            "departureDate": "2019-03-28",
            "tripType": "OW"
        },
        "flightsByPrice": {
            "price": 10,
            "flights": [{
                "id": "...",
                "departureAirport": "...",
                "arrivalAirport": "...",
                "departureTime": "...",
                "arrivalTime": "...",
            },
            ...]
        },
    }
```

* Get a list of departure flights with a list of return flights group by price and departure date. 

Example:

```bash
    curl -X GET http://localhost:3000/api/v1/flights -d "departure_airport=CDG&arrival_airport=LHR&departure_date=2019-03-28&return_date=2019-03-28&tripType=R" -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwicGFzc3dvcmQiOiJwYXNzd29yZDEyM2FkbWluIiwiaWF0IjoxNTgxNTUzNzMwLCJleHAiOjE1ODE1NTQwMzB9.u21p6roQl6O-tbOw-GCH9-Qzy-Yd83p8fSnfy44fbJQ"
```

This API return a json like:

```json
    {
        "criterias": {
            "departureAirport": "CDG",
            "arrivalAirport": "LHR",
            "departureDate": "2019-03-28",
            "returnDate": "2019-03-28",
            "tripType": "OW",
        },
        "flightsByPrice": {
            "price": 10,
            "flights": [{
                "id": "...",
                "departureAirport": "...",
                "arrivalAirport": "...",
                "departureTime": "...",
                "arrivalTime": "...",
                "returnFlights": [{
                    "price": 1,
                    "flights": [{
                        "id": "...",
                        "departureAirport": "...",
                        "arrivalAirport": "...",
                        "departureTime": "...",
                        "arrivalTime": "..."
                    }]
                }]
            },
            ...]
        },
    }
```

## Bonus

 * We would like to be able to cache and reuse results. Be aware that the response can be quite big / huge.

  ==> I didn't have the time to implement it however, if I had to, I'd use [Redis](https://redis.io/) to manage the cache. 
  Warning: care must be taken when setting up a caching system. A good strategy must be defined in order to keep optimal performance.

 * We would like to be able to perform searches using a search radius. See "Bonus // Search radius" paragraph

  ==> I didn't have the time to implement however, if I had to do, I'd use a database to store all the airports and their geographical coordinates.
  I'd use [PostgreSql](https://www.postgresql.org/) with its [PostGis](https://postgis.net/) plugin which allows to do radius searches easily and with optimal performance.
  I've already used this stack to search for routes with OSM coordinates.

 * We would like the endpoint to be secured. :heavy_check_mark:
 * Beyond security, we need to be able to identify a user :heavy_check_mark:
 * Once security and identification in place, we need to be able to rate limit this API. The limit is up to you. :heavy_check_mark:
 
 We are also interested in knowing:
  * How you would deploy this in production.

  Two main possibilities:

  ==> We can use a docker container (see dockerfile). Docker is usefull when to deploy on a webapp on the cloud or when we have multiple application with multiple version of dependences in the same server.
  
  ==> If we deploy on a server without incompatibilities, then it may be sufficient to use [NGinx](https://www.nginx.com/) as proxy/web server/load balancer and [PM2](https://pm2.keymetrics.io/) as process manager.

  * What technologies would you use to have a CI/CD running.
  
  ==> We can use solution like Jenkins, Azure devops or circleci to do it. It's important to couple a CI/CD with a git strategy. I used to use git with gitflow strategy.

  Example of process for the CI are:
  - Get source
  - Install dependencies
  - Code Quality and security check (like [sonar](https://www.sonarqube.org/))
  - Runs tslint or eslint to check code style
  - Run tests (unit test, integration test, end-to-end test)
  
  Each merge on develop (after PR) launch the CI/CD for the dev plateform. When Develop is merged on Master, the CI/CD is launch on the beta plateform. 
  And if no error occured, we can autorize manualy the deployment on the production plateform.

## Conclusion
With more time I would've liked to do:
- Search Flights API with search radius
- Create a database for store the user and airports data
- Improve authentication with user creation api and salting and hash password
- More unit tests
- Generate API documentation / UI to test (like [swagger](https://swagger.io/))

I would be happy to answer all your questions.