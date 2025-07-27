import React, { useState, useEffect, useMemo } from 'react';
import TicketFilters from '../components/tickets/TicketFilters';
import TicketList from '../components/tickets/TicketList';
import ticketService from '../services/ticketService';
import userService from '../services/userService';

const AllTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [agents, setAgents] = useState([]); // Nouvel état pour les agents
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const initialFilters = {
        search: '',
        status: '',
        priority: '',
        agent: '' // Ajout du filtre agent
    };
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        const loadData = async () => {
            try {
                // On charge les tickets et les agents en parallèle
                const [ticketsData, agentsData] = await Promise.all([
                    ticketService.getAll(),
                    userService.getAgents()
                ]);
                setTickets(ticketsData);
                setAgents(agentsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Fonction pour réinitialiser les filtres
    const handleResetFilters = () => {
        setFilters(initialFilters);
    };

    // Logique de filtrage améliorée et optimisée avec useMemo
    const filteredTickets = useMemo(() => {
        // Normalise le terme de recherche une seule fois pour la performance
        const searchTerm = filters.search.toLowerCase().trim();

        // Si pas de filtres, on retourne tous les tickets directement
        if (!searchTerm && !filters.status && !filters.priority && !filters.agent) {
            return tickets;
        }

        return tickets.filter(ticket => {
            // Condition de recherche (ID, Sujet/Titre, Créateur)
            // On vérifie que chaque propriété existe avant de faire le .includes()
            const searchMatch = searchTerm === '' ||
                (ticket.id && ticket.id.toString().toLowerCase().includes(searchTerm)) ||
                (ticket.title && ticket.title.toLowerCase().includes(searchTerm)) ||
                (ticket.createur && ticket.createur.name && ticket.createur.name.toLowerCase().includes(searchTerm));

            // Filtre par statut
            const statusMatch = filters.status === '' || ticket.statut === filters.status;
            
            // Filtre par priorité
            const priorityMatch = filters.priority === '' || ticket.categorie === filters.priority;
            
            // Filtre par agent (comparaison de chaînes de caractères pour plus de sécurité)
            const agentMatch = filters.agent === '' || (ticket.agent_id && ticket.agent_id.toString() === filters.agent);

            // Le ticket est inclus s'il correspond à TOUS les filtres actifs
            return searchMatch && statusMatch && priorityMatch && agentMatch;
        });
    }, [tickets, filters]); // Le calcul est refait seulement si la liste de tickets ou les filtres changent

    return (
        <div>
            <TicketFilters 
                filters={filters} 
                setFilters={setFilters} 
                agents={agents} // On passe la liste des agents au composant de filtres
                onReset={handleResetFilters} // On passe la fonction de reset
            />
            <TicketList 
                tickets={filteredTickets} 
                isLoading={isLoading} 
                error={error} 
            />
        </div>
    );
};

export default AllTicketsPage;