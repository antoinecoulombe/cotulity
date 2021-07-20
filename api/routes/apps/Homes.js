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
const Translate = __importStar(require("../Translate"));
const Apps_1 = require("../Apps");
const Notifications_1 = require("../Notifications");
const Homes = express_1.default.Router();
const db = require('../../db/models');
// Middlewares
Homes.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.params.appname = 'homes';
    Apps_1.validateApp(req, res, next);
}));
// ######################## Getters / Globals ########################
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
        catch (error) {
            console.log(error);
            res.status(500).json({ title: 'request.error', msg: 'request.error' });
        }
    });
}
function denyIfNotOwner(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (res.locals.home.ownerId !== req.user.id) {
            res
                .status(403)
                .json({ title: 'request.denied', msg: 'request.unauthorized' });
            return true;
        }
        return false;
    });
}
function getMembersExceptOwner(res) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield res.locals.home.getMembers())
            .filter((m) => m.id !== res.locals.home.ownerId)
            .map((m) => m.id);
    });
}
function getMembersExceptRequester(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield res.locals.home.getMembers())
            .filter((m) => m.id !== req.user.id)
            .map((m) => m.id);
    });
}
Homes.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    getHomes(req, res, true);
}));
Homes.get('/accepted', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    getHomes(req, res, false);
}));
Homes.get('/:refnumber', Apps_1.validateHome, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (yield denyIfNotOwner(req, res))
            return;
        const home = yield req.user.getHomes({
            where: { refNumber: res.locals.home.refNumber },
            attributes: ['ownerId', 'refNumber', 'name'],
            include: [
                {
                    model: db.User,
                    as: 'Members',
                    attributes: ['id', 'firstname', 'lastname', 'image'],
                },
            ],
        });
        res.json(home[0]);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ######################## Join/Create (homes/new) ########################
Homes.post('/create/:homeName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                name: req.params.homeName,
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
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
Homes.post('/join/:refNumber', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.params.refNumber);
        const userHome = yield req.user.getHomes({
            where: { refNumber: req.params.refNumber },
            through: { paranoid: false },
        });
        if (userHome.length !== 0) {
            if (userHome[0].UserHome.deletedAt != null) {
                if (new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) <
                    userHome[0].UserHome.deletedAt)
                    return res.status(500).json({
                        title: 'homes.requestAlreadyDenied',
                        msg: 'homes.waitWeek',
                    });
            }
            else {
                if (userHome[0].UserHome.accepted)
                    return res.status(500).json({
                        title: 'homes.couldNotJoin',
                        msg: 'homes.alreadyInHome',
                    });
                return res.status(500).json({
                    title: 'homes.couldNotJoin',
                    msg: 'homes.requestAlreadySent',
                });
            }
        }
        const home = yield db.Home.findOne({
            where: { refNumber: req.params.refNumber },
        });
        if (!home)
            return res
                .status(500)
                .json({ title: 'homes.notFound', msg: 'homes.notFound' });
        yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            yield db.Notification.create({
                typeId: 2,
                toId: home.ownerId,
                title: Translate.getJSON('homes.newRequest', [home.name]),
                description: Translate.getJSON('homes.newRequest', [
                    req.user.firstname,
                    home.name,
                ]),
            }, { transaction: t });
            if (((_b = (_a = userHome[0]) === null || _a === void 0 ? void 0 : _a.UserHome) === null || _b === void 0 ? void 0 : _b.deletedAt) != null)
                return userHome[0].UserHome.restore({}, { transaction: t });
            else
                return req.user.addHomes(home.id, { transaction: t });
        }));
        res.json({ title: 'homes.requestSent', msg: 'homes.requestSent' });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ######################## Edit ########################
Homes.delete('/:refnumber/members/remove/:id', Apps_1.validateHome, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (yield denyIfNotOwner(req, res))
            return;
        if (req.params.id == res.locals.home.ownerId)
            return res
                .status(403)
                .json({ title: 'request.denied', msg: 'request.unauthorized' });
        return yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            let userHome = yield db.UserHome.findOne({
                where: { userId: req.params.id, homeId: res.locals.home.id },
                include: [db.Home, db.User],
            });
            if (!userHome)
                return res
                    .status(404)
                    .json({ title: 'request.notFound', msg: 'request.notFound' });
            yield Notifications_1.sendNotifications((yield getMembersExceptOwner(res)).filter((id) => id != req.params.id), {
                typeId: 2,
                title: Translate.getJSON('homes.memberLost', [userHome.Home.name]),
                description: Translate.getJSON('homes.memberExcluded', [
                    userHome.User.firstname,
                    userHome.Home.name,
                ]),
            }, t);
            yield db.Notification.create({
                typeId: 3,
                toId: req.params.id,
                title: Translate.getJSON('homes.excludedByOwner', [
                    userHome.Home.name,
                ]),
                description: 'homes.excludedByOwner',
            }, { transaction: t });
            yield userHome.destroy({ force: true }, { transaction: t });
            return res.json({ title: 'request.success', msg: 'request.success' });
        }));
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
Homes.post('/:refnumber/request/:action/:id', Apps_1.validateHome, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actions = ['accept', 'reject'];
        const action = req.params.action;
        if (!action || !actions.includes(action))
            return res
                .status(404)
                .json({ title: 'request.notFound', msg: 'request.notFound' });
        if (yield denyIfNotOwner(req, res))
            return;
        return yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            let userHome = yield db.UserHome.findOne({
                where: { userId: req.params.id, homeId: res.locals.home.id },
                include: [db.Home, db.User],
            });
            if (!userHome)
                return res
                    .status(404)
                    .json({ title: 'request.notFound', msg: 'request.notFound' });
            if (action == 'accept') {
                userHome.accepted = true;
                yield userHome.save({ transaction: t });
                yield Notifications_1.sendNotifications((yield getMembersExceptOwner(res)).filter((id) => id != req.params.id), {
                    typeId: 2,
                    title: Translate.getJSON('homes.memberAdded', [
                        userHome.Home.name,
                    ]),
                    description: Translate.getJSON('memberRequestApproved', [
                        userHome.User.firstname,
                    ]),
                }, t);
            }
            else if (action == 'reject') {
                yield userHome.destroy({ transaction: t });
            }
            yield db.Notification.create({
                typeId: action == 'accept' ? 2 : 3,
                toId: req.params.id,
                title: Translate.getJSON(`homes.request${action == 'accept' ? 'Accepted' : 'Denied'}`, [res.locals.home.name]),
                description: action == 'accept' ? 'newHome.created' : 'homes.requestDenied',
            }, { transaction: t });
            return res.json({ title: 'request.success', msg: 'request.success' });
        }));
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ######################## Home management ########################
Homes.delete('/:refnumber/delete', Apps_1.validateHome, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (yield denyIfNotOwner(req, res))
            return;
        return yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            yield Notifications_1.sendNotifications(yield getMembersExceptOwner(res), {
                typeId: 3,
                title: Translate.getJSON('homes.excludedByOwner', [
                    res.locals.home.name,
                ]),
                description: Translate.getJSON('homes.homeDeletedByOwner', [
                    res.locals.home.name,
                ]),
            }, t);
            yield res.locals.home.destroy({ transaction: t });
            return res.json({
                title: Translate.getJSON('homes.homeDeleted', [res.locals.home.name]),
                msg: 'homes.homeDeleted',
            });
        }));
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
Homes.delete('/:refnumber/quit', Apps_1.validateHome, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            yield Notifications_1.sendNotifications(yield getMembersExceptRequester(req, res), {
                typeId: 2,
                title: Translate.getJSON('homes.memberLost', [res.locals.home.name]),
                description: Translate.getJSON('homes.memberQuit', [
                    req.user.firstname,
                    res.locals.home.name,
                ]),
            }, t);
            yield res.locals.home.UserHome.destroy({ force: true }, { transaction: t });
            return res.json({
                title: Translate.getJSON('homes.homeLeft', [res.locals.home.name]),
                msg: 'homes.homeLeft',
            });
        }));
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
Homes.post('/:refnumber/rename', Apps_1.validateHome, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f;
    try {
        const nickname = req.body.nickname;
        let home = res.locals.home;
        let originalName = home.name;
        if (home.ownerId === req.user.id) {
            yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
                if (!nickname || nickname.length == 0)
                    return res.status(500).json({
                        title: 'homes.couldNotRename',
                        msg: 'homes.nameUndefined',
                    });
                yield Notifications_1.sendNotifications(yield getMembersExceptOwner(res), {
                    typeId: 2,
                    title: Translate.getJSON('homes.homeRenamedByOwner', [home.name]),
                    description: Translate.getJSON('homes.homeRenamedByOwner', [
                        home.name,
                        nickname,
                    ]),
                }, t);
                home.name = nickname;
                yield home.save({ transaction: t });
            }));
        }
        else {
            home.UserHome.nickname =
                nickname && nickname.length > 0 ? nickname : null;
            home.UserHome.save({ fields: ['nickname'] });
        }
        return res.json({
            title: Translate.getJSON('homes.homeRenamed', [originalName]),
            msg: Translate.getJSON('homes.homeRenamed', [nickname]),
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            title: ((_c = e.errors) === null || _c === void 0 ? void 0 : _c[0]) ? 'homes.renameError' : 'request.error',
            msg: (_f = (_e = (_d = e.errors) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.message) !== null && _f !== void 0 ? _f : 'request.error',
        });
    }
}));
// ######################## Members ########################
function createToken(loopTimes) {
    let token = Math.random().toString(36).substring(2, 15);
    for (let i = 0; i < loopTimes - 1; ++i)
        token += Math.random().toString(36).substring(2, 15);
    return token;
}
Homes.post('/:refnumber/members/invite', Apps_1.validateHome, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h, _j, _k;
    try {
        if (yield denyIfNotOwner(req, res))
            return;
        const member = yield res.locals.home.getMembers({
            where: { email: req.body.email },
        });
        if (member.length > 0)
            return res.status(500).json({
                title: 'homes.couldNotSendInvite',
                msg: 'homes.emailAlreadyInHome',
            });
        const token = createToken(10);
        const invite = yield db.HomeInvitation.create({
            homeId: res.locals.home.id,
            email: req.body.email,
            token: token,
        });
        // send email
        let emailFailedToSend = true;
        if (emailFailedToSend) {
            invite.destroy({ force: true });
            return res.status(500).json({
                title: 'homes.emailDidNotSend',
                msg: 'request.error',
            });
        }
        res.json({ title: 'homes.invitationSent', msg: 'homes.invitationSent' });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            title: ((_g = e.errors) === null || _g === void 0 ? void 0 : _g[0]) ? 'homes.inviteError' : 'request.error',
            msg: (_k = (_j = (_h = e.errors) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.message) !== null && _k !== void 0 ? _k : 'request.error',
        });
    }
}));
Homes.post('/:token/members/invite/accept', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            const expiration = new Date(Date.parse(invite.createdAt) +
                invite.expirationDays * 24 * 60 * 60 * 1000);
            if (new Date(Date.now()) > expiration)
                return res.status(500).json({
                    title: 'homes.inviteExpired',
                    msg: 'homes.inviteExpired',
                });
            yield Notifications_1.sendNotifications(yield getMembersExceptRequester(req, res), {
                typeId: 2,
                title: Translate.getJSON('homes.memberAdded', [invite.home.name]),
                description: Translate.getJSON('homes.memberAcceptedInvite', [
                    req.user.firstname,
                    invite.home.name,
                ]),
            }, t);
            yield db.UserHome.create({
                homeId: invite.home.id,
                userId: req.user.id,
                accepted: true,
            }, { transaction: t });
            return res.json({
                title: Translate.getJSON('homes.homeJoined', [invite.home.name]),
                msg: 'newHome.created',
            });
        }));
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
Homes.post('/public/:token/members/invite/decline', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            yield invite.destroy({ transaction: t });
            yield db.Notification.create({
                typeId: 2,
                toId: invite.home.ownerId,
                title: Translate.getJSON('homes.inviteDeclined', [
                    invite.home.name,
                ]),
                description: Translate.getJSON('homes.inviteDeclined', [
                    invite.email,
                    invite.home.name,
                ]),
            }, { transaction: t });
            return res.json({
                title: 'request.success',
                msg: 'request.success',
            });
        }));
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ######################## Requests ########################
Homes.delete('/:refnumber/request/cancel', Apps_1.validateHome, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let home = res.locals.home;
        if (home.UserHome.accepted)
            return res.status(501).json({
                title: 'homes.couldNotCancelRequest',
                msg: 'homes.alreadyInHome',
            });
        home.UserHome.destroy({ force: true });
        res.json({
            title: 'homes.requestCancelled',
            msg: Translate.getJSON('homes.requestCancelled', [home.name]),
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
exports.default = Homes;
