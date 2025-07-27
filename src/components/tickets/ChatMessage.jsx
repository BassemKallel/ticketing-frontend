import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

const ChatMessage = ({ message, currentUser, agents, onDeleteRequest }) => {
    if (!message || !message.auteur) return null;

    // --- Logique d'affichage et de permissions ---
    const isCurrentUser = String(message.auteur.id) === String(currentUser.id);
    const isDeletable = !message.id.toString().startsWith('desc-');
    const canDelete = isDeletable && (isCurrentUser || currentUser.role === 'admin');

    return (
        <div className={`group flex w-full max-w-lg items-start gap-3 ${isCurrentUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
            {/* Avatar pour les autres utilisateurs */}
            {!isCurrentUser && (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                    {message.auteur.name?.charAt(0) || '?'}
                </div>
            )}

            {/* Bulle de message */}
            <div className={`relative w-full rounded-lg p-3 ${isCurrentUser ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div className="flex items-baseline gap-2 text-xs mb-1">
                    <p className="font-bold">{message.auteur.name}</p>
                    <p className={`${isCurrentUser ? 'text-orange-200' : 'text-gray-500'}`}>{new Date(message.created_at).toLocaleString()}</p>
                </div>

                <p className="whitespace-pre-wrap text-sm">{message.contenu}</p>

                {/* Bouton de suppression */}
                {canDelete && (
                    <button
                        onClick={() => onDeleteRequest('commentaire', message.id)}
                        title="Supprimer ce commentaire"
                        className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isCurrentUser ? 'text-orange-100 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Avatar pour l'utilisateur courant */}
            {isCurrentUser && (
                <div className="h-8 w-8 rounded-full bg-orange-400 flex-shrink-0 flex items-center justify-center font-bold text-white">
                    {message.auteur.name?.charAt(0) || '?'}
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
