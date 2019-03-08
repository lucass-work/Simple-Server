let tls = require('tls');
let fs = require('fs');

//The TLS server.
class tls_server{
    /**
     * Creates a new TLS server
     * @param options the options used to create the TLS server
     * @param connection_callback called upon new client connection.
     */
    constructor(options, connection_callback){
        this.clients = [];
        this.current_id = 0;
        this.ext_on_connection = connection_callback;

        //Handle client connection.
        let on_connection = (socket) =>{
            let client = this.add_client(socket);
            this.ext_on_connection(client);
        };

        //Create the Server
        this.server = tls.createServer(options,on_connection);
        this.server.listen(options.port);
    }

    /**
     * Set the function to be called on client connection
     * @param event the function to be called, passed the connection as its argument.
     */
    set_connection_event(event){
        this.ext_on_connection = event;
    }
z
    /**
     * Create a new client with the given socket and assign it a free id.
     * @param socket
     * @returns {tls_connection}
     */
    add_client(socket){
        let id = this.current_id ++;
        let client = new tls_connection(socket,id);

        this.clients.push(client);
        return client;
    }

    /**
     * Remove a client from the list of clients. Does not disconnect client.
     * @param client
     */
    remove_client(client){
        let clients = this.clients;
        let index = clients.indexOf(client);

        if(index === -1){
            console.log("Cannot remove client as no such client exists");
            return;
        }

        clients.splice(index,1);
    }

    /**
     * Disconnect a client. Removes client aswell.
     */
    disconnect_client(client){
        client.disconnect();
        this.remove_client(client);
    }

    /**
     * Returns the client with matching ID.
     */
    get_client(id){
        let index = this.clients.indexOf(id);

        if(index === -1){
            console.log("Cannot get client with ID " + id);
            return null;
        }

        return this.clients[index];
    }
}

//The class representing the connected TLS client.
class tls_connection{
    constructor(socket,id){
        this.socket = socket;
        this.id = id;

        //Setup external callbacks which can be set by the user.
        this.ext_on_close = (connection) => {};
        this.ext_on_connect = (connection) => {};

        //Setup socket events:
        socket.on("data",(data)=> this.on_data(data));
        socket.on("error",(err)=> console.log(err.toString()));
        socket.on("secureConnect",() => this.ext_on_connect(this));
        socket.on("close",()=> this.disconnect());

        //Setup message events:
        this.events = [];
    }

    /**
     * Add a message event to be performed when command is received on this socket.
     * @param command the command to be listening for.
     * @param action the action to be called. Called with parameter data.
     */
    add_message_event(command,action){
        this.events.push({
           cmd : command,
           action : (data) => action(data),
        });
    }

    /**
     * Remove a message event with matching command.
     * @param command
     */
    remove_message_event(command){
        let events = this.events;
        let index = -1;

        for(let i = 0; i < events.length;i++){
            if(events[i].cmd === command){
                index = i;
                break;
            }
        }

        if(index !== -1){
            events.splice(index,1);
        }
    }

    /**
     * Execute a set of events given a list of responses from the server/client.
     * Data is an array of message events, a message event is an object of the following form
     * {
     *     cmd : the command name
     *     data : data sent with the command.
     * }
     * @param data
     */
    on_data(data){
        let message;

        //Attempt to reformat to a list of message events.
        try{
            message = JSON.parse(data.toString());
        }catch{
            console.log("Incorrectly formatted JSON received on tls socket:" + data.toString());
            return;
        }

        //Execute the received event if it exists.
        let command_found;
        for(let event of message){
            command_found = false;

            for(let possible_event of this.events){
                if(possible_event.cmd === event.cmd){
                    possible_event.action(event.data);
                    command_found = true;
                    break;
                }
            }

            if(!command_found){
                console.log(`No event matching command : ${event.cmd}`);
            }
        }
    }

    /**
     * Destroy the current socket.
     */
    disconnect(){
        this.socket.destroy();
        this.socket = null;
        this.ext_on_close(this);
    }

    /**
     * Sends object in JSON format to the client.
     * @param object
     */
    send(object){
        //check the socket exists
        if(!this.socket){
            console.log("Cannot send along non-existant socket");
            return;
        }

        //send the data
        this.socket.write(JSON.stringify(object));
    }

    /**
     * Send an array of objects
     * @param objects
     */
    send_list(objects){
        for(let object of objects){
            this.send(object);
        }
    }

}

module.exports = {
    tls_server : tls_server,
    tls_conneciton : tls_connection,
};