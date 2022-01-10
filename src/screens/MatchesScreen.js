import React,{useEffect, useState} from 'react'
import {useNavigate } from 'react-router-dom';
import { useAuth, fireDb  } from '../context/AuthContext';
import { collection, getDocs, orderBy, query} from "firebase/firestore";
import { getDate } from '../utils/utils';

import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner';
import { Divider, Typography, List, ListItemText, ListItemAvatar, Avatar, ListItemButton, Stack, Box } from '@mui/material'
import './Matches.css'


function MatchesScreen() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true)
    const {currentUser} = useAuth();
    const [matchList, setMatchList] = useState([]);


    useEffect(()=>{
        async function fetchMatches(){
            const matchCollection = collection(fireDb, 'users', currentUser.uid, "matches");

            const q = query(matchCollection, orderBy("matchedAt", "desc"))
            await getDocs(q).then(snapshot=> setMatchList(snapshot.docs.map(doc =>{
                const docdata = doc.data();
                return {
                    ...docdata,
                    matchedAt: getDate(docdata.matchedAt) 
                }
            })))    

            setLoading(false);
        }
        fetchMatches();
    },[currentUser])

    return (
        <Box component="div" className='match-page'>
            <Navbar leftIcon="back" centerText="Matches"/>
            <Divider />
            <div className="match-section">
            {
                loading? 
                <Stack justifyContent="center" alignItems="center" sx={{height:"100%"}}>
                    <Spinner/>
                </Stack>
                :
                matchList.length > 0 ? (
                    <>
                        <Typography variant="subtitle1" component="div" sx={{px:2, py:1}}>
                            {`You have ${matchList.length} Matches`}
                        </Typography>
                        <Divider/>
                        <List disablePadding className='match-list'>
                            {matchList.map(matchedUser =>
                                <ListItemButton divider key={matchedUser.id} onClick={()=>navigate("/chat", {state:{chattingWith:matchedUser}})}>
                                    <ListItemAvatar>
                                        <Avatar src={matchedUser.photoURL}/>
                                    </ListItemAvatar>
                                    <ListItemText primary={matchedUser.displayName} secondary={`You matched on ${matchedUser.matchedAt}`}/>
                                </ListItemButton>
                            )}    
                        </List>
                    </>
                ) : (
                    <Stack justifyContent="center" alignItems="center" sx={{height:"100%"}}>
                        <Typography variant="body1" component="div" sx={{textAlign:"center"}}>
                            You haven't matched with anyone yet
                        </Typography>
                    </Stack>
                )
            }
            </div>
        </Box>
    )
}
export default MatchesScreen
