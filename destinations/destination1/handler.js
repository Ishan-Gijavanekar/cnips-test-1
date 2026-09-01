const sgMail = require('@sendgrid/mail')

module.exports = {    
    execute: async function(event, ctx, config) { /* required */
        sgMail.setApiKey(config.SENDGRID_API_KEY);
        const msg = {        
            from: config.EMAIL_FROM,
            template_id: config.TEMPLATE_ID,
            personalizations: [
                {                    
                    "to": [
                        {
                        "email": event.mail_to
                        }
                    ],
                    "dynamic_template_data": {
                        "firstName": event.firstName,
                        "lastName": event.lastName
                    }
                },
            ],
        };

        try {
            await sgMail.send(msg)
        } catch(error) {
            console.log("Failed to send email", error);
            throw "Failed to send via Sendgrid";
        }

    }
}