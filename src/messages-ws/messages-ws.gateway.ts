import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';


@WebSocketGateway({cors: true, namespace: '/'})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService, 
    private readonly jwtService: JwtService
    ) {}

  async handleConnection(client: Socket) {
    // console.log('Cliente conectado', client.id);
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return
    }
    // console.log({payload});
        
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
    
    
  }
  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado', client.id);
    this.messagesWsService.removeClient(client.id);

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());

  }

  @SubscribeMessage('message-form-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto ){

    // emite unicamente al cliente
    // client.emit('messages-from-server', {
    //   fullname: 'Soy yo',
    //   message: payload.message ||'no-message'
    // })

    // emite a todos menos, al cliente inicial
    // client.broadcast.emit('messages-from-server', {
    //   fullname: 'Soy yo',
    //   message: payload.message ||'no-message'
    // })
    
    this.wss.emit('messages-from-server', {
      fullName: this.messagesWsService.getUserFullNameBySocketId(client.id),
      message: payload.message ||'no-message'
    })
  }

}
