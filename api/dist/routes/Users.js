"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Image = __importStar(require("./_utils/Image"));
const Home_1 = require("./apps/Home");
const Users = express_1.default.Router();
const db = require('../../db/models');
const bcrypt = require('bcryptjs');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
function sendProfilePicture(req, res, asFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let img = yield db.Image.findOne({ where: { id: req.user.ImageId } });
        if (!img)
            return res.status(404).json({
                title: 'picture.notFound',
                msg: 'picture.notFound',
            });
        if (asFile)
            res.sendFile(img.filePath);
        else
            res.json({ url: img.url });
    });
}
// ########################################################
// ######################### GET ##########################
// ########################################################
Users.get('/current/picture', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield sendProfilePicture(req, res, true);
    }
    catch (error) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
Users.get('/current/picture/url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield sendProfilePicture(req, res, false);
    }
    catch (error) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################### PUT ##########################
// ########################################################
// Upload a new profile picture.
Users.put('/current/picture', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const oldImgId = req.user.ImageId;
        const result = yield Image.save(req, 'profiles');
        if (!result.success)
            return res.status(500).json(result);
        yield req.user.setImage(result.image);
        if (oldImgId)
            yield Image.remove(oldImgId, true);
        res.json({ title: 'picture.updated', msg: 'user.imageUpdated' });
    }
    catch (error) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################### POST #########################
// ########################################################
// Register a new user.
Users.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { email, firstname, lastname, phone } = req.body;
        if (!(email && firstname && lastname && phone && req.body.password))
            return res
                .status(500)
                .json({ title: 'request.missingField', msg: 'request.missingField' });
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(req.body.password, salt);
        const user = yield db.User.create({
            email,
            password,
            firstname,
            lastname,
            phone,
        });
        if (user) {
            // TODO: Send verification email
            return res.json({
                title: 'register.success',
                msg: 'register.success',
            });
        }
        /* istanbul ignore next */
        res.status(500).json({
            title: 'request.error',
            msg: 'request.error',
        });
    }
    catch (e) {
        res.status(500).json({
            title: ((_a = e.errors) === null || _a === void 0 ? void 0 : _a[0]) ? 'register.error' : 'request.error',
            msg: (_d = (_c = (_b = e.errors) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : 'request.error',
            input: (_g = (_f = (_e = e.errors) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.path) !== null && _g !== void 0 ? _g : null,
        });
    }
}));
// Users.post('/public/password/reset', async (req, res) => {
//   try {
//     // TODO: Reset password
//   } catch (error) {
//     /* istanbul ignore next */
//     res.status(500).json({ title: 'request.error', msg: 'request.error' });
//   }
// });
// ########################################################
// ######################## DELETE ########################
// ########################################################
// Deletes profile picture.
Users.delete('/current/picture', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user.ImageId)
            return res
                .status(404)
                .json({ title: 'picture.couldNotDelete', msg: 'user.imageNotFound' });
        const imgId = req.user.ImageId;
        yield req.user.setImage(null);
        const result = yield Image.remove(imgId, true);
        if (!result.success)
            return res.status(500).json(result);
        res.json({ title: 'picture.deleted', msg: 'user.imageDeleted' });
    }
    catch (error) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// Deletes the logged in user
Users.delete('/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            // Delete all owned homes and send notifications
            const homes = yield req.user.getOwnedHomes();
            yield homes.forEach((h) => __awaiter(void 0, void 0, void 0, function* () {
                yield Home_1.deleteHome(h, t);
            }));
            // Delete user
            yield req.user.destroy({ force: true }, { transaction: t, individualHooks: true });
            // Delete user image, if the user has one
            if (req.user.ImageId) {
                const result = yield Image.remove(req.user.ImageId, true);
                if (!result.success)
                    return res.status(500).json(result);
            }
            res.json({ title: 'user.deleted', msg: 'user.deleted' });
        }));
    }
    catch (error) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
exports.default = Users;
