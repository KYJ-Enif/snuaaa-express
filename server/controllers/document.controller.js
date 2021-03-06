const models = require('../models');

exports.retrieveDocument = function (doc_id) {
    return new Promise((resolve, reject) => {
        if (!doc_id) {
            reject('id can not be null')
        }

        models.Content.findOne({
            include: [{
                model: models.Document,
                as: 'document',
                required: true,
            }, {
                model: models.User,
                required: true,
                attributes: ['user_id', 'nickname', 'introduction', 'profile_path']
            }, {
                model: models.AttachedFile,
                as: 'attachedFiles',
                separate: true
            }],
            where: { content_id: doc_id }
        })
            .then((docInfo) => {
                resolve(docInfo)
            })
            .catch((err) => {
                reject(err);
            })
    })
}

exports.retrieveDocumentCount = function (category_id, generation) {
    return new Promise((resolve, reject) => {

        let contentCondition = {};
        let docCondition = {};
        category_id && (contentCondition.category_id = category_id);
        generation && (docCondition.generation = generation);

        models.Document.count({
            include: [{
                model: models.Content,
                as: 'content',
                required: true,
                include: [{
                    model: models.User,
                    required: true,
                    attributes: ['nickname']
                }, {
                    model: models.Category,
                    required: true,
                    attributes: ['category_name']
                }],
                where: contentCondition
            }],
            where: docCondition,
        })
            .then((count) => {
                resolve(count)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

exports.retrieveDocuments = function (rowNum, offset, category_id, generation) {
    return new Promise((resolve, reject) => {

        let contentCondition = {};
        let docCondition = {};
        category_id && (contentCondition.category_id = category_id);
        generation && (docCondition.generation = generation);

        models.Document.findAll({
            include: [{
                model: models.Content,
                as: 'content',
                required: true,
                attributes: ['content_id', 'title', 'text'],
                include: [{
                    model: models.User,
                    required: true,
                    attributes: ['nickname']
                }, {
                    model: models.Category,
                    required: true,
                    attributes: ['category_name']
                }, {
                    model: models.AttachedFile,
                    as: 'attachedFiles',
                    separate: true
                }],
                where: contentCondition
            }],
            attributes: ['content_id', 'generation'],
            where: docCondition,
            limit: rowNum,
            offset: offset,
            order: [
                [{
                    model: models.Content,
                    as: 'content'
                },
                    'updated_at', 'DESC'
                ]
            ]
        })
            .then((docInfo) => {
                resolve(docInfo)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

exports.createDocument = function (data) {
    return new Promise((resolve, reject) => {

        models.Content.create({
            content_uuid: data.content_uuid,
            author_id: data.author_id,
            board_id: data.board_id,
            category_id: data.category_id,
            title: data.title,
            text: data.text,
            type: data.type,
            document: {
                generation: data.generation
            }
        }, {
            include: [{
                model: models.Document,
                as: 'document',
            }]
        })
            .then((content) => {
                resolve(content.dataValues.content_id);
            })
            .catch((err) => {
                reject(err);
            })
    })
}

exports.deleteDocument = function (doc_id) {
    return new Promise((resolve, reject) => {

        if (!doc_id) {
            reject('id can not be null')
        }
        else {
            models.Document.destroy({
                where: {
                    content_id: doc_id
                }
            })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                })
        }
    })
}