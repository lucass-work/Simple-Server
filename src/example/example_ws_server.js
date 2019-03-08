let ws_server = require('../WS/ws_server');

//setup a function handle initial connections;
let connections = [];

let on_connect = (connection)=>{
    console.log("A client has connected");
    connections.push(connections);
};

//create the ws_server and assign our on_connect function
let server = new ws_server({ port : 8080});
server.set_connection_event(on_connect);



//Setup the message event
let message_event = {
    cmd : "ping",
    action : ping,
};

//create the ping function
function ping(data){
    console.log(`ping! : ${data}`);
}

//add the message event to one of our connections
connections[0].add_message_event(message_event);

connections[1].add_message_event("ping", ping);
