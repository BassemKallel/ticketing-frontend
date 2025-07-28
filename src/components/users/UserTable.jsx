import React from 'react';
import UserTableRow from './UserTableRow';

const UserTable = ({ users, currentUser, onViewUser, onEditUser, onDeleteUser }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <th className="px-5 py-3 font-semibold">Utilisateur</th>
                            <th className="px-5 py-3 font-semibold">Rôle</th>
                            <th className="px-5 py-3 font-semibold">Date d'ajout</th>
                            <th className="px-5 py-3 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {users.length > 0 ? (
                            users.map(user => (
                                <UserTableRow
                                    key={user.id}
                                    user={user}
                                    currentUser={currentUser}
                                    onViewUser={onViewUser}
                                    onEditUser={onEditUser}
                                    onDeleteUser={onDeleteUser} // Assurez-vous que cette ligne est présente
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-500">
                                    Aucun utilisateur trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTable;
