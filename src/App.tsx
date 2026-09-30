import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { TheatresPage } from './pages/TheatresPage';
import { ShowsPage } from './pages/ShowsPage';
import { ManageMoviesPage } from './pages/ManageMoviesPage';
import { ManageTheatresPage } from './pages/ManageTheatresPage';
import { ManageShowsPage } from './pages/ManageShowsPage';
import { UsersPage } from './pages/UsersPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetailsPage />} />
            <Route path="/theatres" element={<TheatresPage />} />
            <Route path="/shows" element={<ShowsPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route element={<Layout />}>
            <Route path="/admin/movies" element={<ManageMoviesPage />} />
            <Route path="/admin/theatres" element={<ManageTheatresPage />} />
            <Route path="/admin/shows" element={<ManageShowsPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/movies" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
