let tls_server = require('./tls_server');
let tls = require('tls');

/**
 * Connect to a tls server
 * @param options the options to connect with.
 */
function connect(options){
    let socket = tls.connect(options);
    return new tls_server.tls_connection(socket,-1);
}

module.exports = {
    connect : connect,
};

