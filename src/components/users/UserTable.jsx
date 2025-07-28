import React from 'react';
import UserTableRow from './UserTableRow';

const UserTable = ({ users, currentUser, onViewUser, onEditUser, onDeleteUser }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50">
                    <tr className="text-gray-600 uppercase text-sm">
                        <th className="px-6 py-4 font-semibold">Utilisateur</th>
                        <th className="px-6 py-4 font-semibold">Rôle</th>
                        <th className="px-6 py-4 font-semibold">Date de création</th>
                        <th className="px-6 py-4 font-semibold text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-200">
                    {users.map(user => (
                        <UserTableRow
                            key={user.id}
                            user={user}
                            currentUser={currentUser}
                            onView={onViewUser}
                            onEdit={onEditUser}
                            onDelete={onDeleteUser}
                        />
                    ))}
                </tbody>
            </table>
        </div>
        {users.length === 0 && (
            <div className="text-center p-16 text-gray-500">
                <h3 className="text-2xl font-semibold">Aucun utilisateur trouvé</h3>
                <p className="mt-2">La liste des utilisateurs est vide pour le moment.</p>
            </div>
        )}
    </div>
);

export default UserTable;
