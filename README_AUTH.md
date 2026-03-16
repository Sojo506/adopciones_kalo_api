# User Authentication API

## Endpoints

### Register
**POST** `/api/auth/register`

Creates a new user account and sends a verification email.

**Request Body:**
```json
{
  "identificacion": 123456789,
  "nombre": "John",
  "apellidoPaterno": "Doe",
  "apellidoMaterno": "Smith",
  "correo": "john.doe@example.com",
  "password": "password123",
  "idDireccion": 1
}
```

**Response:**
```json
{
  "ok": true,
  "message": "User created. Please check your email for verification code.",
  "data": {
    "user": {
      "identificacion": 123456789,
      "nombre": "John",
      "apellidoPaterno": "Doe",
      "apellidoMaterno": "Smith",
      "correo": "john.doe@example.com"
    }
  }
}
```

### Verify Email
**POST** `/api/auth/verify-email`

Verifies the user's email using the code sent via email.

**Request Body:**
```json
{
  "correo": "john.doe@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Email verified successfully"
}
```

### Login
**POST** `/api/auth/login`

Authenticates a user (requires verified email).

**Request Body:**
```json
{
  "correo": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Sign in successful",
  "data": {
    "user": {
      "identificacion": 123456789,
      "nombre": "John",
      "apellidoPaterno": "Doe",
      "apellidoMaterno": "Smith",
      "correo": "john.doe@example.com"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Get Users (Protected)
**GET** `/api/users`

Retrieves all users. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "ok": true,
  "count": 1,
  "data": [...]
}
```

## Database Notes

- **FIDE_USUARIO_TB**: Stores user personal data
- **FIDE_CUENTA_TB**: Stores account credentials and status
- **FIDE_CODIGO_OTP_TB**: Stores verification codes

## Environment Variables

Ensure the following are set in your `.env` file:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USER`
- `MAIL_PASS`
- `MAIL_FROM`
- `MAIL_FROM_NAME`