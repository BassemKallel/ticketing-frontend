import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Auth/Login';
import Signup from '../pages/Auth/Register';
import TicketDetailPage from '../pages/TicketDetailPage';
import AllTicketsPage from '../pages/AllTicketsPage';
import MyTicketsPage from '../pages/MyticketsPages';
import { useAuth } from '../hooks/useAuth'; 
import UsersListPage from '../pages/UserListPage';
import NotificationsPage from '../pages/NotificationsPage';
import NotFoundPage from '../pages/NotFoundPage';



const ProtectedRoute = ({ children }) => {
    const { token } = useAuth(); // Utilise le hook pour vérifier le token
    if (!token) {
        // Si l'utilisateur n'est pas connecté, redirige vers la page de login
        return <Navigate to="/login" replace />;
    }
    return children;
};

// --- Composant pour les routes publiques (login, register) ---
// NOUVEAU : Ce composant empêche un utilisateur connecté d'accéder à ces pages.
const PublicRoute = ({ children }) => {
    const { token } = useAuth(); // Utilise le hook pour vérifier le token
    if (token) {
        // Si l'utilisateur est déjà connecté, redirige vers le dashboard
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};


// --- Composant pour protéger les routes réservées aux admins ---
const AdminRoute = ({ children }) => {
    const { user } = useAuth(); // Utilise le hook pour vérifier le rôle
    if (user?.role !== 'admin') {
        // Si l'utilisateur n'est pas un admin, redirige vers le dashboard
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};


// --- Définition de toutes les routes de l'application ---
const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* Redirection de la racine */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><MainLayout><AllTicketsPage /></MainLayout></ProtectedRoute>} />
            <Route path="/mytickets" element={<ProtectedRoute><MainLayout><MyTicketsPage /></MainLayout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><AdminRoute><MainLayout><UsersListPage /></MainLayout></AdminRoute></ProtectedRoute>} />
            <Route path="/tickets/:id" element={<ProtectedRoute><MainLayout><TicketDetailPage /></MainLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><MainLayout><NotificationsPage /></MainLayout></ProtectedRoute>} />

            <Route path="*" element={NotFoundPage} />
        </Routes>
    );
};

export default AppRoutes;