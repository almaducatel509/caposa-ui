Parfait — là tu es dans la bonne direction, mais ton doc est encore **trop “frontend-détaillé” et redondant** pour un backend dev DRF.

Je te le simplifie en version **backend-first, clean, minimal, sans blabla inutile**, prêt à copier-coller 👇

---

# 📄 CAPOSA — API CONTRACT (Frontend ↔ Backend DRF)

## 1. 🎯 OBJECTIF

Définir les endpoints et formats d’échange entre Frontend (Next.js) et Backend (Django REST Framework).

---

# 2. 🔐 AUTH

## POST `/api/auth/login/`

### Request

```json
{
  "username": "string",
  "password": "string"
}
```

### Response (200)

```json
{
  "access": "jwt",
  "refresh": "jwt",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "roles": ["string"]
  }
}
```

---

# 3. 👤 EMPLOYEES

## POST `/api/employees/` (CREATE)

### Request

```json
{
  "user": {
    "username": "string",
    "email": "string",
    "password": "string"
  },
  "first_name": "string",
  "last_name": "string",
  "date_of_birth": "YYYY-MM-DD",
  "phone_number": "string",
  "address": "string",
  "gender": "string",
  "payment_ref": "string",
  "branch": "uuid",
  "posts": ["uuid"],
  "photo_profil": "file|null"
}
```

---

## GET `/api/employees/` (LIST)

### Response

```json
[
  {
    "id": "uuid",
    "username": "string",
    "first_name": "string",
    "last_name": "string",
    "phone_number": "string",

    "branch": {
      "id": "uuid",
      "branch_name": "string"
    },

    "posts": [
      {
        "id": "uuid",
        "name": "string"
      }
    ],

    "photo_profil": "string|null",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

---

## GET `/api/employees/{id}/`

Same as above (single object)

---

## PUT `/api/employees/{id}/` (UPDATE)

### Request

```json
{
  "first_name": "string",
  "last_name": "string",
  "phone_number": "string",
  "address": "string",
  "gender": "string",
  "branch": "uuid",
  "posts": ["uuid"],
  "photo_profil": "file|null",
  "remove_photo": true
}
```

---

## DELETE `/api/employees/{id}/`

```json
{
  "detail": "deleted"
}
```

---

# 4. 🏢 BRANCHES

## GET `/api/branches/`

```json
[
  {
    "id": "uuid",
    "branch_name": "string",
    "branch_code": "string"
  }
]
```

---

# 5. 💼 POSTS

## GET `/api/posts/`

```json
[
  {
    "id": "uuid",
    "name": "string"
  }
]
```

---

# 6. 🔐 RULES SIMPLES

* email unique
* username unique
* password min 6 chars
* employee must have:

  * 1 branch
  * at least 1 post
* photo_profil optional

---

# 7. 🔄 GLOBAL RULES

* Auth: JWT Bearer token
* All IDs = UUID
* Dates = ISO format
* File upload supported for `photo_profil`
* Nested objects allowed:

  * `branch`
  * `posts`

---

# 8. ⚠️ IMPORTANT FOR BACKEND DEV

Frontend expects:

* nested `user` only on CREATE
* flattened employee on GET
* branch + posts populated
* JWT auth required on all employee endpoints

---

# 🚀 SUMMARY

Backend must implement:

* JWT auth
* Employee CRUD
* Branch CRUD (read-only ok)
* Posts CRUD (read-only ok)
* Nested serializers (branch + posts)
* File upload support

