const User = require('./../models/user')
const sharp = require('sharp')

class UserController {
    /**
     * Signup user
     * @param {*} req
     * @param {*} res
     */
     async signup(req, res) {
        const user = new User(req.body)
        try {
            await user.save();
            const token = await user.generateAuthToken()
            res.status(201).send({user, token})
        } catch (e) {
            res.status(400).send(e)
        }
    }

    /**
     * login user
     * @param {*} req
     * @param {*} res
     */
     async login(req, res) {
        try {
            const user = await User.findByCredential(req.body.email, req.body.password);
            const token = await user.generateAuthToken()
            res.status(200).send({ user, token })
        } catch (e) {
            res.status(400).send({error: e.message})
        }
    }

    /**
     * logout user
     * @param {*} req
     * @param {*} res
     */
     async logout(req, res) {
        try {
            const user = req.user
            user.tokens = user.tokens.filter((token) => {
                token.token !== req.token
            })
            user.save()
            res.status(200).send({message: "Logout successfully!"})
        } catch (e) {
            res.status(500).send({error: e.message})
        }
    }

    /**
     * update user
     * @param {*} req
     * @param {*} res
     */
     async update(req, res) {
        const updates = Object.keys(req.body)
        const allowUpdates = ['name', 'email', 'password', 'avatar']
    
        const isValidData = updates.every((update) => allowUpdates.includes(update))

        if (!isValidData || updates.length == 0) {
            return res.status(400).send({error: "Invalid data"})
        }
        try {
            updates.forEach((update) => req.user[update] = req.body[update])
            if (req.file !== undefined) {
                req.user['avatar'] = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer();
            }
            await req.user.save()
            res.status(200).send(req.user)
        } catch (e) {
            res.status(400).send({error: e.message})
        }
    }

    /**
     * get user avatar
     * @param {*} req
     * @param {*} res
     */
    async getUserAvatar(req, res) {
        try {
            res.set('Content-type', 'image/jpg')
            res.status(200).send(req.user.avatar)
        } catch (e) {
            res.status(400).send({error: e.message})
        }
    }

    /**
     * get user
     * @param {*} req
     * @param {*} res
     */
     async getUser(req, res) {
        try {
            res.status(200).send(req.user)
        } catch (e) {
            res.status(400).send({error: e.message})
        }
    }
}

module.exports = UserController