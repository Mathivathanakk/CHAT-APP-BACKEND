import express from 'express';
import { registerUser,checkEmail,checkPassword,userDetails,logoutUser,updateUserDetails,searchUser} from '../Controllers/userController.js';




const router=express.Router()

//registering the user
router.post('/register',registerUser)
//checking the email
router.post('/email',checkEmail)
//checking the password
router.post('/password',checkPassword)
//login user details
router.get('/user-details',userDetails)
//logout user
router.get('/logout',logoutUser)
//updating the user
router.post('/update-user',updateUserDetails)
//searching the user
router.post('/search-user',searchUser)


export default router;