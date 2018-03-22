const accountSid = 'ACa241242dc141e1080a32356d9995ac6d';
const authToken = 'e2da70825afdd3745029197b19ab41fe';

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
    to: '+919699727877',
    from: '+12672148944',
    body: 'The vehicle registered to this number was caught breaking the signal on 20-03-2018',
  })
  .then(message => console.log(message.sid), error => console.error(error));
