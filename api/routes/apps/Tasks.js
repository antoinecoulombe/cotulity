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
exports.deleteTasksFromHome = void 0;
const express_1 = __importDefault(require("express"));
const Apps_1 = require("../Apps");
const Tasks = express_1.default.Router();
const db = require('../../db/models');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
Tasks.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.params.appname = 'tasks';
    Apps_1.validateApp(req, res, next);
}));
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
function deleteTasksFromHome(home, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db.task.destroy({ where: { homeId: home.id }, force: true }, { transaction: transaction });
            return { success: true, title: 'request.success', msg: 'request.success' };
        }
        catch (error) {
            console.log(error);
            return { success: false, title: 'request.error', msg: 'request.error' };
        }
    });
}
exports.deleteTasksFromHome = deleteTasksFromHome;
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
exports.default = Tasks;
