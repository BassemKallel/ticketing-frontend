import React, { useState, useEffect } from 'react';
import TicketList from '../components/tickets/TicketList';
import ticketService from '../services/ticketService';


const AllTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const data = await ticketService.getAll();
                console.log("Fetched tickets:", data); 
                setTickets(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTickets();
    }, []);

    return (
        <div>
            <TicketList
                title="All Tickets"
                tickets={tickets} 
                isLoading={isLoading} 
                error={error} 
            />
        </div>
    );
};

export default AllTicketsPage;