# OrderFlow Pro - Backend API Documentation

This document describes the design, authentication mechanics, and usage of each backend API endpoint in the OrderFlow Pro application.

---

## 1. Authentication & Security

All protected endpoints expect a JSON Web Token (JWT). The API looks for this token in two places:
1. **Authorization Header**: `Authorization: Bearer <token>`
2. **HttpOnly Cookie**: Cookie named `token`.

The payload of the signed JWT contains:
- `id`: The user's database UUID.
- `email`: The user's login email.
- `role`: The user's role (e.g. `OWNER`, `CUSTOMER`, `MANAGER`, `AUDITOR`).

---

## 2. API Endpoints

### 2.1 User Registration
Creates a new user account. Role defaults to `CUSTOMER` if not specified or invalid.

- **Endpoint**: `POST /api/auth/register`
- **Authentication**: None
- **Request Body (JSON)**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123",
    "role": "CUSTOMER"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "user-uuid-1234",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "CUSTOMER",
      "createdAt": "2026-07-23T09:00:00.000Z"
    }
  }
  ```

---

### 2.2 User Login (JWT Token Issuance)
Validates email and password, returning user info, a signed JWT, and sets an `HttpOnly` session cookie.

- **Endpoint**: `POST /api/auth/login`
- **Authentication**: None
- **Request Body (JSON)**:
  ```json
  {
    "email": "admin@orderflow.com",
    "password": "admin123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "admin-uuid-1234",
      "name": "Admin User",
      "email": "admin@orderflow.com",
      "role": "OWNER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### 2.3 Forgot Password Request
Simulates a password reset recovery request. Returns a mock token for development verification.

- **Endpoint**: `POST /api/auth/forgot-password`
- **Authentication**: None
- **Request Body (JSON)**:
  ```json
  {
    "email": "admin@orderflow.com"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "If that email exists, we have sent a password reset token.",
    "debug": {
      "resetToken": "mock-reset-token-hex-string...",
      "expires": "2026-07-23T15:00:00.000Z"
    }
  }
  ```

---

### 2.4 Place an Order
Places a new order. Decrements product stock in a single database transaction and writes an audit log in `InventoryLog`.

- **Endpoint**: `POST /api/orders`
- **Authentication**: Required (`CUSTOMER` role)
- **Request Body (JSON)**:
  ```json
  {
    "customerName": "Alice",
    "items": [
      {
        "productId": "product-uuid-5678",
        "quantity": 2
      }
    ]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Order placed successfully",
    "order": {
      "id": "order-uuid-9999",
      "userId": "customer-uuid-4321",
      "customerName": "Alice",
      "status": "PENDING",
      "items": [
        {
          "id": "orderitem-uuid-8888",
          "orderId": "order-uuid-9999",
          "productId": "product-uuid-5678",
          "quantity": 2
        }
      ]
    }
  }
  ```
- **Error Response (400 Bad Request)**:
  If a product's stock is less than the requested quantity, the transaction rolls back fully:
  ```json
  {
    "error": "Insufficient stock for product Default Product. Available: 6"
  }
  ```

---

### 2.5 List Orders
Retrieves all orders sorted chronologically in descending order.

- **Endpoint**: `GET /api/orders`
- **Authentication**: Required (`OWNER`, `MANAGER`, or `AUDITOR` roles only)
- **Response (200 OK)**:
  ```json
  {
    "orders": [
      {
        "id": "order-uuid-9999",
        "userId": "customer-uuid-4321",
        "customerName": "Alice",
        "status": "PENDING",
        "createdAt": "2026-07-23T09:00:00.000Z",
        "items": [
          {
            "id": "orderitem-uuid-8888",
            "quantity": 2,
            "product": {
              "id": "product-uuid-5678",
              "name": "Default Product",
              "stock": 8
            }
          }
        ]
      }
    ]
  }
  ```

---

### 2.6 Sequential Order Status Transition
Updates the status of an order. The status MUST transition sequentially: **`PENDING` $\rightarrow$ `PREPARING` $\rightarrow$ `READY`**. Non-sequential jumps (e.g. `PENDING` $\rightarrow$ `READY`) are rejected.

- **Endpoint**: `PATCH /api/orders/[id]`
- **Authentication**: Required (`OWNER` or `MANAGER` roles only)
- **Request Body (JSON)**:
  ```json
  {
    "status": "PREPARING"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Order status updated to PREPARING",
    "order": {
      "id": "order-uuid-9999",
      "status": "PREPARING"
    }
  }
  ```
- **Error Response (400 Bad Request)**:
  If an invalid or non-sequential status transition is requested:
  ```json
  {
    "error": "Invalid state transition from PENDING to READY. Sequential flow must be followed: PENDING -> PREPARING -> READY"
  }
  ```
