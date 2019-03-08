let tls = require("../TLS/tls_server");
let tls_client = require("../TLS/tls_client");
let fs = require('fs');

//setup our options with the server port, private and public key.
let options = {
    key : fs.readFileSync("example_key.pem"),
    cert : fs.readFileSync("example_cert.pem"),

    port : 8080,
};

//create our connection event.
let on_connection = (connection)=>{
    console.log("new connection");

    //add a new message event for command "ping"
    connection.add_message_event("ping",()=>{console.log("ping")});
};

//create the server and assign the connection event.
let server = new tls.tls_server(options);
server.set_connection_event(on_connection);

/*
Client
 */

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