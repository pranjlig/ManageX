const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Visitor = require("../models/visitor");
// const { isLoggedIn } = require("../middlewares")

router.get("/homepage", async (req, res) => {
    const users = await User.find({type: {$in: ["resident-owner", "resident-rental"]}})  
    res.render("security/SecurityHomepage", {users})
})
router.post("/homepage", async (req, res) => {
    const {name, phone, reason, wing, roomNumber, time} = req.body
    room = parseInt(roomNumber)
    const visitor = new Visitor({name, phone, reason, time})
    const user = await User.findOne({flat: {wing: wing, roomNumber: room}, type: {$in: ["resident-owner", "resident-rental"]} })  
    visitor.member = user._id
    const savedVisitor = await visitor.save()
    user.visitors.push(savedVisitor)
    const savedUser = await user.save()
    console.log(savedVisitor)
    console.log(savedUser)
    res.redirect("/security/homepage")
})

router.get("/residents", async (req, res) => {
    const users = await User.find({type: {$in: ["resident-owner", "resident-rental"]}})
    res.render("security/SecurityResident", {users})
})

router.post("/specificUser", async (req, res) => {
    const { wing, roomNumber } = req.body
    if (wing === "all") {
        const users = await User.find({type: {$in: ["resident-owner", "resident-rental"]}})
        res.render("security/SecurityResident", {users})
    }
    else {
        room = parseInt(roomNumber)
        const users = await User.find({flat: {wing: wing, roomNumber: room}, type: {$in: ["resident-owner", "resident-rental"]} } )
        res.render("security/SecurityResident", {users})
    }
    
})

module.exports = router;
