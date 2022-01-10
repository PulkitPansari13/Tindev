import React, {useMemo, useEffect, useState} from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth, fireDb } from '../context/AuthContext';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getChatKey } from '../utils/utils'

import { Box, ListItem, ListItemAvatar, ListItemText, Avatar, Fab } from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';

import './ChatScreen.css' 

function ChatScreen() {
  const {currentUser} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  let chattingWith;
  if(location.state && location.state.chattingWith)
    chattingWith = location.state.chattingWith
  else
    chattingWith = {}
  // const chattingWith = location.state? location.state.chattingWith? : {}
  const [message, setMessage] = useState("")
  const [messageList, setMessageList] = useState([])
  
  
  const otherUserId = chattingWith.id;
  const currentUserId = currentUser.uid;
  const chatKey = useMemo(() => getChatKey(currentUserId, otherUserId), [currentUserId, otherUserId])
  
  useEffect(()=>{
    function fetchMessages(chatKey){
      const unsub = onSnapshot(
        query(
          collection(fireDb, "userChats", chatKey, "messages"), 
          orderBy("sendAt", "desc")
          ), snapshot => {
            setMessageList(snapshot.docs.map(doc=>({
              id:doc.id,
              ...doc.data()
            })))
          }
          );
      return unsub;
    }
        
    if(currentUserId && otherUserId){
      return fetchMessages(chatKey)
    }
  }, [chatKey, currentUserId, otherUserId])
      
      
  // if user directly access the url, redirect him to /matches
  if(Object.keys(chattingWith).length === 0){
    return <Navigate to="/matches" replace={true}/>
  }

  function sendMessage(e){
    e.preventDefault();
    const trimedmsg = message.trim()
    if(!trimedmsg)
      return
    const messageCollection = collection(fireDb, "userChats", chatKey, "messages")
    addDoc(messageCollection, {
      senderId: currentUserId,
      message: trimedmsg,
      sendAt: serverTimestamp()
    })

    setMessage("")
  }

  return (
    <div className='chat-page'>
      <ListItem divider component="div">
          <IconButton edge="start" onClick={()=>navigate(-1)}>
            <ArrowBackIosNewRoundedIcon/>
          </IconButton>
          <ListItemAvatar>
              <Avatar src={chattingWith.photoURL} sizes='large'/>
          </ListItemAvatar>
          <ListItemText primary={chattingWith.displayName} secondary={chattingWith.job}/>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
      </ListItem>
      <div className='message-section'>
        {
          messageList.map((msg)=>(
            <div key={msg.id} className={`message ${msg.senderId === currentUserId? 'current-user-text': 'other-user-text'}`}>{msg.message}</div>
          ))
        }
      </div>
      <Box component="form" className="message-form" onSubmit={sendMessage}> 
        <input className='message-input' type="text" placeholder='Message' required value={message} onChange={(e)=>setMessage(e.target.value)}/>
        <Fab className='sendbtn' type='submit'>
          <SendOutlinedIcon className='send-icon'/>
        </Fab>
      </Box>
    </div>
  )
}

export default ChatScreen
