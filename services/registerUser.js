const bcrypt = require("bcrypt");
const {User} = require("../models");


const SALT_ROUNDS = 10;
const SALT = `Z2#H-7a\`=9/(V0T04(qVMlm4N~n[~jp8H'Qi61hbl@:@ZMcY#:`;

async function registerUser(user) {
    user.password = bcrypt.hashSync(user.password + SALT, SALT_ROUNDS)
    const dbUser = await User.findOne({where: {email: user.email}})
    if (!dbUser) {
        return User.create(user)
    }
}

async function updateUser(userId, user) {
    if (user.password) {
        user.password = bcrypt.hashSync(user.password + SALT, SALT_ROUNDS)
    }
    return User.update(user, {where: {userId: userId}})
}

module.exports = {registerUser, updateUser}