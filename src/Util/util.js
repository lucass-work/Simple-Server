"use strict";

/*
For use in the javascript document, adds some useful functionality.
 */

/**
 * returns document element by id
 * @param id
 * @returns {HTMLElement}
 */
export function get_el(id){
    return document.getElementById(id);
}

/**
 * returns the value of a cookie by name
 * @param name
 * @returns {any}
 */
export function get_cookie(name){
    let pair = document.cookie.match(new RegExp(name + '=([^;]+)'));
    return !!pair ? pair[1] : null;
}

/**
 * set a cookie by name, expires 1 month from cookie creation.
 * @param name
 * @param value
 */
export function set_cookie(name,value){
    let now = new Date(); //get the current date
    now.setMonth(now.getMonth() + 1); //add one month to it
    document.cookie = `${name}=${value}; expires=${now.toUTCString()}`;
}

/**
 * Delete a cookie by name
 * @param name
 */
export function delete_cookie(name){
    document.cookie = `${name}= ; expires= Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Overwrite an existing cookie.
 * @param name
 * @param value
 */
export function overwrite_cookie(name,value){
    delete_cookie(name);
    set_cookie(name,value);
}

/**
 * redirect to the given address
 * @param address
 */
export function redirect(address){
    window.location.href = address;
}

