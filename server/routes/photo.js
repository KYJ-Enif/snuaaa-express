import express from 'express';

import { verifyTokenMiddleware } from '../middlewares/auth';

import { retrievePhoto, updatePhoto, deletePhoto, retrievePhotosInAlbum } from '../controllers/photo.controller';
import { checkLike } from '../controllers/contentLike.controller';
import { updateContent, deleteContent, increaseViewNum } from '../controllers/content.controller';
import { retrieveTagsOnBoard } from '../controllers/tag.controller';
import { retrieveTagsByContent, createContentTag, deleteContentTag } from '../controllers/contentTag.controller';

const router = express.Router();

router.get('/:photo_id', verifyTokenMiddleware, (req, res, next) => {
    console.log(`[GET] ${req.baseUrl + req.url}`);

    let photoInfo = {};
    let likeInfo = {};

    retrievePhoto(req.params.photo_id)
        .then((info) => {
            photoInfo = info;
            if (photoInfo.board.lv_read > req.decodedToken.level) {
                const err = {
                    status: 403,
                    code: 4001
                }
                next(err);
            }
            else {
                if (photoInfo.photo && photoInfo.photo.album_id) {
                    return Promise.all([
                        checkLike(req.params.photo_id, req.decodedToken._id),
                        retrieveTagsOnBoard(photoInfo.board_id),
                        retrievePhotosInAlbum(photoInfo.photo.album_id),
                        increaseViewNum(req.params.photo_id)
                    ])
                }
                else {
                    return Promise.all([
                        checkLike(req.params.photo_id, req.decodedToken._id),
                        retrieveTagsOnBoard(photoInfo.board_id),
                        increaseViewNum(req.params.photo_id)
                    ])
                }
            }
        })
        .then((infos) => {
            res.json({
                photoInfo: photoInfo,
                likeInfo: infos[0],
                boardTagInfo: infos[1],
                albumPhotosInfo: infos[2]
            })
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        })
})

router.patch('/:photo_id', verifyTokenMiddleware, (req, res) => {
    console.log(`[PATCH] ${req.baseUrl + req.url}`);

    try {
        const contentData = {
            title: req.body.title,
            text: req.body.text
        }
        const photoData = req.body.photo;
        const tagData = req.body.tags;
    
        Promise.all([
            retrieveTagsByContent(req.params.photo_id),
            updateContent(req.params.photo_id, contentData),
            updatePhoto(req.params.photo_id, photoData)
        ])
            .then((infos) => {
                const prevTags = infos[0].map(tag => tag.tag_id);
                const newTags = tagData.map(tag => tag.tag_id);
                const updateTag = [];
    
                if (prevTags && prevTags.length > 0) {
                    prevTags.forEach(tag => {
                        if (!newTags.includes(tag)) {
                            updateTag.concat(deleteContentTag(req.params.photo_id, tag));
                        }
                    });
                }
                if (newTags && newTags.length > 0) {
                    newTags.forEach(tag => {
                        if (!prevTags.includes(tag)) {
                            updateTag.concat(createContentTag(req.params.photo_id, tag));
                        }
                    })
                }
                return Promise.all(updateTag)
            })
            .then(() => {
                res.json({
                    success: true
                })
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({
                    error: 'internal server error',
                    code: 0
                });
            })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'internal server error',
            code: 0
        });
    }

})

router.delete('/:photo_id', verifyTokenMiddleware, (req, res) => {
    console.log(`[DELETE] ${req.baseUrl + req.url}`);
    deletePhoto(req.params.photo_id)
        .then(() => {
            return deleteContent(req.params.photo_id)
        })
        .then(() => {
            return res.json({ success: true });
        })
        .catch((err) => {
            console.error(err)
            res.status(500).json({
                error: 'internal server error',
                code: 0
            });
        })
})

export default router;