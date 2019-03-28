/*
Security utils.
 */

const csprng = require('csprng');
const crypto = require('crypto');
const stream = require('stream');

/*
The default set of options to use for crypto here
 */

let default_options = {
    csprng_bits : 256,
    csprng_base : 2,
    aes_type : "aes-192-cbc",
    salt_length : 48,
    key_length : 24,//if using aes-x-cbc this must be x/8
};

/**
 * Set the default options to use for this module.
 * Types:
 * csprng_bits : integer
 * csprng_base : integer 2-36
 * aes_type : string
 *
 * @param options
 */
function set_options(options){
    this.default_options = options;
}

/*
Random number generation
 */

/**
 * returns a random number, by default returns 256 bits base 2.
 * @param bits bit length of the number
 * @param base base of the random number
 * @returns {string}
 */
function random(bits = default_options.csprng_bits, base = default_options.csprng_base){
    return csprng(bits,base);
}

/**
 * returns a random number that is not an element of the parsed list.
 * @param list
 * @param bits
 * @param base
 */
function random_exclude(list, bits = default_options.csprng_bits, base = default_options.csprng_base ){
    let generated = false;
    let random_number;

    while(!generated){
        random_number = random(bits,base);
        if(!list.contains(random_number)){
            return random_number;
        }
    }
}

/*
Symmetric Encryption
 */

/**
 * Creates a new cipher object and returns the generated key, cipher object and initialisation vector.
 * @param callback called once generated.
 * @param password the password to be used
 * @param algorithm the algorith to use, default is AES 192
 */
function create_cipher(callback, password, algorithm = default_options.aes_type){
    //generate random salt for key production
    let salt = random(default_options.salt_length);

    //Handle cipher creation once scrypt completed
    let make_cipher = (key) => {
        let iv = random(16 * 4, 16);
        let created_cipher = crypto.createCipheriv(algorithm,key,iv);
        let cipher_options = {
            password : password,
            salt : salt,
            iv : iv,
            algorithm : algorithm,
        };

        callback(new cipher(created_cipher,cipher_options,key));
    };

    //create the key via scrypt
    crypto.scrypt(password,salt,default_options.key_length,(err,derivedKey) => {make_cipher(derivedKey)});
}

/**
 * Create a cipher object based upon initial cipher options.
 * @param cipher_options the options to be used to produce the cipher object.
 */
function load_cipher(callback,cipher_options){
    let {algorithm,password,iv,salt} = cipher_options;

    //create cipher once scrypt finishes.
    let make_cipher = (key) => {
        let cipher = crypto.createCipheriv(algorithm,key,iv);

        callback(new cipher(cipher,{
            key : key,
            ...cipher_options
        }));
    };

    //create the key via scrypt
    crypto.scrypt(password,salt,default_options.key_length,(err,derivedKey) => {make_cipher(derivedKey)});
}

class cipher{
    constructor(cipher,cipher_options,key){
        let options = this.cipher_options = cipher_options;
        this.key = key;//this buffer refuses to be parsed inside of cipher_options...
        this.cipher = cipher;
        this.decipher = crypto.createDecipheriv(options.algorithm,key,options.iv);
    }

    /**
     * Get the cipher/decipher objects
     * @returns {*}
     */
    get_cipher(){
        return {
            cipher : this.cipher,
            decipher : this.decipher,
        };

    }

    /**
     * Get cipher options
     * @returns {*}
     */
    get_certificate(){
        return this.cipher_options;
    }

    /**
     * Encrypt a stream of data
     * @param output_stream the encrypted output stream
     * @returns write stream, input for the encryption.
     */
    encrypt(output_stream){
        if(!this.cipher.writable){
            console.log("Cannot write to cipher.");
            return null;
        }

        this.cipher.pipe(output_stream);
        return this.cipher;
    }

    /**
     * Decrypt a stream of data
     * @param output_stream the decrypted output stream
     * @returns write stream, input for encrypted text.
     */
    decrypt(output_stream){
        if(!this.decipher.writable){
            console.log("Cannot write to decipher.");
            return null;
        }

        this.decipher.pipe(output_stream);
        return this.decipher;
    }

    /**
     * Renews the current cipher with already set key and password.
     */
    renew(){
        let {algorithm , key , iv} = this.cipher_options;
        this.cipher = crypto.createCipheriv(algorithm,key,iv);
    }

}

/*
Asymmetric Encryption
 */



/*
Exports
 */

module.exports = {
    set_options : set_options,
    random : random,
    random_exclude : random_exclude,
    create_cipher : create_cipher,
    load_cipher : load_cipher,
};

