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
const Translate = __importStar(require("../_utils/Translate"));
const Global = __importStar(require("../_utils/Global"));
const Apps_1 = require("../Apps");
const Homes = express_1.default.Router();
const db = require('../../../db/models');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
// Validates application and paths.
Homes.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.path.startsWith('/public')) {
        return next();
    }
    req.params.appname = 'homes';
    Apps_1.validateApp(req, res, next);
}));
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
// Get home list.
function getHomes(req, res, all) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dbHomes = yield req.user.getHomes({
                group: ['Home.id'],
                through: !all ? { where: { accepted: true } } : {},
                attributes: [
                    'id',
                    'ownerId',
                    'refNumber',
                    'name',
                    [
                        db.sequelize.fn('COUNT', db.sequelize.col('Members.id')),
                        'memberCount',
                    ],
                ],
                include: [
                    {
                        model: db.User,
                        as: 'Members',
                        through: {
                            where: { accepted: true },
                        },
                    },
                ],
                order: [
                    'name',
                    [db.sequelize.fn('COUNT', db.sequelize.col('Members.id')), 'DESC'],
                ],
            });
            res.json({
                homes: JSON.parse(JSON.stringify(dbHomes, [
                    'id',
                    'ownerId',
                    'refNumber',
                    'name',
                    'memberCount',
                    'UserHome',
                    'nickname',
                    'accepted',
                ])),
            });
        }
        catch (e) {
            res.status(500).json({ title: 'request.error', msg: 'request.error' });
        }
    });
}
// ########################################################
// ######################### GET ##########################
// ########################################################
// [ANY] Get all homes.
Homes.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    getHomes(req, res, true);
}));
// [ANY] Get all accepted homes.
Homes.get('/accepted', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    getHomes(req, res, false);
}));
// [PUBLIC] Decline the invitation linked to the specified token.
Homes.get('/public/invitations/:token/decline', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Decline');
    try {
        return yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            const invite = yield db.HomeInvitation.findOne({
                where: { token: req.params.token },
                include: db.Home,
            });
            const html = yield Global.readHtml('../_html/responsePage.html');
            if (!invite) {
                return Global.respondHtml(res, Global.format(html, [
                    'Invitation not found',
                    'No invitation is linked to that token.',
                ]), 404);
            }
            yield invite.destroy({ transaction: t });
            yield db.Notification.create({
                typeId: 2,
                toId: invite.Home.ownerId,
                title: Translate.getJSON('homes.inviteDeclined', [invite.Home.name]),
                description: Translate.getJSON('homes.inviteDeclined', [
                    invite.email,
                    invite.Home.name,
                ]),
            }, { transaction: t });
            return Global.respondHtml(res, Global.format(html, [
                'Invitation declined',
                'You can close this page.',
            ]), 200);
        }));
    }
    catch (e) {
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################### PUT ##########################
// ########################################################
// [ANY] Accept the invitation linked to the specified token.
Homes.put('/invitations/:token/accept', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            const invite = yield db.HomeInvitation.findOne({
                where: { token: req.params.token },
                include: db.Home,
            });
            if (!invite) {
                return res.status(404).json({
                    title: 'homes.inviteNotFound',
                    msg: 'homes.inviteNotFound',
                });
            }
            const userInHome = yield db.UserHome.findOne({
                where: { homeId: invite.Home.id, userId: req.user.id, accepted: true },
            });
            if (userInHome) {
                yield invite.destroy();
                return res.status(500).json({
                    title: 'homes.couldNotJoin',
                    msg: 'homes.alreadyInHome',
                });
            }
            const expiration = new Date(Date.parse(invite.createdAt) +
                invite.expirationDays * 24 * 60 * 60 * 1000);
            if (new Date(Date.now()) > expiration)
                return res.status(500).json({
                    title: 'homes.inviteExpired',
                    msg: 'homes.inviteExpired',
                });
            yield Global.sendNotifications((yield invite.Home.getMembers())
                .filter((m) => m.id !== req.user.id)
                .map((m) => m.id), {
                typeId: 2,
                title: Translate.getJSON('homes.memberAdded', [invite.Home.name]),
                description: Translate.getJSON('homes.memberAcceptedInvite', [
                    req.user.firstname,
                    invite.Home.name,
                ]),
            }, t);
            const userHome = yield db.UserHome.findOne({
                where: { homeId: invite.Home.id, userId: req.user.id },
                paranoid: false,
            });
            if (userHome) {
                if (!userHome.accepted) {
                    userHome.accepted = true;
                    yield userHome.save({ transaction: t });
                }
                if (userHome.deletedAt != null)
                    yield userHome.restore({ transaction: t });
            }
            else {
                yield db.UserHome.create({
                    homeId: invite.Home.id,
                    userId: req.user.id,
                    accepted: true,
                }, { transaction: t });
            }
            yield invite.destroy({ transaction: t });
            return res.json({
                title: Translate.getJSON('homes.homeJoined', [invite.Home.name]),
                msg: 'newHome.created',
            });
        }));
    }
    catch (e) {
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################### POST #########################
// ########################################################
// [ANY] Create a new home.
Homes.post('/:homename', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const home = yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            const refNumberDigits = 6;
            let refNumber;
            do {
                refNumber = Math.random()
                    .toString()
                    .slice(2, 2 + refNumberDigits);
            } while ((yield db.Home.findOne({ where: { refNumber: refNumber } })) != null);
            const home = yield db.Home.create({
                refNumber: refNumber,
                name: req.params.homename,
                ownerId: req.user.id,
            }, { transaction: t });
            yield db.UserHome.create({
                userId: req.user.id,
                homeId: home.id,
                accepted: 1,
            }, { transaction: t });
            return home;
        }));
        res.json({
            title: 'newHome.created',
            msg: 'newHome.created',
            refNumber: home.refNumber,
        });
    }
    catch (e) {
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################## DELETE ########################
// ########################################################
exports.default = Homes;
