const express = require("express");
const router = express.Router();
const multer = require("multer")
const {storage} = require("../cloudinary");
const User = require("../models/user");
const Complaint = require("../models/complaint");
const Due = require("../models/due");
const Permission = require("../models/permission");
const Notice = require("../models/notice");
const Document = require("../models/document");
const Visitor = require("../models/visitor");
const upload = multer({storage})

// const { isLoggedIn } = require("../middlewares")


router.get("/:id/homepage", async (req, res) => {
    let notices = await Notice.find({})
    console.log(notices)
    notices = notices.reverse()
    const complaints = await Complaint.find({complainant: req.params.id})
    const permissions = await Permission.find({seeker: req.params.id})
    const allDues = await Due.find({})
    const visitors = await Visitor.find({member: req.params.id})
    const complaint = complaints[complaints.length - 1]
    const permission = permissions[permissions.length - 1]
    const dues = [allDues[allDues.length - 1], allDues[allDues.length - 2], allDues[allDues.length - 3]]
    const visitor = visitors[visitors.length - 1]
    res.render("resident/R_Home page", {id: req.params.id, notices, complaint, permission, visitor, dues})
})

router.get("/:id/notices", async (req, res) => {
    let notices = await Notice.find({})
    console.log(notices)
    notices = notices.reverse()
    res.render("resident/notices", {id: req.params.id, notices})
})

router.get("/:id/dues", async(req, res) => {
    let dues = await Due.find({})
    dues = dues.reverse()
    res.render("resident/Dues Page", {id: req.params.id, dues})
})

router.get("/:id/documents", async (req, res) => {
    const documents = await Document.find({resident: req.params.id})
    res.render("resident/Documents Page", {id: req.params.id, documents})
})

router.post("/:id/documents", upload.single("image"), async (req, res) => {
    const { name, date } = req.body
    const document = new Document({ name, date, resident: req.params.id })
    if (req.file) {
        document.image.url = req.file.path
        document.image.filename = req.file.filename
    }
    const savedDocument = await document.save()
    const user = await User.findOne({_id: req.params.id})
    user.documents.push(savedDocument)
    const savedUser = await user.save()  
    console.log(savedUser)
    console.log(savedDocument)
    res.redirect(`/resident//${req.params.id}/documents`)
})

router.get("/:id/complaints", async (req, res) => {
    const complaints = await Complaint.find({complainant: req.params.id})
    res.render("resident/complaints", {id: req.params.id, complaints})
})

router.post("/:id/complaints", async (req, res) => {
    const { date, subject, details } = req.body
    const complaint = new Complaint({ date, subject, details, complainant: req.params.id})
    const user = await User.findOne({_id: req.params.id})
    const savedComplaint = await complaint.save()
    user.complaints.push(savedComplaint)
    const savedUser = await user.save()  
    console.log(savedUser)

    console.log(savedComplaint)
    res.redirect(`/resident//${req.params.id}/complaints`)
})

router.get("/:id/permissions", async (req, res) => {
    // const permissions = await Permission.find({seeker: req.params.id})
    const user = await User.findOne({_id: req.params.id}).populate("permissions")
    console.log(req.params.id, user)
    const permissions = user.permissions
    console.log(permissions)
    res.render("resident/Permission", {id: req.params.id, permissions})
})

router.post("/:id/permissions", async (req, res) => {
    const { occasionDate, event, details, time, venue, phone } = req.body
    const permission = new Permission({ occasionDate, event, details, time, venue, phone, seeker: req.params.id})
    
    const user = await User.findOne({_id: req.params.id})
    
    const savedPermission = await permission.save()
    user.permissions.push(savedPermission)
    const savedUser = await user.save()  
    console.log(savedUser)
    console.log(savedPermission)
    res.redirect(`/resident/${req.params.id}/permissions`)
})

router.get("/:id/residents", async (req, res) => {
    const users = await User.find({type: {$in: ["resident-owner", "resident-rental"]}})
    res.render("resident/Residents", {id: req.params.id, users})
})

router.post("/:id/specificUser", async (req, res) => {
    const { wing, roomNumber } = req.body
    if (wing === "all") {
        const users = await User.find({type: {$in: ["resident-owner", "resident-rental"]}})
        console.log(users)
        res.render("resident/Residents", {id: req.params.id, users})
    }
    else {
        room = parseInt(roomNumber)
        const users = await User.find({flat: {wing: wing, roomNumber: room}, type: {$in: ["resident-owner", "resident-rental"]} } )
        console.log(users)
        res.render("resident/Residents", {id: req.params.id, users})
    }
    
})

module.exports = router;
