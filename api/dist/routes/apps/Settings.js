"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Settings = express_1.default.Router();
const db = require('../../../db/models');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
// TODO: uncomment this before adding routes
// Settings.use(async (req: any, res, next) => {
//   req.params.appname = 'settings';
//   validateApp(req, res, next);
// });
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
// ########################################################
// ######################### GET ##########################
// ########################################################
// ########################################################
// ######################### PUT ##########################
// ########################################################
// ########################################################
// ######################### POST #########################
// ########################################################
// ########################################################
// ######################## DELETE ########################
// ########################################################
exports.default = Settings;
