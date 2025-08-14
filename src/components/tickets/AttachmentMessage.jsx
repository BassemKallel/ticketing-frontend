import React, { useState } from 'react';
import { PaperClipIcon, TrashIcon, ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import apiClient from '../../services/apiClient'; // Assurez-vous que apiClient est importé
import { toast } from 'react-toastify'; // Assurez-vous que toast est importé

const AttachmentMessage = ({ attachment, currentUser, onDeleteRequest }) => {
    // 1. Définir l'état pour suivre le téléchargement
    const [isDownloading, setIsDownloading] = useState(false);

    if (!attachment || !attachment.auteur) return null;

    const isCurrentUser = String(attachment.auteur.id) === String(currentUser.id);
    const isTeamMember = ['admin', 'agent'].includes(attachment.auteur.role);
    const canDelete = isCurrentUser || currentUser.role === 'admin';
    const formattedDate = attachment.created_at ? new Date(attachment.created_at).toLocaleString() : 'Date invalide';
    const currentUserIsTeamMember = ['admin', 'agent'].includes(currentUser.role);
    const isRightAligned = isCurrentUser || (currentUserIsTeamMember && isTeamMember);

    // 2. La logique de téléchargement sécurisé
    const handleDownload = async (e) => {
        e.preventDefault(); // Empêche le navigateur de suivre le lien href
        setIsDownloading(true);

        const downloadUrl = `/pieces-jointes/${attachment.id}/download`;

        try {
            // Utilise apiClient (axios) pour faire une requête authentifiée
            const response = await apiClient.get(downloadUrl, {
                responseType: 'blob', // Important: on attend un fichier
            });

            // Crée une URL temporaire pour le fichier reçu
            const url = window.URL.createObjectURL(new Blob([response.data]));
            
            // Crée un lien <a> caché pour lancer le téléchargement
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', attachment.nom_fichier); // Donne le nom de fichier original
            
            document.body.appendChild(link);
            link.click(); // Simule le clic pour télécharger
            
            // Nettoyage
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Erreur de téléchargement:", error);
            toast.error("Le téléchargement a échoué. Vous n'avez peut-être pas les droits.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className={`group flex w-full max-w-lg items-start gap-3 ${isRightAligned ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
            {!isRightAligned && (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                    {attachment.auteur.name?.charAt(0) || '?'}
                </div>
            )}

            <div className={`relative w-full rounded-lg p-3 ${isRightAligned ? 'bg-[#F28C38] text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div className="flex items-baseline gap-2 text-xs mb-2">
                    <p className="font-bold">{attachment.auteur.name}</p>
                    <p className={`${isRightAligned ? 'text-orange-100' : 'text-gray-500'}`}>{formattedDate}</p>
                </div>
                
                {/* 3. Le lien a été corrigé pour appeler handleDownload au clic */}
                <a
                    href={`/pieces-jointes/${attachment.id}/download`} // href symbolique
                    onClick={handleDownload} // La logique est ici
                    title={`Télécharger ${attachment.nom_fichier}`}
                    className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                        isRightAligned ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                    {isDownloading ? (
                        <ArrowPathIcon className={`h-6 w-6 flex-shrink-0 animate-spin ${isRightAligned ? 'text-white' : 'text-gray-600'}`} />
                    ) : (
                        <ArrowDownTrayIcon className={`h-6 w-6 flex-shrink-0 ${isRightAligned ? 'text-white' : 'text-gray-600'}`} />
                    )}

                    <div className="flex-grow text-left">
                        <p className={`text-sm font-medium break-all ${isRightAligned ? 'text-white' : 'text-gray-800'}`}>
                            {attachment.nom_fichier}
                        </p>
                        <p className={`text-xs ${isRightAligned ? 'text-orange-100' : 'text-gray-500'}`}>
                            {attachment.taille ? `${(attachment.taille / 1024).toFixed(1)} KB` : ''}
                        </p>
                    </div>
                </a>

                {canDelete && (
                    <button
                        onClick={() => onDeleteRequest('pièce jointe', attachment.id)}
                        title="Supprimer cette pièce jointe"
                        className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isRightAligned ? 'text-orange-100 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
            {isRightAligned && (
                <div className="h-8 w-8 rounded-full bg-orange-400 flex-shrink-0 flex items-center justify-center font-bold text-white">
                    {attachment.auteur.name?.charAt(0) || '?'}
                </div>
            )}
        </div>
    );
};

export default AttachmentMessage;
