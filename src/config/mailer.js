
require("dotenv").config();
const nodemailer = require("nodemailer");


const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,             
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,                           
  auth: {
    user: process.env.SMTP_USER,            
    pass: process.env.SMTP_PASS,         
  },
});

module.exports = mailer;
