let ws = require('ws');

class ws_server{
    constructor(options,connection_event){
        let server = this.server = new ws.Server(options);
        let connections = this.connections =  [];
        let client_id = 0;

        //setup external client events
        this.connection_event = connection_event;

        //handle server events
        server.on("connection" ,(socket,req)=> {
            let connection_info = {
                ip : req.connection.remoteAddress,
                id : client_id ++,
                server : this,
            };

            let connection = new ws_connection(socket,connection_info);

            connections.push(connection);
            connection_event(connection);
        });
        server.on("error", (err) => {console.log(err)});
    }

    /**
     * disconnect a specific socket with matching id.
     * @param id
     */
    disconnect(id){
        let connection = this.get_connection(id,true);

        if(connection){
            connection.disconnect();
        }
    }

    /**
     * Disconnect all currently connected clients.
     */
    disconnect_all(){
        for(let connection of this.connections){
            connection.disconnect();
        }

        this.cconnections = [];
        this.client_id = 0;
    }

    /**
     * get a connection with matching id.
     * @param id
     * @param remove default false, if true then the object will also be removed from the array.
     * @returns {*}
     */
    get_connection(id,remove = false){
        let index = -1;
        let connections = this.connections;

        for(let i = 0; i < connections.length; i++){
            if(connections[i].connection_info.id === id){
                index = i;
                break;
            }
        }

        if(index >= 0){
            if(remove){
                connections.splice(index,1);
            }

            return connections[index];
        }

        console.log(`Could not find connection with id ${id}`);
    }
}

class ws_connection{
    constructor(socket,connection_info){


        this.socket = socket;
        this.connection_info = connection_info;
        this.alive = false;

        //setup socket events
        socket.on("message",(message) => connection.on_message(message));

        //setup events
        this.events = [];
        let connection = this;

        this.add_message_event({
            cmd : "pong",
            action : () => {connection.alive=true},
        });

        //setup disconnection
        this.on_death = () => {};
        this.heartbeat();
    }

    /**
     * Execute functions given by the message.
     * @param message
     */
    on_message(message) {
        let data;

        //Convert the JSON message to an array
        try {
            data = JSON.parse(message.toString());
        } catch {
            console.log("Incorrectly formatted JSON: " + message.toString());
            return;
        }

        //execute the received from commands
        for (let event of data) {
            let event_found = false;

            for (let possible_event of this.events) {
                if (possible_event.cmd === event.cmd) {
                    possible_event.action(this,event.data);
                    event_found = true;
                    break;
                }
            }

            if(!event_found) {
                console.log(`No command found for : ${event.cmd}`);
            }
        }
    }

    /**
     * Add a message event
     * @param event the event to be added.
     */
    add_message_event(event){
        this.events.push(event);
    }

    /**
     * Remove a message event with matching command if it exists.
     * @param command
     */
    remove_message_event(command){
        let index = -1;
        let events = this.events;

        for(let i = 0 ; i < events.length;i++){
            if(events[i].cmd === command){
                index = i;
                break;
            }
        }

        if(index >= 0){
            events.splice(index,1);
        }
    }

    /**
     * Sends a single message of the form
     * {
     *     cmd
     *     data
     * }
     * @param message
     */
    send(message){
        this.send_list([message]);
    }

    /**
     * Accepts a list of messages to be sent of the form {
     *     cmd
     *     data
     * }
     * @param messages
     */
    send_list(messages){
        //check socket exists
        if(!this.socket) {
            console.log("cannot send list data on non-existant websocket");
            return;
        }

        if(this.socket.readyState === ws.CLOSED){
            return;
        }

        //setup error handling function
        let on_error = (err)=>{
            if(!err){
                return;
            }

            //handle an error
            console.log("Failed to send data on websocket: " + err);
        };

        //send the data
        this.socket.send(JSON.stringify(messages),on_error);
    }

    //Checks if the connection is still alive
    heartbeat(){
        let connection = this;

        connection.alive = false;
        connection.send({
            cmd : "ping",
        });

        //start the heartbeat
        setTimeout(() => {
            if(connection.alive){
                connection.heartbeat();
                return;
            }

            connection.on_death(connection);
        },500);
    }
}

module.exports = {
    ws_server : ws_server,
    ws_connection : ws_connection,
};