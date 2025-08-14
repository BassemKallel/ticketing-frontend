import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { toast } from 'react-toastify'; // Supprimé
import { useAuth } from '../hooks/useAuth'; 
import userService from '../services/userService';
import echo from '../services/echo';

import UserTable from '../components/users/UserTable';
import UserFilters from '../components/users/UserFilters'; 
import ConfirmationModal from '../components/tickets/ConfirmationModal';
import UserModal from '../components/users/UserModal';

const UsersListPage = () => {
    const [allUsers, setAllUsers] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: currentUser } = useAuth();
    
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    const [filters, setFilters] = useState({ search: '', role: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const usersData = await userService.getAllUsers();
                setAllUsers(usersData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (currentUser?.role !== 'admin') {
            return;
        }
        const channel = echo.private('team');

        const handleUserAdded = (event) => {
            const newUser = event.user;
            if (newUser) {
                setAllUsers(prevUsers => [newUser, ...prevUsers]);
            }
        };

        const handleUserUpdated = (event) => {
            const updatedUser = event.user;
            if (updatedUser) {
                setAllUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
                    )
                );
            }
        };

        const handleUserDeleted = (event) => {
            const { userId } = event;
            if (userId) {
                setAllUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            }
        };

        channel
            .listen('.user.ajoute', handleUserAdded)
            .listen('.user.mise_a_jour', handleUserUpdated)
            .listen('.user.supprime', handleUserDeleted);

        return () => {
            channel
                .stopListening('.user.ajoute', handleUserAdded)
                .stopListening('.user.mise_a_jour', handleUserUpdated)
                .stopListening('.user.supprime', handleUserDeleted);
            echo.leave('team');
        };
    }, [currentUser?.role]);

    const filteredUsers = useMemo(() => {
        let users = [...allUsers];
        const searchTerm = filters.search.toLowerCase().trim();

        if (searchTerm) {
            users = users.filter(user =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.role) {
            users = users.filter(user => user.role === filters.role);
        }

        return users;
    }, [allUsers, filters]);

    const handleAddUserClick = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditUserClick = (userId) => {
        const user = allUsers.find(u => u.id === userId);
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleDeleteRequest = (userId) => {
        setUserToDelete(userId);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await userService.deleteUser(userToDelete);
        } catch (err) {
            console.error("La suppression a échoué:", err);
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };
    
    const handleModalSuccess = (response) => {
        const updatedOrNewUser = response.user; 
        if (!updatedOrNewUser) return;
        const userExists = allUsers.some(u => u.id === updatedOrNewUser.id);
        if (userExists) {
            setAllUsers(allUsers.map(u => u.id === updatedOrNewUser.id ? updatedOrNewUser : u));
        } else {
            setAllUsers([updatedOrNewUser, ...allUsers]);
        }
    };
    

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
                <button
                    onClick={handleAddUserClick}
                    className="bg-[#F28C38] text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-300 transition-colors"
                >
                    Ajouter un utilisateur
                </button>
            </div>

            <UserFilters 
                filters={filters}
                setFilters={setFilters}
                onReset={() => setFilters({ search: '', role: '' })}
            />

            <UserTable
                users={filteredUsers}
                currentUser={currentUser}
                onViewUser={(userId) => console.log("Voir l'utilisateur:", userId)}
                onEditUser={handleEditUserClick}
                onDeleteUser={handleDeleteRequest}
            />

            <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDelete}
                title="Supprimer l'Utilisateur"
                message="Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action est irréversible."
                isConfirming={isDeleting}
            />

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userToEdit={userToEdit}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

export default UsersListPage;
