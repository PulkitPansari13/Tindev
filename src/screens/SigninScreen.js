import React from 'react'
import { useAuth } from "../context/AuthContext";
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import "./signin.css"
import Tindev_logo from "../tindev_terminal.svg"

function SigninScreen() {

    const {gitLogin} = useAuth();

    return (
        <div className='signin-container'>
            <div className='logo-container'>
                <img src={Tindev_logo} alt='tindev-logo'/>
                <Typography variant='h6' className='tagline'>
                    Dating For DEVs, by a Dev.
                </Typography>
            </div>
            <Button variant="contained" size="medium" color='primary' startIcon={<GitHubIcon/>} onClick={()=> gitLogin()}>
                Login with GitHub
            </Button>
        </div>
    )
}

export default SigninScreen
