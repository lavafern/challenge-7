const prisma = require("./prisma.service")
const jwt = require("jsonwebtoken")
const {JWT_SECRET_KEY} = process.env
const bcrypt = require("bcrypt")
const {sendEmail,getHtml} = require("../utils/nodemailer")


module.exports = {
    registerService : async (email,password,name) => {
        if (!email || !password || !name) throw new Error("required fiels are missing")
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(String(email).toLowerCase())) throw new Error("please use valid email format")
        const checkEmail = await prisma.user.findUnique({
            where : {
                email
            }
        })
        if (checkEmail) throw new Error("email already used")
        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data : {
                email,
                password : encryptedPassword,
                name
            }
        })

        return newUser

    },

    loginService : async (email,password) => {
        try {
            if (!email || !password ) throw new Error("required fiels are missing")
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(String(email).toLowerCase())) throw new Error("please use valid email format")
        
            const checkUserExist = await prisma.user.findUnique({
                where : {email}
            })
            if (!checkUserExist) throw new Error("email/ password is not valid")
            const comparePassword = await bcrypt.compare(password,checkUserExist.password)
            if(!comparePassword) throw new Error("email / password is not valid")

            return new Promise((resolve,reject) => {
                jwt.sign({email : checkUserExist.email},JWT_SECRET_KEY,(err,token) => {
                    if (err) reject(err.message)
                    resolve({
                        email,
                        token
                    })
                })
            })

        } catch (err) {
            throw err
        }
    },

    lupaPasswordService : async (email) => {
        try {
            if (!email) throw new Error("required fields are missing")
            const checkUserExist = await prisma.user.findUnique({
                where : {email}
            })
            if (!checkUserExist) throw new Error("email/ password is not valid")
            let token = jwt.sign({ email }, JWT_SECRET_KEY);
            const name = checkUserExist.name
            let url = `http://localhost:3000/api/v1/reset-password?token=${token}`;
            const html = await getHtml('reset-password.ejs',{ name, url })
            sendEmail(email, 'Reset password challenge', html)

            return email

        } catch (err) {
            throw err
        }
    },
    emailActivationService : async (newPassword,passwordConfirmation,token) => {
        try {
            if (!newPassword||!passwordConfirmation) throw new Error("required fields are missing")
            if (newPassword!==passwordConfirmation) throw new Error("new password confirmation not identical with new password")
            return new Promise((resolve,reject) => {
                jwt.verify(token, JWT_SECRET_KEY, async (err,decoded) => {
                    if (err) reject(err)
                    const email = decoded.email
                    const newEncryptedPassword = await bcrypt.hash(newPassword, 10);
                    const updatePassword = await prisma.user.update({
                        where : {email},
                        data : {
                            password : newEncryptedPassword
                        }
                    })
                    resolve(updatePassword)
                })
            })
            
        } catch (err) {
            throw err
        }
    }
}