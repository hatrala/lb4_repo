import {connect} from 'amqplib/callback_api';


connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
     connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        const queue = "userqueue"
        
        channel.assertExchange('logs', 'fanout',
        {durable: false})

        // console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

         channel.consume(queue, function(msg) {
            // console.log(" [x] Received %s", msg!.content.toString());
            // console.log(JSON.parse(msg!.content.toString()));
            console.log(JSON.parse(msg!.content.toString()));

            // return  JSON.parse(msg!.content.toString())

        }, {
            noAck: true
        });
    });
    // setTimeout(function() {
    //   connection.close();
    //   process.exit(0);
    //   }, 500);
    });
