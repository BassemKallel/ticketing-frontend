import React from 'react';
import CreateTicketModal from '../tickets/CreateTicketModal';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';


const MainLayout = ({ children }) => {
    const [isCreateTicketModalOpen, setCreateTicketModalOpen] = useState(false);
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header onOpenCreateTicket={() => setCreateTicketModalOpen(true)} />
                <main className="flex-grow p-8 overflow-y-auto">{children}</main>
                <CreateTicketModal isOpen={isCreateTicketModalOpen} onClose={() => setCreateTicketModalOpen(false)} />
            </div>
        </div>
    );
};

export default MainLayout;

