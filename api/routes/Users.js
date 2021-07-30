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
exports.deleteUsersFromHome = void 0;
const express_1 = __importDefault(require("express"));
const Image = __importStar(require("./_utils/Image"));
const Homes_1 = require("./apps/Homes");
const Users = express_1.default.Router();
const db = require('../db/models');
const bcrypt = require('bcryptjs');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
function deleteUsersFromHome(home, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db.UserHome.destroy({ where: { homeId: home.id }, force: true }, { transaction: transaction });
            return { success: true, title: 'request.success', msg: 'request.success' };
        }
        catch (error) {
            console.log(error);
            return { success: false, title: 'request.error', msg: 'request.error' };
        }
    });
}
exports.deleteUsersFromHome = deleteUsersFromHome;
// ########################################################
// ######################### GET ##########################
// ########################################################
Users.get('/image', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user.imageId)
            return res
                .status(404)
                .json({ title: 'picture.notFound', msg: 'picture.notFound' });
        const img = yield db.Image.findOne({ where: { id: req.user.imageId } });
        res.sendFile(img.filePath);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################### PUT ##########################
// ########################################################
// Upload a new profile picture.
Users.put('/image', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.ImageId)
            yield Image.remove(req.user.ImageId);
        const result = yield Image.save(req, 'profiles');
        if (!result.success)
            return res.status(500).json(result);
        yield req.user.setImage(result.image);
        res.json({ title: 'picture.updated', msg: 'user.imageUpdated' });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################### POST #########################
// ########################################################
// Register a new user.
Users.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { email, firstname, lastname, phone } = req.body;
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(req.body.password, salt);
        const user = yield db.User.create({
            email,
            password,
            firstname,
            lastname,
            phone,
        });
        res.json({
            title: 'register.success',
            msg: 'register.success',
        });
    }
    catch (e) {
        res.status(500).json({
            title: e.errors[0] ? 'register.error' : 'request.error',
            msg: (_b = (_a = e.errors[0]) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'request.error',
            input: (_d = (_c = e.errors[0]) === null || _c === void 0 ? void 0 : _c.path) !== null && _d !== void 0 ? _d : null,
        });
    }
}));
// ########################################################
// ######################## DELETE ########################
// ########################################################
// Deletes profile picture.
Users.delete('/image/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user.ImageId)
            return res
                .status(404)
                .json({ title: 'picture.couldNotDelete', msg: 'user.imageNotFound' });
        const result = yield Image.remove(req.user.ImageId);
        if (!result.success)
            return res.status(500).json(result);
        yield req.user.setImage(null);
        res.json({ title: 'picture.deleted', msg: 'user.imageDeleted' });
    }
    catch (error) {
        console.log(error);
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
                yield Homes_1.notifyMembersExceptOwner(h, t);
            }));
            // Delete notifications associated to user
            // await deleteNotificationsToUser(req.user, t);
            // Delete user
            yield req.user.destroy({ force: true }, { transaction: t, individualHooks: true });
            // Delete user image
            Image.remove(req.user.ImageId);
            res.json({ title: 'user.deleted', msg: 'user.deleted' });
        }));
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
exports.default = Users;
