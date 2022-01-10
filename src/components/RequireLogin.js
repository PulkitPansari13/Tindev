import React from 'react'
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'

function RequireLogin({children}) {
    const {currentUser} = useAuth();

    if(!currentUser){
        return <Navigate to="/" />
    }
    return children;
}

export default RequireLogin
