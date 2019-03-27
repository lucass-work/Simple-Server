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
    aes_type : "aes-162-cbc",
    salt_length : 48,
    key_length : 128,
    iv_length : 48,
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
 * @param algorithm the algorith to use, default is AES 162
 */
function create_cipher(callback, password, algorithm = default_options.aes_type){
    //generate random salt for key production
    let salt = random(default_options.salt_length);

    //Handle cipher creation once scrypt completed
    let make_cipher = (key) => {
        let iv = random(48);
        let cipher = crypto.createCipheriv(algorithm,key,iv);
        let cipher_options = {
            key : key,
            password : password,
            salt : salt,
            iv : iv,
            algorithm : algorithm,
        };

        return new cipher(cipher,cipher_options);
    };

    //create the key via scrypt
    let key = crypto.scrypt(password,salt,default_options.key_length,(err,derivedKey) => {make_cipher(derivedKey)});
}

/**
 * Create a cipher object based upon initial cipher options.
 * @param cipher_options the options to be used to produce the cipher object.
 */
function load_cipher(cipher_options){
    let {algorithm,password,iv,salt} = cipher_options;

    //create cipher once scrypt finishes.
    let make_cipher = (key) => {
        let cipher = crypto.createCipheriv(algorithm,key,iv);

        return new cipher(cipher,{
            key : key,
            ...cipher_options
        });
    };

    //create the key via scrypt
    let key = crypto.scrypt(password,salt,default_options.key_length,(err,derivedKey) => {make_cipher(derivedKey)});
}

class cipher{
    constructor(cipher,cipher_options){
        let options = this.cipher_options = cipher_options;
        this.cipher = cipher;
        this.decipher = crypto.createDecipheriv(options.algorithm,options.key,options.iv);
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

        let write_stream = new stream.Writable();

        write_stream.pipe(this.cipher).pipe(output_stream);
        return write_stream;
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

        let write_stream = new stream.Writable();

        write_stream.pipe(this.decipher).pipe(output_stream);
        return write_stream;
    }

}

/*
Asymmetric Encryption
 */

