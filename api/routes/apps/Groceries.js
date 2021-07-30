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
exports.deleteGroceriesFromHome = void 0;
const express_1 = __importDefault(require("express"));
const Apps_1 = require("../Apps");
const Groceries = express_1.default.Router();
const db = require('../../db/models');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
Groceries.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.params.appname = 'groceries';
    Apps_1.validateApp(req, res, next);
}));
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
function deleteGroceriesFromHome(home, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db.Grocery.destroy({ where: { homeId: home.id }, force: true }, { transaction: transaction });
            return { success: true, title: 'request.success', msg: 'request.success' };
        }
        catch (error) {
            console.log(error);
            return { success: false, title: 'request.error', msg: 'request.error' };
        }
    });
}
exports.deleteGroceriesFromHome = deleteGroceriesFromHome;
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
exports.default = Groceries;
