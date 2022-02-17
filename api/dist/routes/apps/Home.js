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
exports.deleteHome = exports.notifyMembersExceptOwner = exports.getMembersExceptOwner = void 0;
const express_1 = __importDefault(require("express"));
const Translate = __importStar(require("../_utils/Translate"));
const Global = __importStar(require("../_utils/Global"));
const Email_1 = require("../_utils/Email");
const Apps_1 = require("../Apps");
const Home = express_1.default.Router();
const db = require('../../../db/models');
// ########################################################
// ##################### Middlewares ######################
// ########################################################
// Validates application and paths.
Home.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.params.appname = 'homes';
    Apps_1.validateApp(req, res, next);
}));
// ########################################################
// ################### Getters / Globals ##################
// ########################################################
// Returns false if the connected user is not the home owner.
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
// Retrieves the members from the current home, excluding the connected user.
function getMembersExceptRequester(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield res.locals.home.getMembers())
            .filter((m) => m.id !== req.user.id)
            .map((m) => m.id);
    });
}
// Retrieves the members from the current home, excluding the owner.
function getMembersExceptOwner(home) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield home.getMembers())
            .filter((m) => m.id !== home.ownerId)
            .map((m) => m.id);
    });
}
exports.getMembersExceptOwner = getMembersExceptOwner;
function notifyMembersExceptOwner(home, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        // Send notifications to deleted users
        yield Global.sendNotifications(yield getMembersExceptOwner(home), {
            typeId: 3,
            title: Translate.getJSON('homes.excludedByOwner', [home.name]),
            description: Translate.getJSON('homes.homeDeletedByOwner', [home.name]),
        }, transaction);
    });
}
exports.notifyMembersExceptOwner = notifyMembersExceptOwner;
// deletes a home
function deleteHome(home, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        // Send notifications to deleted users
        yield notifyMembersExceptOwner(home, transaction);
        yield db.HomeInvitation.destroy({ where: { homeId: home.id }, force: true }, { transaction: transaction });
        // Delete home
        yield home.destroy({ force: true }, { transaction: transaction });
        return {
            title: Translate.getJSON('homes.homeDeleted', [home.name]),
            msg: 'homes.homeDeleted',
        };
    });
}
exports.deleteHome = deleteHome;
// ########################################################
// ######################### GET ##########################
// ########################################################
// [ANY] Get home associated to specified reference number.
Home.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                    attributes: ['id', 'firstname', 'lastname'],
                    include: { model: db.Image, attributes: ['url'] },
                    through: { attributes: ['nickname', 'accepted', 'deletedAt'] },
                },
            ],
        });
        res.json(home[0]);
    }
    catch (e) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
Home.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield res.locals.home.getMembers({
            attributes: ['id', 'firstname', 'lastname'],
            include: [
                { model: db.Image, attributes: ['url'] },
                {
                    model: db.Task,
                    as: 'Tasks',
                    attributes: ['id'],
                },
            ],
            through: {
                where: { accepted: true },
            },
        });
        res.json({
            title: 'request.success',
            msg: 'request.success',
            users: users,
        });
    }
    catch (e) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################### PUT ##########################
// ########################################################
// [OWNER/MEMBER] Rename specified home.
Home.put('/rename', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const nickname = req.body.nickname;
        let home = res.locals.home;
        let originalName = home.name;
        if (home.ownerId === req.user.id) {
            yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
                if (!nickname || !nickname.length)
                    return res.status(500).json({
                        title: 'homes.couldNotRename',
                        msg: 'homes.nameUndefined',
                    });
                yield Global.sendNotifications(yield getMembersExceptOwner(res.locals.home), {
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
            if (res.headersSent)
                return;
        }
        else {
            home.UserHome.nickname = nickname && nickname.length ? nickname : null;
            home.UserHome.save({ fields: ['nickname'] });
        }
        return res.json({
            title: Translate.getJSON('homes.homeRenamed', [originalName]),
            msg: Translate.getJSON('homes.homeRenamed', [nickname]),
        });
    }
    catch (e) {
        /* istanbul ignore next */
        res.status(500).json({
            title: ((_a = e.errors) === null || _a === void 0 ? void 0 : _a[0]) ? 'homes.renameError' : 'request.error',
            msg: (_d = (_c = (_b = e.errors) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : 'request.error',
        });
    }
}));
// [OWNER] Accept or decline a request to join the specified home.
Home.put('/requests/:id/:action', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                yield Global.sendNotifications((yield getMembersExceptOwner(res.locals.home)).filter((id) => id != req.params.id), {
                    typeId: 2,
                    title: Translate.getJSON('homes.memberAdded', [userHome.Home.name]),
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
    catch (e) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################### POST #########################
// ########################################################
// [OWNER] Invite a new member into the specified home.
Home.post('/invitations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (yield denyIfNotOwner(req, res))
            return;
        const member = yield res.locals.home.getMembers({
            where: { email: req.body.email },
        });
        if (member.length)
            return res.status(500).json({
                title: 'homes.couldNotSendInvite',
                msg: 'homes.emailAlreadyInHome',
            });
        const token = Global.createToken(4);
        const invite = yield db.HomeInvitation.create({
            homeId: res.locals.home.id,
            email: req.body.email,
            token: token,
        });
        if (req.body.fake && req.body.fake === true)
            return res.json({
                title: 'homes.invitationSent',
                msg: 'homes.invitationSent',
                token: token,
            });
        const emailHtml = Global.format(yield Global.readHtml('../_html/emailInvite.html'), [res.locals.home.name, token]);
        const mailRes = yield Email_1.sendEmail({
            from: Email_1.email.sender,
            to: req.body.email,
            subject: `You have been invited to join '${res.locals.home.name}' on Cotulity!`,
            html: emailHtml,
        });
        if (!mailRes.success) {
            yield invite.destroy({ force: true });
            return res.status(500).json(Object.assign(Object.assign({}, mailRes), { token: null }));
        }
        res.json(Object.assign(Object.assign({}, mailRes), { token: token }));
    }
    catch (e) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// ########################################################
// ######################## DELETE ########################
// ########################################################
// [OWNER] Remove a member from the specified home.
Home.delete('/members/:id/remove', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Refuse removal if requester is not the owner
        if (yield denyIfNotOwner(req, res))
            return;
        // Refuse removal because owner can't delete himself
        if (req.params.id == res.locals.home.ownerId)
            return res
                .status(403)
                .json({ title: 'request.denied', msg: 'request.unauthorized' });
        return yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            let userHome = yield db.UserHome.findOne({
                where: { userId: req.params.id, homeId: res.locals.home.id },
                include: [db.Home, db.User],
            });
            // If no user is found in home
            if (!userHome)
                return res
                    .status(404)
                    .json({ title: 'request.notFound', msg: 'request.notFound' });
            yield Global.sendNotifications((yield getMembersExceptOwner(res.locals.home)).filter((id) => id != req.params.id), {
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
    catch (e) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// [OWNER] Delete the specified home.
Home.delete('/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Refuse access if requester is not the owner
        if (yield denyIfNotOwner(req, res))
            return;
        return yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            return res.json(yield deleteHome(res.locals.home, t));
        }));
    }
    catch (e) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// [MEMBER] Quit the specified home.
Home.delete('/quit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Refuse quit because owner can't quit
        if (req.user.id === res.locals.home.ownerId)
            return res
                .status(403)
                .json({ title: 'request.denied', msg: 'request.unauthorized' });
        return yield db.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            yield Global.sendNotifications(yield getMembersExceptRequester(req, res), {
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
    catch (e) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
// [REQUEST] Cancel the request to the specified home.
Home.delete('/requests/cancel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let home = res.locals.home;
        if (home.UserHome.accepted)
            return res.status(501).json({
                title: 'homes.couldNotCancelRequest',
                msg: 'homes.alreadyInHome',
            });
        yield home.UserHome.destroy({ force: true });
        res.json({
            title: 'homes.requestCancelled',
            msg: Translate.getJSON('homes.requestCancelled', [home.name]),
        });
    }
    catch (e) {
        /* istanbul ignore next */
        res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
}));
exports.default = Home;
