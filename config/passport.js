const passport = require("passport");
const db = require("../models");
const {User, Role, Employee, EmployeeWallet, DepartmentLeader, Department} = require("../models");
const BearerStrategy = require('passport-http-bearer').Strategy;

passport.use(new BearerStrategy(
    async function (token, done) {
        try {
            const session = await db.Session.findOne({
                where: {token},
                include: [{
                    model: User,
                    include: [{model: Role}, {
                        model: Employee,
                        as: "employee",
                        include: [
                            {
                                model: EmployeeWallet,
                                as: "wallet"
                            },
                            {
                                model: DepartmentLeader,
                                as: "leaders",
                                include: [
                                    {
                                        model: Department,
                                        as: "department"
                                    }
                                ]
                            },

                        ]
                    }]
                }]
            });
            if (session !== null) {
                return done(null, session.User, {scope: 'all'});
            } else {
                return done(null, false);
            }
        } catch (e) {
            return done(e);
        }
    }
));

// Serialize and deserialize user for session management
passport.serializeUser(function (user, done) {
    done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
    try {
        // Retrieve user from the database based on the user id using Sequelize
        const user = await User.findByPk(email);

        if (!user) {
            // User not found, return failure
            return done(null, false);
        }

        // Return the user object
        return done(null, user);
    } catch (error) {
        // Handle any errors that occurred during the deserialization process
        return done(error);
    }
});

module.exports = passport;