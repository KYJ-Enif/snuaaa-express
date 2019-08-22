import express from 'express';
import request from 'request';
import fs from 'fs';
import path from 'path';

const xmlParser = require('fast-xml-parser');
require('dotenv').config();

import { retrieveSoundBox, retrieveRecentPosts } from '../controllers/post.controller';
import { retrievePhotosInBoard } from '../controllers/photo.controller';
import { retrieveRecentComments } from '../controllers/comment.controller';

const router = express.Router();

router.get('/soundbox', (req, res) => {
    console.log(`[GET] ${req.baseUrl + req.url}`);
    retrieveSoundBox()
        .then((post) => {
            res.json(post)
        })
        .catch((err) => {
            console.error(err);
            res.status(401).json({
                error: 'Retrieve Soundbox fail'
            });
        })
})

router.get('/posts', (req, res) => {
    console.log(`[GET] ${req.baseUrl + req.url}`);
    retrieveRecentPosts()
        .then((posts) => {
            res.json(posts)
        })
        .catch((err) => {
            console.error(err);
            res.status(401).json({
                error: 'Retrieve Posts fail'
            });
        })
})

router.get('/memory', (req, res) => {
    console.log(`[GET] ${req.baseUrl + req.url}`);
    retrievePhotosInBoard('brd31', 9, 0)
        .then((photos) => {
            res.json(photos)
        })
        .catch((err) => {
            console.error(err);
            res.status(401).json({
                error: 'Retrieve Photos fail'
            });
        })
})

router.get('/astrophoto', (req, res) => {
    console.log(`[GET] ${req.baseUrl + req.url}`);
    retrievePhotosInBoard('brd32', 9, 0)
        .then((photos) => {
            res.json(photos)
        })
        .catch((err) => {
            console.error(err);
            res.status(401).json({
                error: 'Retrieve Photos fail'
            });
        })
})

router.get('/comments', (req, res) => {
    console.log(`[GET] ${req.baseUrl + req.url}`);
    retrieveRecentComments()
        .then((comments) => {
            res.json(comments)
        })
        .catch((err) => {
            console.error(err);
            res.status(401).json({
                error: 'Retrieve Comments fail'
            });
        })
})

router.get('/riseset', (req, res) => {
    console.log(`[GET] ${req.baseUrl + req.url}`);

    const today = new Date();
    let year = today.getFullYear().toString();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    let dayformat = `${year}${month}${day}`;

    try {
        if(!(fs.existsSync(path.join('.', 'riseset')))) {
            fs.mkdirSync(path.join('.', 'riseset'))
        }            
    } catch (err) {
        console.error(err)
    }

    try {
        const riseSetJsonPath = path.join('.', 'riseset', `${dayformat}.json`)

        if(fs.existsSync(riseSetJsonPath)) {
            let riseSetInfo = fs.readFileSync(riseSetJsonPath, 'utf8');
            res.json(JSON.parse(riseSetInfo))
        }
        else {
            let riseSetUrl = 'http://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getAreaRiseSetInfo';
            let riseSetQueryParams = '?' + encodeURIComponent('ServiceKey') + '=' + process.env.RISESET_SERVICE_KEY;
            riseSetQueryParams += '&' + encodeURIComponent('locdate') + '=' + encodeURIComponent(dayformat);
            riseSetQueryParams += '&' + encodeURIComponent('location') + '=' + encodeURIComponent('서울');
        
            request.get(riseSetUrl + riseSetQueryParams, (err, response, body) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        success: false,
                        code: 0
                    });
                }
                else if (!xmlParser.validate(body)) {
                    console.error('xml parse error');
                    res.status(500).json({
                        success: false,
                        code: 0
                    });
                }
                else {
                    let riseSetData = xmlParser.parse(body);
                    let riseSetItem = {};
                    if (riseSetData.response
                        && riseSetData.response.body
                        && riseSetData.response.body.items
                        && riseSetData.response.body.items.item) {
        
                        riseSetItem = riseSetData.response.body.items.item;
                    }
                    else {
                        console.error('api error');
                        res.status(500).json({
                            success: false,
                            code: 0
                        });
                    }

                    let moonPhaseUrl = 'http://apis.data.go.kr/B090041/openapi/service/LunPhInfoService/getLunPhInfo';
                    let moonPhaseQueryParams = '?' + encodeURIComponent('ServiceKey') + '=' + process.env.RISESET_SERVICE_KEY;
                    moonPhaseQueryParams += '&' + encodeURIComponent('solYear') + '=' + encodeURIComponent(year);
                    moonPhaseQueryParams += '&' + encodeURIComponent('solMonth') + '=' + encodeURIComponent(month);
                    moonPhaseQueryParams += '&' + encodeURIComponent('solDay') + '=' + encodeURIComponent(day);
                    
                    request.get(moonPhaseUrl + moonPhaseQueryParams, (err, response, body) => {
                        if (err) {
                            console.error(err);
                            res.status(500).json({
                                success: false,
                                code: 0
                            });
                        }
                        else if (!xmlParser.validate(body)) {
                            console.error('xml parse error');
                            res.status(500).json({
                                success: false,
                                code: 0
                            });
                        }
                        else {
                            let moonPhaseData = xmlParser.parse(body);
                            let moonPhaseItem = {};
                            if (moonPhaseData.response
                                && moonPhaseData.response.body
                                && moonPhaseData.response.body.items
                                && moonPhaseData.response.body.items.item) {
                
                                moonPhaseItem = moonPhaseData.response.body.items.item;
                            }
                            else {
                                console.error('api error');
                                res.status(500).json({
                                    success: false,
                                    code: 0
                                });
                            }
                            
                            const AstroInfo = {
                                sunrise: riseSetItem.sunrise,
                                sunset: riseSetItem.sunset,
                                moonrise: riseSetItem.moonrise,
                                moonset: riseSetItem.moonset,
                                astm: riseSetItem.astm,
                                aste: riseSetItem.aste,
                                lunAge: moonPhaseItem.lunAge
                            }
                            fs.writeFileSync(riseSetJsonPath, JSON.stringify(AstroInfo), 'utf8');
                            res.json(AstroInfo);
                        }
                    })
                }
            })
        }
    } catch (err) {
        console.error(err)
    }



    
})

export default router;