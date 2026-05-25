# Course Selling App - Backend Integration Tests

This repository contains robust integration test cases for a Course Selling backend application. The tests are written using **Bun’s native test runner** and validate the API endpoints, role-based authorization, and database integrity managed by **Prisma ORM**.

---

## API-ENDPOINTS

* **POST**/auth/signup
* **POST**/auth/login
* **POST**/courses
    * Only INSTRUCTOR can create courses
* **GET**/courses
    * Public Endpoints
* **GET**/courses/:id
    * Get all courses with all lessons
* **PATCH**/courses/:id
    * Only course instructor
* **DELETE**/courses/:id
   * Only course instructor
* **GET**/courses/:courseId/lessons
  * Public Endpoint
* **POST**/lessons
  * Create lessons ( Only instructor of the course) 
* **POST**/purchases
  * Student purchase a course
* **GET**/users/:id/purchases
  * Get all purchases courses of user


 ## Required Schemas
* SignupSchema
    * email
    * password (min 6 chars)
    * name
    * role
* LoginSchema
    * email
    * password
    * CreateCourseSchema
    * title
    * description
    * price
* CreateLessonSchema
    * title
    * content
    * courseId
* PurchaseCourseSchema
    * courseId

## 🚀 Features & Test Coverage

### ✅ Authentication & Authorization
* **JWT Validation:** Secure signup, login, and token verification (`/me`).
* **Role-Based Access Control (RBAC):** Strict separation between `Student` and `Instructor` actions.
* **Ownership Enforcement:** Only the creator of a course/lesson can update or delete it.

### ✅ Course & Lesson Management
* **Courses:** Create (Instructors only), read (Public), update, and delete (Owners only).
* **Lessons:** Add and retrieve lessons linked to specific courses.

### ✅ Purchase Flow
* **Purchase Integrity:** Students can purchase courses; instructors cannot.
* **Edge Cases:** Prevents duplicate purchases and enforces data privacy (users can only view their own purchases).
* **HTTP Status Validation:** Strict assertion of `401 Unauthorized`, `403 Forbidden`, and `404 Not Found` codes.

---

## 🛠️ Prerequisites

Ensure you have the following installed on your local machine:
* [Bun](https://bun.sh) (v1.0 or higher)
* PostgreSQL / MySQL / SQLite (depending on your Prisma setup)

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/sahilguptatech01-droid/Course-Selling-Platform-Api.git
cd course-selling-platform-api
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your database connection string and JWT secret:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/course_db?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
```

### 4. Database Migration & Prisma Client
Generate the Prisma client and run migrations to set up your database schema:
```bash
# Generate Prisma Client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev --name init
```

---

## 🧪 Running the Tests

Before running the tests, make sure your backend server is active. If your server URL differs from the default, update the `BASE_URL` inside your test files:
```typescript
const BASE_URL = "http://localhost:3000";
```



## 🛠️ Technology Stack
* **Runtime:** [Bun](https://bun.sh)
* **Database ORM:** [Prisma](https://prisma.io)
* **Language:** TypeScript
