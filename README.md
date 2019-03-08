# Simple-Server
Very easy to use TLS, WS, WSS , HTTP/S servers and clients.

# Setup
## WS
Here is an example of a websocket server:

```Javascript
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
```

We can add message events to this server, these events occur when a message is received by a ws_connection object, eg:

```javascript
//Setup the message event
let message_event = {
    cmd : "ping",
    action : ping,
};

//create the ping function
function ping(data){
    console.log(`ping! : ${data}`);
}

//create the on_connect function
on_connect = (connection)=>{
  connections.push(connections);
  console.log("A client has connected);
  
  //add our event
  connection.add_message_event(message_event);
  //alternatively
  connection.add_message_event("ping",ping);
};
```

- This is identical for TLS, WSS servers and for the ws_module for browser-side javascript. -

## TLS

Setting up the TLS server requires you to create a certificate and private key initially and create an options object
containing your host information like so.

```javascript
//establish a connection to this server
let connection_options = {
    key : fs.readFileSync("example_client_key.pem"),
    cert : fs.readFileSync("example_client_cert.pem"),

    host : "localhost",
    port : 8080,
};

let connection = tls_client.connect(connection_options);

//tls_client.connect returns a tls_connection object so we can assign message events 
connection.add_message_event("ping",()=>{ console.log("message received") });
```

# TODO:
* Adds Secure websockets and HTTP/S
* Add default message events, added to all incoming connections.
