"use strict";

/*
To be included in your web side client as a module
 */

class ws_connection{
    constructor(socket){
        this.socket = socket;

        //setup socket events
        socket.onmessage = this.on_message;
        socket.onerror = (error) => console.log(error);

        //setup events
        this.events = [];
    }

    /**
     * Execute functions given by the message.
     * @param message
     */
    on_message(message){
        let data;

        //Convert the JSON message to an array
        try{
            data = JSON.parse(message.data.toString());
        }catch {
            console.log("Incorrectly formatted JSON: " + message.toString());
            return;
        }

        //execute the received from commands:
        for(let event of data) {
            for (let possible_event of this.events) {
                if (possible_event.cmd === event.cmd) {
                    possible_event.action(event.data);
                    break;
                }
            }
        }
    }

    /**
     * Add a message event
     * @param command the command to listen for
     * @param action the function to be executed, has message.data passed as its only arguement.nn
     *
     */
    add_message_event(command,action){
        this.events.push({
            cmd : command,
            action : action,
        })
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
}

/**
 * returns
 * @param address
 * @returns {ws_connection}
 */
function connect_to_ws_server(address){
    return new ws_connection(new WebSocket(address));
}