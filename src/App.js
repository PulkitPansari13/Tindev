import './App.css';
import React from 'react';
import { useState, useEffect} from 'react';
import { useAuth } from "./context/AuthContext";
import SigninScreen from './screens/SigninScreen';
import MainAppScreen from './screens/MainAppScreen'
import OnboardScreen from './screens/OnboardScreen';
import Spinner from './components/Spinner';
import { Stack } from '@mui/material';


function App() {
  const {currentUser, userInfo} = useAuth();
  const [loading, setLoading] = useState(true)


  useEffect(()=>{
     if(userInfo || userInfo !== undefined){
       setLoading(false);
     } 
  }, [userInfo])


  if(! currentUser){
    return <SigninScreen/>
  }

  return (
    <>
      {loading? 
      <Stack justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
        <Spinner/>
      </Stack>
      :
        (userInfo != null && userInfo !== undefined ? <MainAppScreen />: <OnboardScreen/>)
      }
    </>
  );
}

export default App;
