const {registerService,loginService,emailActivationService, lupaPasswordService} = require("../services/index.services")
const {io} = require("../utils/server")
module.exports = {
    register : async (req,res,next) => {
        try {
            const {email,password,name} = req.body

            const result = await registerService(email,password,name)
            io.emit("register_notif", {notification : "Congratulations! Your account on has been successfully created.", status : true});

            res.status(201).json({
                status : "OK",
                message : "new user created",
                data : result
            })

        } catch (err) {
            io.emit("register_notif", {notification : err.message, status : false});
            next(err)
        }
    },

    registerPage : async (req,res,next) => {
        try {
            res.render("register")
        } catch (err) {
            next(err)
        }
    },

    login : async (req,res,next) => {
        try {
            const {email,password} = req.body
            const result = await loginService(email,password)
            res.status(201).json({
                status : "OK",
                message : "login success",
                data : result
            })


        } catch (err) {
            next(err)
        }
    },

    loginPage : (req,res,next) => {
        try {
            res.render("login")
        } catch (err) {
            next(err)
        }
    },

    lupaPassword : async (req,res,next) => {
        try {
            const {emailReset} = req.body
            const result = await lupaPasswordService(emailReset)
            res.json({
                status : true,
                message : 'reset password link has been sent to your email',
                data : `please check new email in ${result}`
            })
        } catch (err) {

            next(err)
        }
    },
    resetPasswordPage : async (req,res,next) => {
        try {
            const {token} = req.query
            res.render('new-password',{token})
        } catch (err) {
            next(err)
        }
    },

    resetPassword : async (req,res,next) => {
        try {
            const {token} = req.query
            const {newPassword,passwordConfirmation} = req.body
            result = await emailActivationService(newPassword,passwordConfirmation,token)
            io.emit("reset_notif", {notification :'reset password success!', status : true});

            res.json({
                status : true,
                message : "reset password success!",
                data : result})
        } catch (err) {
            io.emit("reset_notif", {notification : err.message, status : false});

            next(err)
        }
    }
    
}