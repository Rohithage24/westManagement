# 🗑️ Community Waste Reporting Platform — API Documentation

> **Base URL:** `http://localhost:5000`
> **Auth:** Cookie-based JWT (`httpOnly`, 7 days). Send requests with `credentials: true` / `withCredentials: true`.

---

## 📑 Table of Contents

1. [User Routes](#-user-routes)
2. [Complaint Routes](#-complaint-routes)
3. [Map Data Routes](#-map-data-routes)
4. [Complaint Status Routes](#-complaint-status-routes)
5. [Health Check](#-health-check)
6. [Error Responses](#-error-responses)
7. [Status Flow](#-status-flow)

---

## 👤 User Routes

Base path: `/api/user`

---

### POST `/api/user/register`
Register a new user. Sets JWT cookie on success.

**Auth required:** ❌ No

**Request Body** `application/json`
```json
{
  "name":     "Rahul Sharma",
  "gmail":    "rahul@gmail.com",
  "password": "rahul1234",
  "address":  "Civil Lines, Nagpur"
}
```

| Field      | Type   | Required | Description              |
|------------|--------|----------|--------------------------|
| `name`     | String | ✅ Yes   | Min 2 characters         |
| `gmail`    | String | ✅ Yes   | Valid email, must be unique |
| `password` | String | ✅ Yes   | Min 6 characters         |
| `address`  | String | ❌ No    | User's address           |

**Response `201 Created`**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id":        "664f1a2b3c4d5e6f7a8b9c0d",
      "name":      "Rahul Sharma",
      "gmail":     "rahul@gmail.com",
      "address":   "Civil Lines, Nagpur",
      "createdAt": "2025-03-27T10:00:00.000Z"
    }
  }
}
```

**Response `409 Conflict`** *(gmail already exists)*
```json
{
  "success": false,
  "message": "User with this gmail already exists"
}
```

---

### POST `/api/user/login`
Login with gmail and password. Sets JWT cookie.

**Auth required:** ❌ No

**Request Body** `application/json`
```json
{
  "gmail":    "rahul@gmail.com",
  "password": "rahul1234"
}
```

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id":      "664f1a2b3c4d5e6f7a8b9c0d",
      "name":    "Rahul Sharma",
      "gmail":   "rahul@gmail.com",
      "address": "Civil Lines, Nagpur"
    }
  }
}
```

**Response `401 Unauthorized`**
```json
{
  "success": false,
  "message": "Invalid gmail or password"
}
```

---

### POST `/api/user/logout`
Logout user. Clears JWT cookie.

**Auth required:** ❌ No

**Request Body:** None

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET `/api/user/me`
Get currently logged-in user's profile.

**Auth required:** ✅ Yes (cookie)

**Request Body:** None

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "user": {
      "id":        "664f1a2b3c4d5e6f7a8b9c0d",
      "name":      "Rahul Sharma",
      "gmail":     "rahul@gmail.com",
      "address":   "Civil Lines, Nagpur",
      "createdAt": "2025-03-27T10:00:00.000Z",
      "updatedAt": "2025-03-27T10:00:00.000Z"
    }
  }
}
```

**Response `401 Unauthorized`**
```json
{
  "success": false,
  "message": "Unauthorized. Please login first."
}
```

---

### PATCH `/api/user/update`
Update logged-in user's profile.

**Auth required:** ✅ Yes (cookie)

**Request Body** `application/json`
```json
{
  "name":    "Rahul R. Sharma",
  "gmail":   "rahulnew@gmail.com",
  "address": "Dharampeth, Nagpur"
}
```

| Field     | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `name`    | String | ❌ No    | Min 2 characters               |
| `gmail`   | String | ❌ No    | Must not be taken by other user|
| `address` | String | ❌ No    | Updated address                |

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id":        "664f1a2b3c4d5e6f7a8b9c0d",
      "name":      "Rahul R. Sharma",
      "gmail":     "rahulnew@gmail.com",
      "address":   "Dharampeth, Nagpur",
      "updatedAt": "2025-03-27T12:00:00.000Z"
    }
  }
}
```

---

### DELETE `/api/user/delete`
Delete logged-in user's account. Clears cookie.

**Auth required:** ✅ Yes (cookie)

**Request Body:** None

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## 🗑️ Complaint Routes

Base path: `/api/complaint`

---

### POST `/api/complaint/submit`
Submit a new waste complaint. Sends image to ML model, saves complaint + map pin + status.

**Auth required:** ✅ Yes (cookie)

**Request Body** `multipart/form-data`

| Field       | Type   | Required | Description                    |
|-------------|--------|----------|--------------------------------|
| `image`     | File   | ✅ Yes   | JPEG / PNG / WEBP, max 5MB     |
| `latitude`  | Number | ✅ Yes   | GPS latitude e.g. `21.1458`    |
| `longitude` | Number | ✅ Yes   | GPS longitude e.g. `79.0882`   |
| `address`   | String | ❌ No    | Human-readable address         |

**Example (fetch)**
```js
const formData = new FormData();
formData.append("image", imageFile);
formData.append("latitude", "21.1458");
formData.append("longitude", "79.0882");
formData.append("address", "Sitabuldi, Nagpur");

fetch("http://localhost:5000/api/complaint/submit", {
  method: "POST",
  body: formData,
  credentials: "include",
});
```

**Response `201 Created`**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "data": {
    "complaintID":     "665a2b3c4d5e6f7a8b9c0d1e",
    "imageUrl":        "/uploads/waste-1711530000000-123456789.jpg",
    "wastePercentage": 87.5,
    "wasteType":       "Plastic Waste",
    "severity":        "High",
    "mlConfidence":    0.92,
    "latitude":        21.1458,
    "longitude":       79.0882,
    "address":         "Sitabuldi, Nagpur",
    "currentStatus":   "Waste"
  }
}
```

> ⚠️ If the ML model is offline, defaults are used (`wastePercentage: 0`, `wasteType: "Unknown"`) and the complaint is still saved.

**Response `400 Bad Request`**
```json
{
  "success": false,
  "message": "Image is required"
}
```

---

### GET `/api/complaint/all`
Get all complaints. For admin dashboard.

**Auth required:** ❌ No

**Response `200 OK`**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id":             "665a2b3c4d5e6f7a8b9c0d1e",
      "userID": {
        "_id":   "664f1a2b3c4d5e6f7a8b9c0d",
        "name":  "Rahul Sharma",
        "gmail": "rahul@gmail.com"
      },
      "imageUrl":        "/uploads/waste-1711530000000-123456789.jpg",
      "wastePercentage": 87.5,
      "wasteType":       "Plastic Waste",
      "severity":        "High",
      "mlConfidence":    0.92,
      "latitude":        21.1458,
      "longitude":       79.0882,
      "address":         "Sitabuldi, Nagpur",
      "currentStatus":   "Waste",
      "createdAt":       "2025-03-27T10:00:00.000Z",
      "updatedAt":       "2025-03-27T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/complaint/my`
Get all complaints submitted by the logged-in user.

**Auth required:** ✅ Yes (cookie)

**Response `200 OK`**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id":             "665a2b3c4d5e6f7a8b9c0d1e",
      "userID":          "664f1a2b3c4d5e6f7a8b9c0d",
      "imageUrl":        "/uploads/waste-1711530000000-123456789.jpg",
      "wastePercentage": 87.5,
      "wasteType":       "Plastic Waste",
      "severity":        "High",
      "mlConfidence":    0.92,
      "latitude":        21.1458,
      "longitude":       79.0882,
      "address":         "Sitabuldi, Nagpur",
      "currentStatus":   "Waste",
      "createdAt":       "2025-03-27T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/complaint/:id`
Get a single complaint with its status record.

**Auth required:** ❌ No

**URL Params**

| Param | Description         |
|-------|---------------------|
| `id`  | MongoDB complaint ID |

**Response `200 OK`**
```json
{
  "success": true,
  "data": {
    "complaint": {
      "_id":             "665a2b3c4d5e6f7a8b9c0d1e",
      "userID": {
        "_id":   "664f1a2b3c4d5e6f7a8b9c0d",
        "name":  "Rahul Sharma",
        "gmail": "rahul@gmail.com"
      },
      "imageUrl":        "/uploads/waste-1711530000000-123456789.jpg",
      "wastePercentage": 87.5,
      "wasteType":       "Plastic Waste",
      "severity":        "High",
      "mlConfidence":    0.92,
      "latitude":        21.1458,
      "longitude":       79.0882,
      "address":         "Sitabuldi, Nagpur",
      "currentStatus":   "Pending",
      "createdAt":       "2025-03-27T10:00:00.000Z"
    },
    "status": {
      "_id":         "665a3c4d5e6f7a8b9c0d1e2f",
      "complaintID": "665a2b3c4d5e6f7a8b9c0d1e",
      "status":      "Pending",
      "assignedTo":  "",
      "statusHistory": [
        { "status": "Pending", "note": "Complaint submitted by user", "changedAt": "2025-03-27T10:00:00.000Z" }
      ]
    }
  }
}
```

**Response `404 Not Found`**
```json
{
  "success": false,
  "message": "Complaint not found"
}
```

---

### DELETE `/api/complaint/:id`
Delete a complaint (only by the user who submitted it). Also deletes related MapData and ComplaintStatus.

**Auth required:** ✅ Yes (cookie)

**URL Params**

| Param | Description         |
|-------|---------------------|
| `id`  | MongoDB complaint ID |

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Complaint and all related data deleted"
}
```

**Response `404 Not Found`**
```json
{
  "success": false,
  "message": "Complaint not found or not authorized"
}
```

---

## 🗺️ Map Data Routes

Base path: `/api/map`

---

### GET `/api/map/all`
Get all map pins for the full map view.

**Auth required:** ❌ No

**Response `200 OK`**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "665b3c4d5e6f7a8b9c0d1e2f",
      "userID": {
        "_id":   "664f1a2b3c4d5e6f7a8b9c0d",
        "name":  "Rahul Sharma",
        "gmail": "rahul@gmail.com"
      },
      "complaintID": {
        "_id":             "665a2b3c4d5e6f7a8b9c0d1e",
        "imageUrl":        "/uploads/waste-1711530000000-123456789.jpg",
        "wastePercentage": 87.5,
        "wasteType":       "Plastic Waste",
        "mlConfidence":    0.92
      },
      "latitude":        21.1458,
      "longitude":       79.0882,
      "address":         "Sitabuldi, Nagpur",
      "state":           "Waste",
      "wastePercentage": 87.5,
      "wasteType":       "Plastic Waste",
      "severity":        "High",
      "createdAt":       "2025-03-27T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/map/my`
Get map pins for the logged-in user only.

**Auth required:** ✅ Yes (cookie)

**Response `200 OK`**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id":             "665b3c4d5e6f7a8b9c0d1e2f",
      "userID":          "664f1a2b3c4d5e6f7a8b9c0d",
      "complaintID": {
        "imageUrl":        "/uploads/waste-1711530000000-123456789.jpg",
        "wastePercentage": 87.5,
        "wasteType":       "Plastic Waste"
      },
      "latitude":  21.1458,
      "longitude": 79.0882,
      "state":     "Pending",
      "severity":  "High"
    }
  ]
}
```

---

### GET `/api/map/filter?state=Waste`
Filter map pins by state. State options: `Waste`, `Pending`, `Complete`.

**Auth required:** ❌ No

**Query Params**

| Param   | Type   | Required | Values                         |
|---------|--------|----------|--------------------------------|
| `state` | String | ❌ No    | `Waste` / `Pending` / `Complete` |

**Examples**
```
GET /api/map/filter?state=Waste
GET /api/map/filter?state=Pending
GET /api/map/filter?state=Complete
GET /api/map/filter          ← returns all (no filter)
```

**Response `200 OK`**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id":             "665b3c4d5e6f7a8b9c0d1e2f",
      "latitude":        21.1458,
      "longitude":       79.0882,
      "address":         "Sitabuldi, Nagpur",
      "state":           "Waste",
      "wastePercentage": 87.5,
      "wasteType":       "Plastic Waste",
      "severity":        "High"
    }
  ]
}
```

**Response `400 Bad Request`** *(invalid state)*
```json
{
  "success": false,
  "message": "state must be one of: Waste, Pending, Complete"
}
```

---

### GET `/api/map/:complaintID`
Get a single map pin by its complaint ID.

**Auth required:** ❌ No

**URL Params**

| Param         | Description         |
|---------------|---------------------|
| `complaintID` | MongoDB complaint ID |

**Response `200 OK`**
```json
{
  "success": true,
  "data": {
    "_id":        "665b3c4d5e6f7a8b9c0d1e2f",
    "userID": {
      "_id":   "664f1a2b3c4d5e6f7a8b9c0d",
      "name":  "Rahul Sharma",
      "gmail": "rahul@gmail.com"
    },
    "complaintID": {
      "_id":             "665a2b3c4d5e6f7a8b9c0d1e",
      "imageUrl":        "/uploads/waste-1711530000000-123456789.jpg",
      "wastePercentage": 87.5,
      "wasteType":       "Plastic Waste",
      "severity":        "High",
      "mlConfidence":    0.92
    },
    "latitude":  21.1458,
    "longitude": 79.0882,
    "address":   "Sitabuldi, Nagpur",
    "state":     "Waste"
  }
}
```

---

### PATCH `/api/map/:complaintID/state`
Update the map pin's display state. Typically called by admin.

**Auth required:** ❌ No *(add `authMiddleware` for admin-only)*

**URL Params**

| Param         | Description         |
|---------------|---------------------|
| `complaintID` | MongoDB complaint ID |

**Request Body** `application/json`
```json
{
  "state": "Pending"
}
```

| Field   | Type   | Required | Values                           |
|---------|--------|----------|----------------------------------|
| `state` | String | ✅ Yes   | `Waste` / `Pending` / `Complete` |

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Map state updated",
  "data": {
    "_id":      "665b3c4d5e6f7a8b9c0d1e2f",
    "state":    "Pending",
    "latitude": 21.1458,
    "longitude":79.0882
  }
}
```

---

## 📋 Complaint Status Routes

Base path: `/api/status`

---

### GET `/api/status/all`
Get all complaint status records. For admin panel.

**Auth required:** ❌ No

**Response `200 OK`**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "665c4d5e6f7a8b9c0d1e2f3a",
      "userID": {
        "_id":   "664f1a2b3c4d5e6f7a8b9c0d",
        "name":  "Rahul Sharma",
        "gmail": "rahul@gmail.com"
      },
      "complaintID": {
        "_id":       "665a2b3c4d5e6f7a8b9c0d1e",
        "imageUrl":  "/uploads/waste-1711530000000-123456789.jpg",
        "latitude":  21.1458,
        "longitude": 79.0882,
        "wasteType": "Plastic Waste",
        "severity":  "High"
      },
      "status":     "Pending",
      "assignedTo": "",
      "statusHistory": [
        { "status": "Pending", "note": "Complaint submitted by user", "changedAt": "2025-03-27T10:00:00.000Z" }
      ],
      "createdAt": "2025-03-27T10:00:00.000Z",
      "updatedAt": "2025-03-27T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/status/my`
Get all complaint statuses for the logged-in user.

**Auth required:** ✅ Yes (cookie)

**Response `200 OK`**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id":        "665c4d5e6f7a8b9c0d1e2f3a",
      "complaintID": {
        "_id":       "665a2b3c4d5e6f7a8b9c0d1e",
        "imageUrl":  "/uploads/waste-1711530000000-123456789.jpg",
        "latitude":  21.1458,
        "longitude": 79.0882,
        "wasteType": "Plastic Waste",
        "severity":  "High",
        "createdAt": "2025-03-27T10:00:00.000Z"
      },
      "status":    "Pending",
      "updatedAt": "2025-03-27T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/status/:complaintID`
Get the current status of a specific complaint.

**Auth required:** ❌ No

**URL Params**

| Param         | Description         |
|---------------|---------------------|
| `complaintID` | MongoDB complaint ID |

**Response `200 OK`**
```json
{
  "success": true,
  "data": {
    "_id": "665c4d5e6f7a8b9c0d1e2f3a",
    "userID": {
      "_id":   "664f1a2b3c4d5e6f7a8b9c0d",
      "name":  "Rahul Sharma",
      "gmail": "rahul@gmail.com"
    },
    "complaintID": {
      "_id":       "665a2b3c4d5e6f7a8b9c0d1e",
      "imageUrl":  "/uploads/waste-1711530000000-123456789.jpg",
      "latitude":  21.1458,
      "longitude": 79.0882,
      "wasteType": "Plastic Waste",
      "severity":  "High"
    },
    "status":     "Accept",
    "assignedTo": "Worker Team A",
    "statusHistory": [
      { "status": "Pending", "note": "Complaint submitted by user",  "changedAt": "2025-03-27T10:00:00.000Z" },
      { "status": "Accept",  "note": "Complaint accepted by admin",  "changedAt": "2025-03-27T11:00:00.000Z" }
    ]
  }
}
```

---

### GET `/api/status/:complaintID/history`
Get the full status change history of a complaint (audit trail).

**Auth required:** ❌ No

**URL Params**

| Param         | Description         |
|---------------|---------------------|
| `complaintID` | MongoDB complaint ID |

**Response `200 OK`**
```json
{
  "success":       true,
  "currentStatus": "Working",
  "history": [
    { "status": "Pending",  "note": "Complaint submitted by user",  "changedAt": "2025-03-27T10:00:00.000Z" },
    { "status": "Accept",   "note": "Complaint accepted by admin",  "changedAt": "2025-03-27T11:00:00.000Z" },
    { "status": "Working",  "note": "Team dispatched to location",  "changedAt": "2025-03-27T12:00:00.000Z" }
  ]
}
```

---

### PATCH `/api/status/:complaintID`
Update complaint status. Automatically syncs `MapData.state` and `Complaint.currentStatus`.

**Auth required:** ❌ No *(add `authMiddleware` for admin-only)*

**URL Params**

| Param         | Description         |
|---------------|---------------------|
| `complaintID` | MongoDB complaint ID |

**Request Body** `application/json`
```json
{
  "status":     "Working",
  "note":       "Team dispatched to location",
  "assignedTo": "Worker Team A"
}
```

| Field        | Type   | Required | Values                                     |
|--------------|--------|----------|--------------------------------------------|
| `status`     | String | ✅ Yes   | `Pending` / `Accept` / `Working` / `Complete` |
| `note`       | String | ❌ No    | Admin note or remark                       |
| `assignedTo` | String | ❌ No    | Worker name or team assigned               |

**Response `200 OK`**
```json
{
  "success": true,
  "message": "Status updated to \"Working\"",
  "data": {
    "_id":        "665c4d5e6f7a8b9c0d1e2f3a",
    "status":     "Working",
    "assignedTo": "Worker Team A",
    "statusHistory": [
      { "status": "Pending", "note": "Complaint submitted by user", "changedAt": "2025-03-27T10:00:00.000Z" },
      { "status": "Accept",  "note": "Complaint accepted by admin", "changedAt": "2025-03-27T11:00:00.000Z" },
      { "status": "Working", "note": "Team dispatched to location", "changedAt": "2025-03-27T12:00:00.000Z" }
    ]
  }
}
```

**Response `400 Bad Request`** *(invalid status)*
```json
{
  "success": false,
  "message": "status must be one of: Pending, Accept, Working, Complete"
}
```

---

## 🏥 Health Check

### GET `/health`

**Auth required:** ❌ No

**Response `200 OK`**
```json
{
  "success":     true,
  "message":     "Server is running",
  "environment": "development",
  "timestamp":   "2025-03-27T10:00:00.000Z"
}
```

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Description of what went wrong"
}
```

| HTTP Code | Meaning                                           |
|-----------|---------------------------------------------------|
| `400`     | Bad Request — missing or invalid fields           |
| `401`     | Unauthorized — not logged in or token expired     |
| `403`     | Forbidden — not allowed (wrong user/role)         |
| `404`     | Not Found — resource does not exist               |
| `409`     | Conflict — duplicate record (e.g. gmail taken)    |
| `500`     | Internal Server Error — something broke on server |

---

## 🔄 Status Flow

```
Complaint Submitted
       ↓
   [ Pending ]   ← Auto-set on submit
       ↓
   [ Accept ]    ← Admin accepts complaint
       ↓
   [ Working ]   ← Team dispatched / actively cleaning
       ↓
   [ Complete ]  ← Waste cleared and confirmed
```

**Map pin color synced automatically with status:**

| Status     | Map Pin Color |
|------------|---------------|
| `Waste`    | 🔴 Red        |
| `Pending`  | 🟡 Yellow     |
| `Complete` | 🟢 Green      |

> When admin updates `/api/status/:complaintID`, both `MapData.state` and `Complaint.currentStatus` are updated automatically in the same request.

---

## 📦 Required npm Packages

```bash
# Backend
npm install express mongoose bcryptjs jsonwebtoken cookie-parser cors dotenv multer axios form-data

# Dev
npm install --save-dev nodemon
```

---

## 📁 Project Structure

```
project/
├── index.js
├── app.js
├── .env
├── uploads/                         ← uploaded waste images
├── config/
│   └── mongodb.js
├── models/
│   ├── user.model.js
│   ├── complaint.model.js
│   ├── mapData.model.js
│   └── complaintStatus.model.js
├── controllers/
│   ├── user.controller.js
│   ├── complaint.controller.js
│   ├── mapData.controller.js
│   └── complaintStatus.controller.js
├── routes/
│   ├── user.routes.js
│   ├── complaint.routes.js
│   ├── mapData.routes.js
│   └── complaintStatus.routes.js
└── middlewares/
    └── authMiddleware.js
```

---

*Last updated: March 2026*