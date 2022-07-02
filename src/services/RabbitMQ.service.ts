import {repository} from '@loopback/repository';
import { connect } from 'amqplib/callback_api';
// import {User} from '../models';
import {UserRepository} from '../repositories';
export class Proceducer {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ){}

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 async sendToQueue (content:any, queue:string): Promise<void>  {

  connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }


        channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)));
        // console.log(content.toString());

        // console.log(" [x] Sent %s", msg);
    });
      // setTimeout(function() {
      //     connection.close();
      //     process.exit(0);
      // }, 500);
    });
  }

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 async receiveFromQueue(queue:string): Promise<any> {
   connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
     connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        channel.assertQueue(queue, {
            durable: false
        });

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

 }

}
