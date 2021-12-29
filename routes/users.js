const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

router.get("/registration", (req, res) => {
    res.render("Registration girish")
})

router.post("/registration", async (req, res) => {
    const { password, id, confirmPassword } = req.body
    if (password !== confirmPassword) {
        req.flash("error", "Passwords did not match.")
        res.redirect("/registration")
    }
    else {
        try {
            const user = await User.findById({_id: id})
            const hash = await bcrypt.hash(password, 12)
            user.password = hash
            const savedUser = await user.save()
            console.log(savedUser)
            req.session.user_id = user._id
            req.flash("success", "Successfully registered.")
            if (user.type == "admin") {
                if (user.flat) {
                    res.redirect("/admin/homepage")
                }
                else {
                    res.redirect("/resident/homepage")
                }
            }
            else if (user.type == "security") {
                res.redirect("/security/homepage")
            }
            else {
                res.redirect(`/resident/${user._id}/homepage`)
            }
            // res.redirect("/resident/homepage")
        }
        catch {
            req.flash("error", "User not found. Please check your id or get yourself registered by the admin if not.")
            res.redirect("/registration")
        }
    }
})

router.get("/login", (req, res) => {
    res.render("Login girish")
})

router.post("/login", async (req, res) => {
    const { email, password, type } = req.body
    const user = await User.findOne({ email, type })
    console.log(user)
    if (!user) {
        req.flash("error", "Email or password or type is incorrect.")
        res.redirect("/login")
    }
    else {
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            req.flash("error", "Email or password or type is incorrect.")
            res.redirect("/login")
        }
        else {
            req.session.user_id = user._id
            if (type == "admin") {
                if (user.flat) {
                    res.redirect("/admin/homepage")
                }
                else {
                    res.redirect(`/resident/${user._id}/homepage`)
                }
            }
            else if (user.type == "security") {
                res.redirect("/security/homepage")
            }
            else {
                res.redirect(`/resident/${user._id}/homepage`)

            }
            
        }
    }
})

router.get("/logout", (req, res) => {
    res.render("Main_HomePage")
})

module.exports = router;