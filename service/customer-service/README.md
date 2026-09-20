# customer-service

Spring Boot **4.0.8** backend for Organizational BNPL customers.

## Prerequisites

- Java 21+
- Maven Wrapper at `service/` (`../mvnw` from this module)

## Run

```bash
cd service
export JWT_SECRET='replace-with-a-long-random-secret-key'
./mvnw -pl customer-service spring-boot:run
```

- API health: [http://localhost:8081/api/health](http://localhost:8081/api/health)
- Actuator: [http://localhost:8081/actuator/health](http://localhost:8081/actuator/health)
- Swagger UI: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)

## Auth (OTP)

```http
POST /api/auth/otp/request
{"mobile":"09123456789"}

POST /api/auth/otp/verify
{"mobile":"09123456789","code":"123456"}
```

Dev default OTP is `123456` (`OTP_FIXED_CODE`). OTP is also logged on request until an SMS gateway is wired.

## Test

```bash
cd service
./mvnw -pl customer-service test
```

## Package layout

```
com.organizational.bnpl.customer
  controller/
  service/
  dto/
  config/
  exception/
```
