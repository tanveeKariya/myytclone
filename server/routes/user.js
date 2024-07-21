import express from 'express'

import {login} from '../controllers/auth.js'
import {updateChanelData,getAllChanels} from '../controllers/chanel.js'
import { updateUserPoints , getPoints} from '../controllers/userpoints.js';


const routes = express.Router();

routes.post('/login',login)
routes.patch('/update/:id',updateChanelData)
routes.get('/getAllChanels',getAllChanels)
routes.patch('/updatePoints/:userId', updateUserPoints);
routes.get('/getpoints/:userId',getPoints);

export default routes;