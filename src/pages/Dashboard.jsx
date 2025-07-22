import TicketList from '../components/tickets/TicketList';




const Dashboard = () => {
    const recentTicketsData = [
        { id: 'TKT-1001', title: 'Order not delivered', createur : {name : 'John Doe'} , statut: 'Ouvert', categorie: 'Bloquant', agent : {name : 'Alex Johnson'} ,  created_at: '01/11/2023' },
        { id: 'TKT-1002', title: 'Wrong item received', createur : {name : 'John Doe'} , statut: 'En_cours', categorie: 'Question',agent : {name : 'Alex Johnson'}, created_at: '02/11/2023' },
        { id: 'TKT-1003', title: 'Refund request', createur : {name : 'John Doe'} , statut: 'Resolu', categorie: 'Demande',agent : {name : 'Alex Johnson'}, created_at: '28/10/2023' },
    ];

    return (
        <div>
            {/* Vous pouvez ajouter les StatCards ici plus tard */}
            <TicketList title="Recent Tickets" tickets={recentTicketsData} />
        </div>
    );
};

export default Dashboard;