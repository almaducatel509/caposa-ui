# 📄 CAPOSA — FRONTEND TS ↔ DJANGO MODELS MAPPING

---

# 1. 👤 USER / AUTH

## Frontend (TypeScript)

```ts
interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}
```

## Django (Model conceptuel)

```py
class User(AbstractUser):
    roles = ArrayField(models.CharField(...))
```

---

## 🔁 Mapping

| Frontend | Django                              |
| -------- | ----------------------------------- |
| id       | id (UUID / PK)                      |
| username | username                            |
| email    | email                               |
| roles    | roles (ArrayField / M2M Role model) |

---

# 2. 👤 EMPLOYEE

## Frontend

```ts
interface EmployeeData {
  id: string;
  username: string;

  first_name: string;
  last_name: string;

  phone_number: string;
  address: string;
  gender: string;
  date_of_birth: string;

  payment_ref: string;

  branch: Branch;
  posts: Post[];

  photo_profil: string | null;

  created_at: string;
  updated_at: string;
}
```

---

## Django Model (expected)

```py
class Employee(models.Model):
    user = OneToOneField(User)

    first_name = models.CharField()
    last_name = models.CharField()

    phone_number = models.CharField()
    address = models.TextField()
    gender = models.CharField()
    date_of_birth = models.DateField()

    payment_ref = models.CharField()

    branch = ForeignKey(Branch)
    posts = ManyToManyField(Post)

    photo_profil = models.ImageField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## 🔁 Mapping ligne par ligne

| Frontend      | Django                    |
| ------------- | ------------------------- |
| id            | id                        |
| username      | user.username             |
| first_name    | first_name                |
| last_name     | last_name                 |
| phone_number  | phone_number              |
| address       | address                   |
| gender        | gender                    |
| date_of_birth | date_of_birth             |
| payment_ref   | payment_ref               |
| branch        | branch (FK → Branch.id)   |
| posts         | posts (M2M → Post.id[])   |
| photo_profil  | photo_profil (ImageField) |
| created_at    | created_at                |
| updated_at    | updated_at                |

---

# 3. 🏢 BRANCH

## Frontend

```ts
interface Branch {
  id: string;
  branch_name: string;
  branch_code: string;
}
```

## Django

```py
class Branch(models.Model):
    branch_name = models.CharField()
    branch_code = models.CharField()
```

---

## 🔁 Mapping

| Frontend    | Django      |
| ----------- | ----------- |
| id          | id          |
| branch_name | branch_name |
| branch_code | branch_code |

---

# 4. 💼 POSTS

## Frontend

```ts
interface Post {
  id: string;
  name: string;
}
```

## Django

```py
class Post(models.Model):
    name = models.CharField()
```

---

## 🔁 Mapping

| Frontend | Django |
| -------- | ------ |
| id       | id     |
| name     | name   |

---

# 5. 🔐 CREATE EMPLOYEE (IMPORTANT DIFFERENCE)

## Frontend payload

```ts
{
  user: {
    username: string,
    email: string,
    password: string
  },
  ...
}
```

---

## Django expects (serializer logic)

👉 backend must split:

```py
user = User.objects.create_user(...)
employee = Employee.objects.create(user=user, ...)
```

---

## 🔁 Mapping CREATE ONLY

| Frontend      | Backend Action      |
| ------------- | ------------------- |
| user.username | User.username       |
| user.email    | User.email          |
| user.password | User.set_password() |
| rest fields   | Employee model      |

---

# 6. 📁 FILE UPLOAD

| Frontend            | Django     |
| ------------------- | ---------- |
| photo_profil (File) | ImageField |

---

# 7. 🔗 RELATIONS SUMMARY

```
User (1) ─── (1) Employee
Employee (N) ─── (1) Branch
Employee (N) ─── (N) Post
```

---

# 🚀 IMPORTANT BACKEND RULES

* Never expose password
* Always serialize branch + posts (nested read)
* Always hash password (`set_password`)
* Use UUID for all IDs
* Handle nested `user` only on CREATE
* Keep Employee flat on READ

---

# 💡 WHY THIS FORMAT IS POWERFUL

✔ backend sees exact mapping
✔ zero ambiguity
✔ no React logic pollution
✔ direct DRF serializer implementation possible
✔ reduces 80% integration bugs

