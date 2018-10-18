'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var Post = new Schema({
    post_no: Number,
    author_id: String,
    author_name: String,
    board_no: String,
    title: String,
    contents: String,
    created: { type: Date, default: Date.now }
});

exports.default = _mongoose2.default.model('post', Post);

/*** Schema TYPE ****
 * 
 * String
 * Number
 * Date
 * Buffer
 * Boolean
 * Mixed
 * Objectid
 * Array
 * 
 */