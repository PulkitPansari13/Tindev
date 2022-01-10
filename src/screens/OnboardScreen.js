import React, {useState} from 'react'
import {useAuth, fireDb} from '../context/AuthContext';
import { setDoc, doc, writeBatch} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";
import TextField from '@mui/material/TextField';
import { Box, Typography, MenuItem, IconButton, Input, Stack, Fab } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// import AddCircleIcon from '@mui/icons-material/AddCircle';
import './Onboard.css'

const fireStorage = getStorage();

function OnboardScreen() {
    const { currentUser, setUserInfo } = useAuth();
    const [fullname, setFullname] = useState(currentUser.displayName);
    // const [fullname, setFullname] = useState("Dummy Name");
    const [age, setAge] = useState("");
    const [sex, setSex] = useState("");
    const [location, setLocation] = useState("");
    const [job, setJob] = useState("");
    const [bio, setBio] = useState("");
    const [photo, setPhoto] = useState(null);

    // 3 Steps -> 1. basic info 2. Work/study 3. Photo
    const [formStep, setFormStep] = useState(0);


    async function onboardUser(photoURL){
        const data = {
            id: currentUser.uid,
            displayName: fullname,
            age: parseInt(age),
            sex,
            location,
            job,
            bio,
            photoURL
        }

        setDoc(doc(fireDb, "users", currentUser.uid), data)

        
        // set 10 fakeswipes for user to see a match
        const fakeUserGender = sex==='m'? 'Female' : 'Male';
        const batch = writeBatch(fireDb);
        for (let i = 1; i <= 10; i++) {
            const fakeUserId = `test${fakeUserGender}User${i}`;
            batch.set(doc(fireDb, "users", fakeUserId, "rightSwipes", currentUser.uid), {})
        }
        
        await batch.commit()
        
        setUserInfo(data);

    }

    function handleAgeInput(e){
        const ageval = parseInt(e.target.value)
        if(isNaN(ageval) || ageval <1){
            setAge("")
        }
        else if(ageval > 110){
            return
        }
        else{
            setAge(ageval)
        }
    }

    function handlePhotoInput(e){
        const file = e.target.files[0]
        setPhoto(file)
    }

    function handleBackStep(e){
        setFormStep(prev => Math.max(0,(prev-1)))
    }

    function handleNextStep(e){
        e.preventDefault();
        // handle submit on last step.
        if(formStep === 2){
            if(!photo){
                return
            }
            const photoref = ref(fireStorage, photo.name)
            uploadBytes(photoref, photo).then(snapshot => {
                return getDownloadURL(snapshot.ref)
            }).then(downloadurl =>{  
                onboardUser(downloadurl)
            })
            // photoref.put(photo)
            // photoref.getDownloadURL()

        }
        else{
            setFormStep(prev => (prev+1)%3)
        }
    }

    const formStepArray = [
        {
            formTitle: "Set Up your profile",
            currentFormFields: ( 
                <>
                    <Box className='contain-field'>
                        <TextField variant="filled" fullWidth label="Full Name" required value={fullname} onChange={(e)=>setFullname(e.target.value)}/>
                    </Box>
                    <Box className='contain-field'
                        sx={{
                            display:"flex",
                            justifyContent:"space-between" 
                        }}
                    >
                        <TextField variant="filled" label="Age" required value={age} onChange={handleAgeInput} 
                            type="text"
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            sx={{width:'48%'}}

                        />
                        <TextField variant="filled" label="Sex" select required value={sex} onChange={(e)=>setSex(e.target.value)} 
                            sx={{width:'48%'}}
                        >
                             <MenuItem key="M" value="m">
                                Male
                            </MenuItem>
                             <MenuItem key="F" value="f">
                                Female
                            </MenuItem>
                        </TextField>
                    </Box >
                    <Box className='contain-field'>
                        <TextField variant="filled" fullWidth label="Location" required value={location} onChange={(e)=>setLocation(e.target.value)} placeholder='Mumbai, India'/>
                    </Box>
                </>
            )
        },
        {
            formTitle: "Tell us about yourself",
            currentFormFields: (
                <>
                    <Box className='contain-field'>
                        <TextField variant="filled" required fullWidth label="Work/Study" placeholder='SDE II at Amazon' value={job} onChange={(e)=>setJob(e.target.value)}/>
                    </Box>
                    <Box className="contain-field">
                        <TextField variant="filled" required fullWidth multiline minRows={5} label='Bio' value={bio} onChange={(e)=>setBio(e.target.value)}/>
                    </Box>
                </>
            )
        },
        {
            formTitle: "Photo ?",
            currentFormFields: (
                <Stack justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
                    <label htmlFor="icon-button-file" className='upload-label'>
                        {/* <Input accept="image/*" id="icon-button-file" type="file" sx={{display:"none"}} required /> */}
                        <Input accept="image/*" id="icon-button-file" type="file" required onChange={handlePhotoInput}/>
                        <IconButton component="span" aria-label="upload picture">
                            <AccountCircleIcon sx={{ fontSize: 55 }}/>
                        </IconButton>
                        {/* <AddCircleIcon className='upload-add-icon'/> */}
                    </label>
                </Stack>
            )
        }
    ]


    return (
        <div className='onboard-page'>
            <Typography variant='h4' className='form-step-title' textAlign="center">
                {formStepArray[formStep].formTitle}
            </Typography>
            <Box component="form" className='onboard-form' onSubmit={handleNextStep}>
                <Box sx ={{
                    '&':{flexGrow:1},
                    '& .contain-field':{mx:1, mb:2}
                }}> 
                    {formStepArray[formStep].currentFormFields}
                </Box>
                <Box className='onboard-form-btn-conatiner'>
                    <Fab type="submit" size="large" variant="extended" color="primary" >
                        {formStep ===2 ? 'Submit' : 'Next'}
                    </Fab>
                    {formStep > 0 && 
                        <Fab variant='extended' size="large" onClick={handleBackStep} color="primary">
                            Back
                        </Fab>
                    }
                </Box>
            </Box>
        </div>
    )
}

export default OnboardScreen
