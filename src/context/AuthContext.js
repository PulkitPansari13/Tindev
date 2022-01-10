import React, { useContext, useState, useEffect } from "react";
import { fireapp } from "../firebase";
import { getAuth, GithubAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, getDoc, doc, collection, getDocs, query, where} from "firebase/firestore"

const fireauth = getAuth(fireapp);
export const fireDb = getFirestore();
const userCollection = collection(fireDb, 'users')
const provider = new GithubAuthProvider();
const AuthContext = React.createContext()

// Fire store has a limit of 10 for "not in" query, so a query to 
// "get all users where the user have not already been swiped on by the logged in user" OR
// "get users where userid not in [..swiped userids]"
// doesn't work when the user has more than 10 swipes
//
//
// One solution could be to maintain a "NotSwipedBy" array for each user, 
// which would hold the ids of user who haven't swiped on them
// Then retrive results by following query
// "get users where "NotSwipedBY" array contains "loggedin UserID"
// But it has many downfalls 
// 1. When user signs up, for every other user add to their "NotSwipedBy" array the new user's id
// 2. If no. of users grow, 100s of thousands of user documents would have an array greater than atleast 10k ids
// 3. Each document has a limit of 1MB, it will probably be hit very solution
// 4. And obviously this would be very slow
//
// So here I am retriving all users and filtering the already swiped users on client side.
// Thats Terrible !!! Yes, but seem to find a proper solution and I think 
// this is a limitation from firestore side 
const allUserCache = new Map()
// local cache for Profile cards
const cacheProfileCards = new Map();
// do not keep fetchting if user hits reload icon if he has swiped through all users
let swipedAllUsers = false;


export function useAuth(){
  return useContext(AuthContext)
}

export function AuthProvider({children}){
  const [currentUser, setCurrentUser] = useState();
  const [userInfo, setUserInfo] = useState()

  // fetches profiles from firestore and caches them
  async function fetchCardsFromFireStore(){
    const currentUserId = currentUser.uid;
    const leftSwipesCollection = collection(fireDb, 'users', currentUserId, 'leftSwipes');
    const rightSwipesCollection = collection(fireDb, 'users', currentUserId, 'rightSwipes');

    const leftswipesIds = await getDocs(leftSwipesCollection).then(docsnapshot=>
      docsnapshot.docs.map(document =>document.id)
    )
    
    const rightswipesIds = await getDocs(rightSwipesCollection).then(docsnapshot=>
      docsnapshot.docs.map(document =>document.id)
    )
    const excludedUserIds = [...leftswipesIds, ...rightswipesIds]
    
    // let cardQuery;
    // if (excludedUserIds.length)
    //   cardQuery = query(userCollection, where('sex', '==', userInfo.sex === 'm'? 'f':'m' ), where('id', 'not-in', [...leftswipesIds, ...rightswipesIds]),  limit(25))
    // else
    //   cardQuery = query(userCollection, where('sex', '==', userInfo.sex === 'm'? 'f':'m' ), limit(25))
    // const querySnapshot = await getDocs(cardQuery)
    // querySnapshot.forEach((document) =>{
    //     cacheProfileCards.set(document.id,document.data())
    //   }
    // );

      const cardQuery = query(userCollection, where('sex', '==', userInfo.sex === 'm'? 'f':'m' ))
      const querySnapshot = await getDocs(cardQuery)
      querySnapshot.forEach(document=>{
        allUserCache.set(document.id, document.data())
      })
      excludedUserIds.forEach(excludedId=> allUserCache.delete(excludedId))
      if(allUserCache.size === 0){
        swipedAllUsers = true;
      }

  }

  function fillCacheProfileCards(){
    // at max show 15 cards to the user
    let maxlimit = Math.min(15, allUserCache.size);
    const allKeys = allUserCache.keys()
    while(maxlimit){
      const userkey = allKeys.next().value
      cacheProfileCards.set(userkey, allUserCache.get(userkey))
      maxlimit--;
    }
  }


  async function fetchCards(){
    if(!currentUser)
      return []
    else if(cacheProfileCards.size > 0){
      return Array.from(cacheProfileCards.values())
    }
    else if(allUserCache.size >0){
      fillCacheProfileCards()
      return Array.from(cacheProfileCards.values())
    }
    else if(!swipedAllUsers){
      await fetchCardsFromFireStore();
      fillCacheProfileCards()
      return Array.from(cacheProfileCards.values())
    }
    else{
      return []
    }
  }

  function deleteCardFromCache(userid){
    cacheProfileCards.delete(userid)
    allUserCache.delete(userid)
    if(allUserCache.size === 0){
      swipedAllUsers = true;
    }
  }

  // function gitlogin
  async function gitLogin(){
    await signInWithPopup(fireauth, provider)
    // .then((result) => {
    // // This gives you a GitHub Access Token. You can use it to access the GitHub API.
    // const credential = GithubAuthProvider.credentialFromResult(result);
    // const token = credential.accessToken;

    // // The signed-in user info.
    // const user = result.user;

    // console.log("token: ", token)
    // console.log("user info: ", user)
    // }).catch((error) => {
    // const errorCode = error.code;
    // const errorMessage = error.message;
    // // The email of the user's account used.
    // const email = error.email;
    // // The AuthCredential type that was used.
    // const credential = GithubAuthProvider.credentialFromError(error);
    // console.log("error msg: ", errorMessage)
    // });
  }

  async function logout(){
    cacheProfileCards.clear()
    swipedAllUsers = false;
    await signOut(fireauth)
  }

  useEffect(()=>{
  async function fetchuserinfo(currentUser){
    const docRef = doc(fireDb, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      setUserInfo(docSnap.data());
    } else {
      setUserInfo(null);
    }
  }
  
  if(currentUser){
    fetchuserinfo(currentUser)
  }
  else if(currentUser === null){
    setUserInfo(undefined)
  }
  },[currentUser])


  useEffect(() => {
    const unsubscribe = fireauth.onAuthStateChanged(user => {
      setCurrentUser(user)
      })
    return unsubscribe
  }, [])


  const value = {
    currentUser,
    userInfo,
    setUserInfo,
    gitLogin,
    logout,
    fetchCards,
    deleteCardFromCache,
  }
  return (
    <AuthContext.Provider value={value}>
      {/* {currentUser !== undefined && userInfo !== undefined && children} */}
      {currentUser !== undefined && children}
    </AuthContext.Provider>
  )
}