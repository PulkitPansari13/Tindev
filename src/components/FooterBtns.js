import React from 'react';

// import ReplayIcon from "@mui/icons-material/Replay";
import CloseIcon from "@mui/icons-material/Close";
// import StarRateIcon from "@mui/icons-material/StarRate";
import FavoriteIcon from "@mui/icons-material/Favorite";
// import FlashOnIcon from "@mui/icons-material/FlashOn";
import IconButton from "@mui/material/IconButton";
import './footerbtns.css'


const FooterBtns = ({swipeAction}) => {
    return (
        <div className='footer-btns'>
            {/* <IconButton className="repeatbtn">
                <ReplayIcon  />
            </IconButton> */}
            <IconButton className="leftbtn" onClick={()=>swipeAction('left')}>
                <CloseIcon fontSize="large" />
            </IconButton>
            {/* <IconButton className="starbtn">
                <StarRateIcon  />
            </IconButton> */}
            <IconButton className="rightbtn" onClick={()=>swipeAction('right')}>
                <FavoriteIcon fontSize="large" />
            </IconButton>
            {/* <IconButton className="lightningbtn">
                <FlashOnIcon  />
            </IconButton> */}
        </div>
    )
}

export default FooterBtns;
