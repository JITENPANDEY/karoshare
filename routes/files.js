const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName)
    },
});

let upload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 }
}).single('myfile'); //100mb

router.post('/', (req, res) => {
    //store files in upload folders
    upload(req, res, async (err) => {
        //validate requests

        // if file is not there,
        if (!req.file) {
            return res.json({ error: "All fieids are required" });
        }

        if (err) {
            return res.status(500).send({ error: err.message });
        }
        // store data in database
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });
        //response -> download link
        const response = await file.save();
        res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
        //e.g-> http://localhost:3000/files/3211dcfdscf-41654cdccdds
    });
});

router.post('/send', async (req,res) => {

    const {uuid,emailTo,emailFrom} = req.body
    //validate
    if(!uuid || !emailTo || !emailFrom){
        return res.status(422).send({error:"All fields are required"})
    }

    // get data from database
    const file = await File.findOne({ uuid: uuid });
    if(file.sender){
        return res.status(422).send({error:"Email already sent"})
    }


    file.sender = emailFrom;
    file.reciever = emailTo;

    const response = await file.save();

    //send Emails
    const sendMail = require('../services/emailService')
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject:"karoshare file sharing",
        text: `${emailFrom} sent you a file`,
        html: require('../services/emailTemplate')({ 
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: parseInt(file.size/1000) + 'KB',
            expires:'24 hours'
        }) // recieve a function
    })
    return res.send({success:"Email sent"})
})

module.exports = router;