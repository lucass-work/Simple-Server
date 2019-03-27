let express = require("express");

class static_express_server{
    /**
     * Creates an express server that serves static HTML.
     * @param port the port to listen on
     * @param path the path of the webpage files.
     */
    constructor(port, path){
        let app = this.app = express();
        app.use(express.static(path));
        app.listen(port);
    }
}

module.exports = {
    static_express_server : static_express_server,
};