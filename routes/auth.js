const router = require("../config/express")
const isAuthenticated = require("../middlware/isAuthenticatedMiddleware")
const bcrypt = require("bcrypt")
const {
    User, Session, Role, sequelize
} = require("../models")

const SALT = `Z2#H-7a\`=9/(V0T04(qVMlm4N~n[~jp8H'Qi61hbl@:@ZMcY#:`;

router.post('/login', async (req, res) => {
    const {email, password} = req.body
    if (!email || !password) {
        return res.status(400).json({error: 'Invalid email or password'})
    }
    try {
        // Find the user by email
        const user = await User.scope('withPassword').findOne({
            where: {
                email: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), sequelize.fn('LOWER', email))
            },
            include: [{model: Role}]
        });

        // Check if the user exists and the password is correct
        if (!user) {
            return res.status(401).json({error: 'Invalid email address'});
        }

        // Check if hashed password matches
        const isPasswordCorrect = bcrypt.compareSync(password + SALT, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({error: 'Invalid password'})
        }
        // Generate a random token
        const token = btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))

        // Create session
        await Session.create({token, userId: user.userId})

        // Return the token
        return res.json({token})
    } catch (e) {
        console.log(e)
        return res.status(500).json({error: 'Internal server error'})
    }
})

router.get("/logout", isAuthenticated, async (req, res) => {
    req.logOut()
    res.status(200).json({message: "Logout successful"})
})

module.exports = router
