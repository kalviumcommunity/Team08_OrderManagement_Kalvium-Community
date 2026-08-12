# OrderFlow Pro - Backend API Documentation

This document describes the design, authentication mechanics, database interactions, and usage of each backend API endpoint in the OrderFlow Pro application.

---

## 1. Authentication & Security

All protected endpoints expect a JSON Web Token (JWT). The API looks for this token in two places (handled automatically by `getUserFromRequest`):
1. **Authorization Header**: `Authorization: Bearer <token>`
2. **HttpOnly Cookie**: Cookie named `token`.

### JWT Tokens
- **Access Token**: Expires in 15 minutes. Validated for immediate request authorization.
- **Refresh Token**: Expires in 7 days. Stored in the database under `User.refreshToken` and passed via `refreshToken` HttpOnly cookie. Used to obtain new access and refresh tokens.

### JWT Payload
The decoded token payload contains:
- `id`: The user's database UUID.
- `email`: The user's login email.
- `role`: The user's role (`CUSTOMER`, `OWNER`, `MANAGER`, `AUDITOR`).

---

## 2. API Endpoints

### 2.1 Authentication

#### 2.1.1 User Registration
Creates a new user account. Role defaults to `CUSTOMER` if not specified.

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

#### 2.1.2 User Login
Validates credentials, issues JWT access and refresh tokens, updates the DB refresh token, and sets secure HttpOnly cookies (`token` and `refreshToken`).

*Rate Limited*: Maximum 5 attempts per minute.

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

#### 2.1.3 Forgot Password Request
Generates a secure password reset token, hashes it using SHA-256 for database storage, sets an expiration (1 hour), and logs/simulates sending a reset email.

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
      "resetToken": "plain-text-token-hex-string...",
      "expires": "2026-07-23T15:00:00.000Z"
    }
  }
  ```

---

#### 2.1.4 Reset Password
Validates a password reset token against the database, hashes the new password, updates the user credentials, and clears the reset token fields.

- **Endpoint**: `POST /api/auth/reset-password`
- **Authentication**: None
- **Request Body (JSON)**:
  ```json
  {
    "token": "plain-text-token-hex-string...",
    "newPassword": "newsecurepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Password reset successful"
  }
  ```

---

#### 2.1.5 Token Refresh
Uses the HttpOnly `refreshToken` cookie to verify the user session. Validates the token, verifies it matches the token stored in the database, generates a new token pair, updates the database, and sets new cookies.

- **Endpoint**: `POST /api/auth/refresh`
- **Authentication**: None (Reads `refreshToken` from Cookie header)
- **Response (200 OK)**:
  ```json
  {
    "message": "Token refreshed successfully",
    "token": "new-access-token-jwt-string..."
  }
  ```

---

### 2.2 Products & Stock Management

#### 2.2.1 List Products
Retrieves all products with optional filters and pagination.

- **Endpoint**: `GET /api/products`
- **Authentication**: Required (Any role)
- **Query Parameters**:
  - `search` (string, optional): Filter products by name.
  - `lowStock` (boolean, optional): Set to `true` to only fetch products where stock is below their `lowStockThreshold`.
  - `page` (number, default: 1): The page to retrieve.
  - `limit` (number, default: 10): Items per page.
- **Response (200 OK)**:
  ```json
  {
    "products": [
      {
        "id": "product-uuid-5678",
        "name": "Fancy Gadget",
        "stock": 12,
        "lowStockThreshold": 5,
        "createdAt": "2026-07-23T09:00:00.000Z",
        "updatedAt": "2026-07-23T09:10:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 1,
      "totalPages": 1
    }
  }
  ```

---

#### 2.2.2 Direct Inventory Stock Adjustment
Directly adjusts stock level for a product. Automatically writes audit logs (`InventoryLog`) and broadcasts updates via SSE.

- **Endpoint**: `PATCH /api/products`
- **Authentication**: Required (`OWNER` or `MANAGER` roles only)
- **Request Body (JSON)**:
  ```json
  {
    "productId": "product-uuid-5678",
    "changeAmount": 10,
    "reason": "Restocked due to high demand"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Product stock updated successfully",
    "product": {
      "id": "product-uuid-5678",
      "name": "Fancy Gadget",
      "stock": 22,
      "lowStockThreshold": 5
    },
    "log": {
      "id": "log-uuid-9999",
      "productId": "product-uuid-5678",
      "ownerId": "manager-uuid-1234",
      "previousQuantity": 12,
      "newQuantity": 22,
      "changeAmount": 10,
      "reason": "Restocked due to high demand",
      "timestamp": "2026-07-23T09:15:00.000Z"
    }
  }
  ```

---

### 2.3 Order Management

#### 2.3.1 Place an Order
Places a new order. Validates input schema, decrements product stock, records inventory logs, and generates low stock alerts where appropriate inside a single database transaction. Broadcasts SSE notifications (`ORDER_CREATED` and `LOW_STOCK_ALERT`).

*Rate Limited*: Maximum 10 attempts per minute.

- **Endpoint**: `POST /api/orders`
- **Authentication**: Required (Any role)
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
      "createdAt": "2026-07-23T09:00:00.000Z",
      "items": [
        {
          "id": "orderitem-uuid-8888",
          "orderId": "order-uuid-9999",
          "productId": "product-uuid-5678",
          "quantity": 2,
          "product": {
            "id": "product-uuid-5678",
            "name": "Fancy Gadget",
            "stock": 20
          }
        }
      ]
    }
  }
  ```

---

#### 2.3.2 List Orders
Retrieves all orders matching search or status criteria, sorted chronologically in descending order.

- **Endpoint**: `GET /api/orders`
- **Authentication**: Required (`OWNER`, `MANAGER`, or `AUDITOR` roles only)
- **Query Parameters**:
  - `status` (string, optional): Filter by status (`PENDING`, `PREPARING`, `READY`, `CANCELLED`).
  - `search` (string, optional): Filter by customer name.
  - `page` (number, default: 1): Page number.
  - `limit` (number, default: 10): Items per page.
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
              "name": "Fancy Gadget",
              "stock": 20
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 1,
      "totalPages": 1
    }
  }
  ```

---

#### 2.3.3 Update Order Status (Sequential Flow & Cancellation)
Updates status of an order. Two operations are supported:

1. **Sequential Transition**: Updates order status along the path **`PENDING` $\rightarrow$ `PREPARING` $\rightarrow$ `READY`**. Non-sequential jumps are rejected.
   - *Allowed Roles*: `OWNER`, `MANAGER`
2. **Cancellation**: Cancels an order with status `PENDING` or `PREPARING`. Refunds stock to product inventories, logs the transaction, and broadcasts `ORDER_UPDATED` & `STOCK_UPDATED` SSE events.
   - *Allowed Roles*: `OWNER`, `MANAGER`, or `CUSTOMER` (only if the order belongs to them).

- **Endpoint**: `PATCH /api/orders/[id]`
- **Authentication**: Required
- **Request Body (JSON)**:
  ```json
  {
    "status": "PREPARING"
  }
  ```
- **Response (200 OK - Transition)**:
  ```json
  {
    "message": "Order status updated to PREPARING",
    "order": {
      "id": "order-uuid-9999",
      "status": "PREPARING"
    }
  }
  ```
- **Response (200 OK - Cancellation)**:
  ```json
  {
    "message": "Order cancelled successfully and stock refunded",
    "order": {
      "id": "order-uuid-9999",
      "status": "CANCELLED"
    }
  }
  ```

---

### 2.4 Inventory Logs (Audit Logs)

#### 2.4.1 List Inventory Logs
Fetches a list of audit logs documenting any changes made to product stock.

- **Endpoint**: `GET /api/inventory/logs`
- **Authentication**: Required (`OWNER`, `MANAGER`, or `AUDITOR` roles only)
- **Query Parameters**:
  - `productId` (string, optional): Retrieve logs specific to a product ID.
  - `search` (string, optional): Search logs by reason content.
  - `page` (number, default: 1): Page number.
  - `limit` (number, default: 10): Items per page.
- **Response (200 OK)**:
  ```json
  {
    "logs": [
      {
        "id": "log-uuid-9999",
        "productId": "product-uuid-5678",
        "ownerId": "manager-uuid-1234",
        "previousQuantity": 12,
        "newQuantity": 22,
        "changeAmount": 10,
        "reason": "Restocked due to high demand",
        "timestamp": "2026-07-23T09:15:00.000Z",
        "product": {
          "id": "product-uuid-5678",
          "name": "Fancy Gadget",
          "stock": 22
        },
        "owner": {
          "id": "manager-uuid-1234",
          "name": "John Manager",
          "email": "john@orderflow.com",
          "role": "MANAGER"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 1,
      "totalPages": 1
    }
  }
  ```

---

### 2.5 Real-Time SSE Stream

#### 2.5.1 Receive Live Stream Updates
Opens an event-stream connection to receive live updates.

- **Endpoint**: `GET /api/sse`
- **Authentication**: None (Browser connection via EventSource)
- **Headers**:
  - `Content-Type`: `text/event-stream`
- **Broadcast Events**:
  - `ping`: Sent every 30 seconds to keep connection alive.
  - `ORDER_CREATED`: Fired when a new order is successfully processed. Contains order details.
  - `ORDER_UPDATED`: Fired when status changes or cancellation occurs. Contains updated order.
  - `STOCK_UPDATED`: Fired when a product's stock is altered (manual adjustment or cancellation refund). Contains product ID, current stock, and audit log.
  - `LOW_STOCK_ALERT`: Fired when product stock drops below threshold. Contains product info and current stock.

---

### 2.6 Dashboard Reports & Analytics

#### 2.6.1 Retrieve Consolidated Dashboard Reports
Provides unified metrics, active queues, daily volume counts, and stock alerts.

- **Endpoint**: `GET /api/reports`
- **Authentication**: JWT Required (`OWNER`, `MANAGER`, or `AUDITOR` roles only)
- **Response (200 OK)**:
  ```json
  {
    "stats": {
      "newOrdersCount": 3,
      "preparingCount": 2,
      "readyCount": 1,
      "revenue": 450,
      "lowStockCount": 1
    },
    "activeOrders": [
      {
        "id": "order-uuid-1111",
        "userId": "customer-uuid-2222",
        "customerName": "John Doe",
        "status": "PENDING",
        "createdAt": "2026-08-04T12:00:00.000Z",
        "items": [
          {
            "id": "item-uuid-3333",
            "productId": "product-uuid-4444",
            "quantity": 2,
            "product": {
              "name": "Default Product",
              "stock": 10
            }
          }
        ]
      }
    ],
    "dailyVolume": [
      { "day": "Mon", "count": 2 },
      { "day": "Tue", "count": 5 }
    ],
    "weeklySummary": {
      "total": 17,
      "growth": 18.5
    },
    "alerts": [
      {
        "id": "product-uuid-4444",
        "product": "Default Product",
        "stock": 3,
        "status": "Medium Stock",
        "tone": "yellow"
      }
    ]
  }
  ```

---

### 2.7 User Profile

#### 2.7.1 Retrieve User Profile
Fetches details of the currently authenticated user session.

- **Endpoint**: `GET /api/profile`
- **Authentication**: JWT Required (Any role)
- **Response (200 OK)**:
  ```json
  {
    "id": "user-uuid-1234",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "OWNER",
    "restaurantName": "Licious Grill",
    "phone": "1234567890",
    "businessType": "Restaurant",
    "createdAt": "2026-07-23T09:00:00.000Z"
  }
  ```

---

### 2.8 Product Restock & Inventory Stats

#### 2.8.1 Product Restock
Adjusts/restocks the quantities of a specific product ID.

- **Endpoint**: `POST /api/products/restock`
- **Authentication**: JWT Required (`OWNER` or `MANAGER` roles only)
- **Request Body (JSON)**:
  ```json
  {
    "productId": "product-uuid-4444",
    "quantity": 15
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Product restocked successfully",
    "product": {
      "id": "product-uuid-4444",
      "name": "Default Product",
      "stock": 25
    }
  }
  ```

---

#### 2.8.2 Retrieve Product stats
Fetches summary statistics for products inventory levels.

- **Endpoint**: `GET /api/products/stats`
- **Authentication**: JWT Required (`OWNER`, `MANAGER`, or `AUDITOR` roles only)
- **Response (200 OK)**:
  ```json
  {
    "totalProducts": 15,
    "lowStockProductsCount": 2,
    "outOfStockProductsCount": 1
  }
  ```

---

#### 2.8.3 Retrieve Inventory stats
Fetches logs summary and inventory metrics.

- **Endpoint**: `GET /api/inventory/stats`
- **Authentication**: JWT Required (`OWNER`, `MANAGER`, or `AUDITOR` roles only)
- **Response (200 OK)**:
  ```json
  {
    "totalLogs": 128,
    "restockLogsCount": 42,
    "salesLogsCount": 86
  }
  ```

