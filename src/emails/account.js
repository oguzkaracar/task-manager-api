const sgMail = require("@sendgrid/mail");

require('dotenv').config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name)=>{
 
    sgMail.send({
        to:email,
        from:'ozzykara41@gmail.com',
        subject:'Welcome to the app',
        text:`Merhaba ${name} nasılsınız. Uygulamamıza hoşgeldiniz.`,
    })
}

const sendCancelationEmail = (email,name) =>{
    sgMail.send({
        to:email,
        from:'ozzykara41@gmail.com',
        subject:'Goodbye, thanks for everything',
        text:`Merhaba ${name}. Hesabınız silinmiştir. Tekrar bekleriz...`,
    })
}

module.exports ={
    sendWelcomeEmail,
    sendCancelationEmail

}