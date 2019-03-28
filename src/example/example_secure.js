const secure = require("../Util/secure");
const stream = require("stream");

//setup the function called once the cipher is created
let cipher_created = (cipher) => {
    //setup our encryption and decryption output streams
    let enc_output = new stream.Writable({
        write(chunk,encoding,callback){
            enc_write(chunk,encoding,callback);
        }
    });
    let dec_output = new stream.Writable({
        write(chunk,encoding,callback){
            dec_write(chunk,encoding,callback);
        }
    });

    //setup the write functions for these streams
    let enc_output_string = "";
    let dec_output_string = "";
    let enc_write = (chunk,encoding,callback) => {
        enc_output_string += chunk.toString();
        dec_input.write(chunk);//write the output to the decryption stream
        callback();
    };
    let dec_write = (chunk,encoding,callback) => {
        dec_output_string += chunk.toString();
        callback();
    };

    //setup the decryption and encryption inputs
    let enc_input = cipher.encrypt(enc_output);
    let dec_input = cipher.decrypt(dec_output);

    //setup the finishing functions
    enc_output.on("finish",() => {
        console.log(enc_output_string);
        dec_input.end();
    });
    dec_output.on("finish",() => console.log(dec_output_string));

    //write some data to the encryption pipe
    enc_input.write("Howdy! ");
    enc_input.end("It's all ogre now");
};

//Create our cipher with password "password"
secure.create_cipher(cipher_created,"password");