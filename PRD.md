# Product Requirements Document (PRD)

# Order Management System – Licious

## 1. Overview

Licious requires a real-time Order Management System that enables shop owners to manage incoming orders efficiently without manually refreshing the page. The system should automatically receive new orders, allow order status updates, instantly synchronize inventory, and maintain an audit log for every inventory modification.


# 2. Problem Statement

Current order management requires manual refreshes, leading to delayed order processing and inconsistent inventory tracking. There is also no centralized audit trail for inventory changes.


# 3. Goals

* Display new orders automatically in real time.
* Enable owners to update order status from **Pending → Preparing → Ready**.
* Automatically update inventory whenever an order status affects stock.
* Maintain a complete audit log of inventory changes.
* Provide a responsive and intuitive dashboard.


# 4. Users

### Primary User

* Shop Owner

### Secondary Users

* Store Manager
* Operations Team (Audit)


# 5. Functional Requirements

## 5.1 Authentication

* Secure login for shop owners.
* Only authenticated owners can manage orders.
* Each owner can access only their assigned store.


## 5.2 Order Dashboard

Display:

* Order ID
* Customer Name
* Ordered Items
* Quantity
* Order Time
* Current Status

Orders should automatically appear without requiring a page refresh.


## 5.3 Order Status Management

Allowed workflow:

```
Pending
    ↓
Preparing
    ↓
Ready
```

Rules:

* Status changes must happen sequentially.
* Invalid transitions should be prevented.
* Dashboard updates instantly after status changes.


## 5.4 Real-Time Updates

The dashboard should:

* Receive newly placed orders automatically.
* Reflect order status updates immediately.
* Synchronize changes across multiple logged-in users.

No manual refresh should be required.


## 5.5 Inventory Management

When inventory changes:

* Update stock quantities immediately.
* Prevent inventory from becoming negative.
* Display current stock availability.


## 5.6 Inventory Audit Log

Every inventory update must record:

* Product ID
* Previous Quantity
* Updated Quantity
* Change Amount
* Owner ID
* Timestamp
* Reason (Order Processing)

Logs should be immutable.


# 6. Non-Functional Requirements

### Performance

* New orders appear within **2 seconds**.
* Status updates reflect in under **1 second**.
* Dashboard supports multiple concurrent users.

### Reliability

* Inventory updates should be transactional.
* Failed updates should roll back automatically.

### Security

* Authentication required.
* Authorization enforced for store ownership.
* Audit logs cannot be modified.


# 7. User Flow

```
Login
      ↓
Order Dashboard
      ↓
New Order Appears Automatically
      ↓
Owner selects "Preparing"
      ↓
Inventory Updated
      ↓
Audit Log Created
      ↓
Owner selects "Ready"
      ↓
Dashboard Updated
```


# 8. Tech Stack

| Layer          | Technology                      |
| -------------- | ------------------------------- |
| Frontend       | Next.js (App Router)            |
| Backend        | Next.js Route Handlers          |
| Authentication | Auth.js (NextAuth)              |
| Database       | PostgreSQL                      |
| ORM            | Prisma                          |
| Real-time      | WebSockets / Server-Sent Events |
| Deployment     | Docker + GCP Cloud Run          |
| Storage        | GCP Cloud Storage               |
| CI/CD          | GitHub Actions                  |


# 9. Database Entities

### User

* id
* name
* email
* role

### Order

* id
* customerName
* status
* createdAt

### OrderItem

* id
* orderId
* productId
* quantity

### Product

* id
* name
* stock

### InventoryLog

* id
* productId
* ownerId
* previousQuantity
* newQuantity
* changeAmount
* reason
* timestamp


# 10. Acceptance Criteria

| Requirement      | Success Criteria                                                     |
| ---------------- | -------------------------------------------------------------------- |
| Real-time orders | New orders appear automatically without refresh                      |
| Status update    | Owner can move orders only from Pending → Preparing → Ready          |
| Inventory sync   | Stock updates immediately after relevant order actions               |
| Audit logging    | Every inventory change stores owner ID, timestamp, and stock changes |
| Authentication   | Only authorized shop owners can manage their store's orders          |
| Reliability      | Inventory updates and logs are completed atomically (transactional)  |


# 11. Future Enhancements

* Order cancellation and refund workflow
* Inventory low-stock alerts
* Push notifications for new orders
* Search, filtering, and sorting
* Analytics dashboard (daily orders, revenue, stock usage)
* Multi-store support
* Role-based access (Manager, Admin, Staff)