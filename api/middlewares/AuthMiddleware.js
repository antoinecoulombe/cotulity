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
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const passport = require('passport');
require('../config/passport');
const AuthMiddleware = express.Router();
AuthMiddleware.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const publicPaths = ['/auth/login', '/users/register'];
    if (publicPaths.includes(req.path))
        return next();
    passport.authenticate('jwt', {
        session: false,
    }, function (err, user, info) {
        if (err)
            return next(err);
        if (!user) {
            return next({
                title: 'Access Denied',
                msg: "You don't have the required permissions to access the requested ressource.",
            });
        }
        else
            return next();
    })(req, res, next);
}));
exports.default = AuthMiddleware;