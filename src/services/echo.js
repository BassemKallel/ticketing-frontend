import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import apiClient from './apiClient'; // On importe apiClient pour l'intercepteur

// On expose Pusher à la fenêtre globale, ce qui est requis par Laravel Echo.
window.Pusher = Pusher;

const options = {
    broadcaster: 'pusher',
    // Remplacez les valeurs ci-dessous par celles de votre fichier .env du backend
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    // L'endpoint d'authentification pour les canaux privés sur votre backend Laravel
    authEndpoint: `${import.meta.env.VITE_API_BASE_URL}/broadcasting/auth`,
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                apiClient.post('/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
};

const echo = new Echo(options);

export default echo;
