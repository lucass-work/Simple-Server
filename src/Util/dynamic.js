"use strict";

/*
Allows for dyanimc browser-side modification of the HTML body
 */

/**
 * Create a new HTML element
 * @param tag the tag of the element
 * @param attributes an object containing key value pairs of tag attributes
 */
function create_element(tag,attributes){
    let element = document.createElement(tag);

    //set the attributes
    for(let key of Object.keys(attributes)){
        element.setAttribute(key, attributes[key]);
    }

    return element;
}

/**
 * Append a new HTML element to the body of the document
 * @param element
 */
function append_element(element){
    document.body.appendChild(element);
}

/**
 * Remove an HTML element by id from the body of the document.
 * @param id
 */
function remove_element(id){
    let element = document.getElementById(id);

    if(!document.contains(element)){
        console.error("Cannot remove element from body that is not a child of the body.");
        return;
    }

    document.body.removeChild(element);
}