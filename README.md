# Movie Ticket Booking Frontend

A frontend for browsing movies and shows, selecting seats, booking tickets and making payments. Administrators can manage users, movies, theatres, shows and bookings, and view payments.

## Technologies

- React and TypeScript
- React Router
- Axios
- Bootstrap
- Webpack

## Setup

Install Node.js 22 or newer and start the backend.

The frontend connects to `http://localhost:8080/moviebackend/api`. Set `REACT_APP_API_BASE_URL` before starting or building if the backend uses a different URL.

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Accounts

Register a customer account or use an account added by the backend database script:

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@movies.lk` | `AdminDemo@123` |
| CUSTOMER | `nimal@movies.lk` | `CustomerDemo@123` |

The session ends on sign-out or expiry.

## Pages

- Sign in and sign up
- Movies, movie details, theatres and shows
- Seat selection, booking history and payments
- Administrator screens for users, movies, theatres, shows, bookings and payments

## Build

```bash
npm run build
```

The build is saved in `dist`. The web server should serve `index.html` for frontend routes.

## Future expansion

[Future expansion proposal](docs/future-expansion.md)
