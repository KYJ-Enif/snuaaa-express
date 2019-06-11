import express from 'express';

import { retrieveUser, updateLoginDate } from '../controllers/user.controller';

import { createToken, verifyTokenUseReq } from '../lib/token';

const router = express.Router();

/*
    GET /api/check
*/

router.get('/', (req, res) => {
    console.log(`[GET] ${req.baseUrl + req.url}`);

    let user = {};

    verifyTokenUseReq(req)
    .then(decodedToken => {
        return retrieveUser(decodedToken._id)
    })
    .then((userInfo) => {
        user = userInfo;
        return updateLoginDate(user.user_id)
    })
    .then(() => {
        return createToken({
            _id: user.user_id
        })
    })
    .then((token) => {
        return res.status(200).json({
            success: true,
            user_id: user.user_id,
            level: user.level,
            profile_path: user.profile_path,
            nickname: user.nickname,
            token 
        });
    })
    .catch(err => {
        console.error(err)
        return res.status(403).json({
            success: false,
            message: 'Token is not valid.'
        });
    })
})

export default router;
