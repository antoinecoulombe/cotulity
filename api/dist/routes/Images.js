"use strict";
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
const Images = express_1.default.Router();
const db = require('../../db/models');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
// ########################################################
// ######################### GET ##########################
// ########################################################
Images.get('/profile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const img = yield req.user.getImage();
        if (!img)
            return res.json({ title: 'image.notFound', msg: 'picture.notFound' });
        res.json({ url: img.url });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
function respondImage(res, url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const img = yield db.Image.findOne({ where: { url: url } });
            if (!img)
                res
                    .status(404)
                    .json({ title: 'image.notFound', msg: 'picture.notFound' });
            res.sendFile(img.filePath);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ title: 'request.error', msg: 'request.error' });
        }
    });
}
// Get all notifications linked to the connected user.
Images.get('/public/:url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    respondImage(res, req.params.url);
}));
// Get all notifications linked to the connected user.
Images.get('/:url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    respondImage(res, req.params.url);
}));
// ########################################################
// ######################### PUT ##########################
// ########################################################
// ########################################################
// ######################### POST #########################
// ########################################################
// ########################################################
// ######################## DELETE ########################
// ########################################################
exports.default = Images;