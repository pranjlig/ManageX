const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require("../models/user");
// const { isLoggedIn } = require("../middlewares")
const multer = require("multer")
const {storage} = require("../cloudinary");
const Complaint = require("../models/complaint");
const Due = require("../models/due");
const Permission = require("../models/permission");
const Notice = require("../models/notice");
const Document = require("../models/document");
const upload = multer({storage})


const sendMail = async ( recepient, id ) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
        });
    
    const mailOptions = {
    from: process.env.EMAIL,
    to: recepient,
    subject: 'Registration ID',
    text: `Your Registration ID is: ${id}.`
    };
    try {
        const response = await transporter.sendMail(mailOptions)
        return true
    }
    catch(error) {
        console.log(error)
        return false
    }
}

router.get("/addUser", async (req, res) => {
    const users = await User.find({type: {$in: ["resident-owner", "resident-rental"]}})
    res.render("admin/ResidentsAdmin", {users})
    
})

router.post("/addUser", upload.single("image"), async (req, res) => {
    const { name, type, email, phone, flat } = req.body
    const user = new User({ name, email, phone, flat, type })
    if (req.file) {
        user.image.url = req.file.path
        user.image.filename = req.file.filename
    }
    const savedUser = await user.save()
    const mailSent = await sendMail(email, savedUser._id)
    if (mailSent) {
        req.flash("success", "Successfully added. Registration ID is sent to the registered email id. Please check the email id provided if email not received.")
    }
    else {
        req.flash("error", "Error in sending email. Please get the id from admin.")
    }
    res.redirect("/admin/addUser")
})

router.post("/specificUser", async (req, res) => {
    const { wing, roomNumber } = req.body
    if (wing === "all") {
        const users = await User.find({type: {$in: ["resident-owner", "resident-rental"]}})
        console.log(users)
        res.render("admin/ResidentsAdmin", {users})
    }
    else {
        room = parseInt(roomNumber)
        const users = await User.find({flat: {wing: wing, roomNumber: room}, type: {$in: ["resident-owner", "resident-rental"]} } )
        console.log(users)
        res.render("admin/ResidentsAdmin", {users})
    }
    
})
router.get("/homepage", async (req, res) => {
    const allComplaints = await Complaint.find({}).populate("complainant")
    const allPermissions = await Permission.find({}).populate("seeker")
    const allDues = await Due.find({})
    const complaints = [allComplaints[allComplaints.length - 1], allComplaints[allComplaints.length - 2]]
    const permissions = [allPermissions[allPermissions.length - 1], allPermissions[allPermissions.length - 2]]
    const dues = [allDues[allDues.length - 1], allDues[allDues.length - 2], allDues[allDues.length - 3]]
    res.render("admin/Admin_HomePage", {complaints, permissions, dues})
})

router.get("/notices",async  (req, res) => {
    let notices = await Notice.find({})
    notices = notices.reverse()
    res.render("admin/adnot", {notices})
})

router.post("/notices", async (req, res) => {
    const { date, subject, details } = req.body
    const notice = new Notice({ date, subject, details})
    const savedNotice = await notice.save()
    console.log(savedNotice)
    res.redirect("/admin/notices")
})

router.get("/dues", async (req, res) => {
    let dues = await Due.find({})
    dues = dues.reverse()
    res.render("admin/DuesAdmin", {dues})
})

router.post("/dues", async (req, res) => {
    const { dueDate, name, details, amount } = req.body
    const due = new Due({ dueDate, name, details, amount})
    const savedDue = await due.save()
    console.log(savedDue)
    res.redirect("/admin/dues")
})

router.get("/documents", async (req, res) => {
    const documents = await Document.find({}).populate("resident")
    res.render("admin/DocumentsAdmin", {documents})
})

router.get("/complaints", async (req, res) => {
    const complaints = await Complaint.find({}).populate("complainant")
    console.log(complaints)
    res.render("admin/adcom", {complaints})
})

router.get("/permissions", async (req, res) => {
    const permissions = await Permission.find({}).populate("seeker")
    res.render("admin/PermissionAdmin", {permissions})
})
router.post("/permissions/:id/accepted", async (req, res) => {
    const {id} = req.params
    const permission = await Permission.findOne({_id: id})
    permission.status = "Accepted"
    const savedPermission = await permission.save()
    console.log(savedPermission)
    res.redirect("/admin/permissions")
})
router.post("/permissions/:id/rejected", async (req, res) => {
    const {id} = req.params
    const permission = await Permission.findOne({_id: id})
    permission.status = "Rejected"
    const savedPermission = await permission.save()
    console.log(savedPermission)
    res.redirect("/admin/permissions")
})
router.post("/complaints/:id/resolved", async (req, res) => {
    const {id} = req.params
    const complaint = await Complaint.findOne({_id: id})
    complaint.status = "Resolved"
    const savedComplaint = await complaint.save()
    console.log(savedComplaint)
    res.redirect("/admin/complaints")
})



module.exports = router;