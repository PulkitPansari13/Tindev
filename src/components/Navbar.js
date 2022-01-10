import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Typography from '@mui/material/Typography';
import IconButton from "@mui/material/IconButton";
import { Menu, MenuItem } from '@mui/material';
import "./navbar.css"
import Tindev_logo from "../tindev_terminal.svg"


const Navbar = (props) => {
  const {logout} = useAuth();
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  function handleProfileClick(event){
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose(){
    setAnchorEl(null);
  }

  let leftIcon 
  if(props.leftIcon === 'back'){
    leftIcon = 
        <IconButton edge="start" onClick={()=>navigate("/")}>
            <ArrowBackIosNewRoundedIcon />
        </IconButton>
  }
  else{
    leftIcon =
    (
      <>
        <IconButton onClick={handleProfileClick}>
          <AccountCircleIcon fontSize="large"/>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={()=>logout()}>
            <LogoutRoundedIcon/> Logout
          </MenuItem>
        </Menu>
      </>
    )
  }
  return (
    <nav className="navbar">
      {leftIcon}
      {props.centerText? 
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, textAlign: 'center'}}>
              {props.centerText}
          </Typography>
          : 
          <img src={Tindev_logo} alt="tindev" className="nav_logo"/>
      }
      {props.rightIcon &&
              <IconButton onClick={()=> navigate("/matches")}>
                  <ForumRoundedIcon fontSize="large"/>
              </IconButton>
      }
    </nav>

  )
}

export default Navbar
