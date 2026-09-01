const sgMail = require('@sendgrid/mail')

module.exports = {  
     setup: function(config) { /* optional */
        //setup connection
    },
    execute: async function(event, ctx, config) { /* required */
        sgMail.setApiKey("config.SENDGRID_API_KEY");
        const msg = {
            to: event.mail_to,
            from: "a@a.com",
            subject: 'Sending with SendGrid is Fun',
            text: 'and easy to do anywhere, even with Node.js',
            html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        }        

        await  sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent successfully!');
        })
        .catch((error) => {
            console.error('Error sending email:', error);
        });

    },
    teardown: function(config) { /* optional */
        //teardown connection
    }
}