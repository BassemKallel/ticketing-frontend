import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';


const MainLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-grow flex flex-col">
                <Header />
                <main className="flex-grow p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

