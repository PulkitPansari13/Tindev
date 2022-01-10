import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, fireDb } from '../context/AuthContext';
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

import Navbar from '../components/Navbar';
import MatchModal from '../components/MatchModal';
import FooterBtns from '../components/FooterBtns';
import Spinner from '../components/Spinner';
import TinderCard from 'react-tinder-card'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CachedIcon from '@mui/icons-material/Cached';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { IconButton, Stack, Typography } from '@mui/material';
import './MainAppScreen.css'


function MainAppScreen() {
  const {currentUser, userInfo, fetchCards, deleteCardFromCache} = useAuth();
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();
  const [cardData, setCardData] = useState([])
  const [currentIndex, setCurrentIndex] = useState(cardData.length - 1);
  const [modalData, setModalData] = useState({open:false})
  const currentIndexRef = useRef(currentIndex)

  useEffect(()=>{
    loadCards()
    
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCards(){
    setLoading(true);
    const dataArray = await fetchCards();
    setCardData(dataArray)
    setCurrentIndex(dataArray.length -1 )
    currentIndexRef.current = dataArray.length -1
    setLoading(false);
  }

  function modalClose(){
    setModalData({open:false})
  }
  
  async function handleLeftSwipe(swipedIndex, swipedUserId){
    await setDoc(doc(fireDb, "users", currentUser.uid, "leftSwipes", swipedUserId), {})
  }

  async function handleRightSwipe(swipedIndex ,swipedUserId){
    const swipedUser = cardData[swipedIndex];
    const currentUserId = currentUser.uid;
    setDoc(doc(fireDb, "users", currentUserId, "rightSwipes", swipedUserId), {})
    
    getDoc(doc(fireDb, "users", swipedUserId, "rightSwipes", currentUserId)).then(docsnapshot=>{
      if(docsnapshot.exists()){
        // ther is a Match !!
        setDoc(doc(fireDb, "users", currentUserId, "matches", swipedUserId),{
          matchedAt: serverTimestamp(),
          ...swipedUser
        })
        setDoc(doc(fireDb, "users", swipedUserId, "matches", currentUserId),{
          matchedAt: serverTimestamp(),
          ...userInfo
        })
        
        setModalData({
          open: true,
          userPhotoURL: userInfo.photoURL,
          matchedPhotoURL: swipedUser.photoURL,
          matchedName: swipedUser.displayName,
          userName: currentUserId,
          buttonAction: ()=>{navigate("/chat", {state:{chattingWith:swipedUser}})},
          closeAction: modalClose
        })

      }
    })
  }

  const childRefs = useMemo(() =>
      Array(cardData.length)
      .fill(0)
      .map((i) => React.createRef()), [cardData]  
  )

  const updateCurrentIndex = (val) => {
      setCurrentIndex(val)
      currentIndexRef.current = val
  }

  const canSwipe = currentIndex >= 0

  // set last direction and decrease current index

  const swipe = (dir) => {
      if (canSwipe && currentIndex < cardData.length) {
      childRefs[currentIndex].current.swipe(dir) // Swipe the card!
      }
  }

  const onSwipe = (direction, index, swipedUserId) => {

    if(direction === 'up' || direction === 'down'){
      return
    }

    if(direction === 'left'){
      deleteCardFromCache(swipedUserId)
      handleLeftSwipe(index, swipedUserId)
    }  
    if(direction === 'right'){
      deleteCardFromCache(swipedUserId)
      handleRightSwipe(index, swipedUserId)
    }
    updateCurrentIndex(index - 1)
  }


  return (
      <div>
         {modalData.open && <MatchModal {...modalData} />}
          <Navbar leftIcon="profile" rightIcon="matches"/>
          <div className='card-section'>
              {
                loading ? <Spinner/>
                :
                (
                  <div className="card-container">
                  {
                    canSwipe ?
                    cardData.map((data,index) => {                    
                    return (
                    <TinderCard ref={childRefs[index]} preventSwipe={['up', 'down']} onSwipe={(dir)=>onSwipe(dir,index, data.id)} key={data.id} className='swipe-card'>
                      <div style={{backgroundImage: `url(${data.photoURL})`}} className="profile-card">
                          <div className='profile-info'>
                          <p className='profile-name'><span>{data.displayName}</span>, <span>{data.age}</span></p>
                          <p className='profile-work'><BusinessCenterIcon className='card-icon'/> {data.job}</p>
                          <p className='profile-location'><LocationOnIcon className='card-icon'/> {data.location}</p>
                          </div>
                      </div>  
                    </TinderCard>
                    )})
                    :
                    (
                      <Stack justifyContent="center" alignItems="center" sx={{height:"100%", textAlign:"center"}}>
                        <Typography sx={{fontSize:"1.1rem"}}>
                          Woahh 😲 You have swiped so many users!!
                        </Typography>
                        <Typography sx={{fontSize:"1.1rem"}}>
                          Do you also code this fast ?
                        </Typography>
                        <IconButton onClick={()=>loadCards()}>
                          <CachedIcon fontSize="large" sx={{color:"black"}}/>
                        </IconButton>
                      </Stack>
                    )
                  }
                  </div>
              ) 
              }
          </div>
          <FooterBtns swipeAction={swipe}/>            
      </div>
  )
}

export default MainAppScreen
