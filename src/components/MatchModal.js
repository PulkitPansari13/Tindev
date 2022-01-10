import React from 'react';
import { Typography, Avatar, Button, IconButton } from '@mui/material';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import CloseIcon from '@mui/icons-material/Close';
import './matchModal.css'

function MatchModal({open, matchedPhotoURL, userPhotoURL, matchedName, closeAction, buttonAction}) {

  if(!open){
    return null;
  }
  return (
    <div className='match-modal-backdrop'>
      <div className='match-modal'>
        <IconButton  disableRipple  className='cancle-btn' onClick={()=>closeAction()}>
          <CloseIcon fontSize="large"/>
        </IconButton>
        <Typography className="match-title">
          It's A Match
        </Typography>
        <Typography variant='subtitle1' className='match-subtitle'>
          Now <Typography variant='h5' component="span">You</Typography> {'&'} <Typography variant='h5' component="span">{matchedName}</Typography> can code along !!
        </Typography>
        <div className='match-photos'>
          <Avatar sx={{height:95, width:95}} src={userPhotoURL} />
          <CodeOutlinedIcon sx={{fontSize:65}} />
          <Avatar sx={{height:95, width:95}} src={matchedPhotoURL} />
        </div>
        <div className='chat-btn-container'>
          <Button variant="contained" size="large" className="chat-btn" onClick={()=>buttonAction()}>
            {/* Start a chat */}
            Send a Message
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MatchModal
