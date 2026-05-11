## Course Selling App 

This repository contains **integration test cases** for a Course Selling backend application, written using **Bun’s test runner**.



---

## Test Coverage

✅ **Authentication**

* Signup
* Login
* JWT validation
* Protected routes (`/me`)

✅ **Authorization (Role-based)**

* Students cannot create courses or lessons
* Instructors cannot purchase courses
* Ownership enforcement for updates & deletes

✅ **Courses**

* Create course (Instructor only)
* Get all courses (Public)
* Get course by ID
* Update & delete course (Owner only)

✅ **Lessons**

* Add lessons (Course instructor only)
* Get lessons for a course (Public)

✅ **Purchases**

* Student purchases a course
* Duplicate purchase prevention
* User can view only their own purchases

✅ **Negative & Edge Cases**

* Forbidden access (`403`)
* Unauthorized access (`401`)
* Ownership violations

---

## Setup

Install dependencies:

```bash
bun install
```

Update backend URL if required:

```ts
const BASE_URL = "http://localhost:3000";
```


---
## Requirements Validated

✅ JWT-based authentication
✅ Role-based authorization (Student vs Instructor)
✅ Ownership checks for courses & lessons
✅ Purchase flow integrity
✅ Correct HTTP status codes

---

