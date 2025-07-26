import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
const AttachmentMessage = ({ attachment, currentUser, onDelete }) => {
    if (!attachment || !attachment.auteur) return null;
    const isCurrentUser = attachment.auteur.id === currentUser?.id;

    return (
        <div className={`flex gap-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {!isCurrentUser && (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                    {attachment.auteur.name.charAt(0)}
                </div>
            )}
            <div className={`w-full max-w-lg p-4 rounded-lg ${isCurrentUser ? 'bg-[#F28C38] text-white' : 'bg-gray-100'}`}>
                <div className={`flex items-baseline space-x-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                    <p className="font-bold">{attachment.auteur.name}</p>
                    <p className={`text-xs ${isCurrentUser ? 'text-orange-200' : 'text-gray-500'}`}>{new Date(attachment.created_at).toLocaleTimeString()}</p>
                </div>
                <div className="mt-2 group relative">
                    <a href={`http://127.0.0.1:8000/storage/${attachment.chemin}`} target="_blank" rel="noopener noreferrer"
                        className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${isCurrentUser ? 'bg-orange-200 border-orange-100' : 'bg-gray-200 border-gray-300'}`}>
                        <PaperClipIcon className={`h-4 w-4 mr-2 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`} />
                        {attachment.nom_fichier}
                    </a>
                    {(currentUser?.id === attachment.user_id || currentUser?.role === 'admin') && (
                        <button onClick={() => onDelete(attachment.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <XMarkIcon className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>
            {isCurrentUser && (
                <div className="h-10 w-10 rounded-full bg-[#F28C38] flex-shrink-0 flex items-center justify-center font-bold text-white">
                    {attachment.auteur.name.charAt(0)}
                </div>
            )}
        </div>
    );
};

export default AttachmentMessage;