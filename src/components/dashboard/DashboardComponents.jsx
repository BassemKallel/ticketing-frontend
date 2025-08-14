import React from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement, // <-- 1. Outil manquant pour dessiner les points
    LineElement,  // <-- 2. Outil manquant pour dessiner les lignes
    Title
} from 'chart.js';

// --- 3. CORRECTION : On enregistre les outils manquants ---
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement, // Ajouté
    LineElement,  // Ajouté
    Title
);

export const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 transition-transform hover:scale-105">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export const CategoryChart = ({ categoryData }) => {
    if (!categoryData || categoryData.length === 0) {
        return <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">Aucune donnée de catégorie.</div>;
    }

    const data = {
        labels: categoryData.map(item => item.categorie),
        datasets: [{
            label: 'Tickets',
            data: categoryData.map(item => item.total),
            backgroundColor: ['rgba(251, 146, 60, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)'],
            borderColor: ['#FDBA74', '#93C5FD', '#FCA5A5'],
            borderWidth: 1,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tickets par Catégorie</h2>
            <div className="relative h-72 w-full">
                <Doughnut data={data} options={options} />
            </div>
        </div>
    );
};

export const AgentPerformanceChart = ({ performanceData }) => {
    if (!performanceData || performanceData.length === 0) {
        return <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">Aucune donnée de performance.</div>;
    }

    const data = {
        labels: performanceData.map(agent => agent.name),
        datasets: [{
            label: 'Taux de réussite (%)',
            data: performanceData.map(agent => agent.success_rate),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#93C5FD',
            borderWidth: 1,
        }],
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Performance des Agents</h2>
            <Bar data={data} options={{ responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }} />
        </div>
    );
};

export const TicketVolumeChart = ({ volumeData }) => {
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }).reverse();

    const chartData = last7Days.map(day => {
        const found = volumeData.find(item => new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) === day);
        return found ? found.total : 0;
    });

    const data = {
        labels: last7Days,
        datasets: [
            {
                label: 'Tickets Créés',
                data: chartData,
                fill: true,
                backgroundColor: 'rgba(251, 146, 60, 0.2)',
                borderColor: 'rgba(251, 146, 60, 1)',
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tickets Créés (7 derniers jours)</h2>
            <Line options={options} data={data} />
        </div>
    );
};
