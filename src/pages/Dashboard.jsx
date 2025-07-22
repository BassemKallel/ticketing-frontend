import TicketList from '../components/tickets/TicketList';




const Dashboard = () => {
    const recentTicketsData = [
        { id: 'TKT-1001', subject: 'Order not delivered', status: 'Open', priority: 'High', created: '01/11/2023' },
        { id: 'TKT-1002', subject: 'Wrong item received', status: 'In Progress', priority: 'Medium', created: '02/11/2023' },
        { id: 'TKT-1003', subject: 'Refund request', status: 'Resolved', priority: 'Low', created: '28/10/2023' },
    ];

    return (
        <div>
            {/* Vous pouvez ajouter les StatCards ici plus tard */}
            <TicketList title="Recent Tickets" tickets={recentTicketsData} />
        </div>
    );
};

export default Dashboard;