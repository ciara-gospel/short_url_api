# short_url
This project is a secure backend API for a URL shortening service, with features such as user authentication, short url and redirection url.

## Features

- User registration and login with secure password hashing
- JWT-based authentication with protected API endpoints
- Authenticated users can create short URLs
- Public redirection route with click tracking
- Optional custom short codes and link expiration
- PostgreSQL database integration
- Clear, informative error handling

---

## Tech Stack

- **Node.js** / **Express**
- **PostgreSQL** with `pg` module
- **JWT** for authentication
- **bcrypt** for password hashing
- **dotenv** for environment variables