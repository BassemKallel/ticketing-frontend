import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import statisticsService from '../services/statisticsService';
import { TicketIcon, UserGroupIcon, ClockIcon, CheckCircleIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import TicketList from '../components/tickets/TicketList';
import { StatCard, CategoryChart, AgentPerformanceChart } from '../components/dashboard/DashboardComponents';

// --- Tableau de bord pour l'Admin ---
const AdminDashboard = ({ stats }) => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Tickets Ouverts" value={stats.tickets.open} icon={<TicketIcon className="h-6 w-6 text-orange-600" />} color="bg-orange-100" />
            <StatCard title="Tickets en Cours" value={stats.tickets.in_progress} icon={<ClockIcon className="h-6 w-6 text-blue-600" />} color="bg-blue-100" />
            <StatCard title="Tickets Résolus" value={stats.tickets.resolved} icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />} color="bg-green-100" />
            <StatCard title="Total Utilisateurs" value={stats.users.total} icon={<UserGroupIcon className="h-6 w-6 text-purple-600" />} color="bg-purple-100" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <AgentPerformanceChart performanceData={stats.agent_performance} />
            <CategoryChart categoryData={stats.tickets_by_category} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tickets Récents</h2>
            <TicketList tickets={stats.recent_tickets} />
        </div>
    </>
);

// --- Tableau de bord pour l'Agent ---
const AgentDashboard = ({ stats }) => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Tickets Ouverts" value={stats.tickets.open} icon={<TicketIcon className="h-6 w-6 text-orange-600" />} color="bg-orange-100" />
            <StatCard title="Tickets en Cours" value={stats.tickets.in_progress} icon={<ClockIcon className="h-6 w-6 text-blue-600" />} color="bg-blue-100" />
            <StatCard title="Tickets Résolus" value={stats.tickets.resolved} icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />} color="bg-green-100" />
            <StatCard title="Mon Taux de Réussite" value={`${stats.my_performance.success_rate}%`} icon={<ChartPieIcon className="h-6 w-6 text-indigo-600" />} color="bg-indigo-100" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tickets Récents</h2>
            <TicketList tickets={stats.recent_tickets} />
        </div>
    </>
);

// --- Tableau de bord pour le Client (MIS À JOUR) ---
const ClientDashboard = ({ stats }) => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Mes Tickets au Total" value={stats.my_tickets.total} icon={<TicketIcon className="h-6 w-6 text-gray-600" />} color="bg-gray-100" />
            <StatCard title="Tickets Ouverts" value={stats.my_tickets.open} icon={<TicketIcon className="h-6 w-6 text-orange-600" />} color="bg-orange-100" />
            <StatCard title="Tickets en Cours" value={stats.my_tickets.in_progress} icon={<ClockIcon className="h-6 w-6 text-blue-600" />} color="bg-blue-100" />
            <StatCard title="Tickets Résolus" value={stats.my_tickets.resolved} icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />} color="bg-green-100" />
        </div>
        {/* NOUVEAU : On ajoute le graphique pour le client */}
        <div className="mt-8">
            <CategoryChart categoryData={stats.my_tickets.by_category} />
        </div>
    </>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await statisticsService.getStats();
                setStats(data);
            } catch (err) {
                setError("Impossible de charger les statistiques.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    // --- Rendu conditionnel du bon tableau de bord ---
    const renderDashboard = () => {
        if (!stats) return null;

        switch (user?.role) {
            case 'admin':
                return <AdminDashboard stats={stats} />;
            case 'agent':
                return <AgentDashboard stats={stats} />;
            case 'client':
                return <ClientDashboard stats={stats} />;
            default:
                return <p>Aucune statistique à afficher pour votre rôle.</p>;
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
                <p className="text-gray-500 mt-1">Bienvenue, {user?.name}.</p>
            </div>
            {renderDashboard()}
        </div>
    );
};

export default Dashboard;
