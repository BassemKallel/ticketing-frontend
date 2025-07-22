import { useContext } from 'react';
import { AuthContext } from '../context/authContext'; // CORRECTION : Importation nommée et avec la bonne casse

// CORRECTION : On utilise "export const" (exportation nommée) au lieu de "export default".
export const useAuth = () => {
    return useContext(AuthContext);
};