"use strict";

/*
Allows for dyanimc browser-side modification of the html.
 */

/**
 * Create a new HTML element
 * @param tag the tag of the element
 * @param attributes an object containing key value pairs of tag attributes
 */
export function create_element(tag,attributes){
    let element = document.createElement(tag);

    //set the attributes
    if(attributes) {
        for (let key of Object.keys(attributes)) {
            element.setAttribute(key, attributes[key]);
        }
    }

    return element;
}

/**
 * Append a new HTML element to the body of the document
 * @param element
 * @param parent the parent object to add to , default is document.body
 */
export function append_element(element,parent = document.body){
    parent.appendChild(element);
}

/**
 * Remove an HTML element by id from the body of the document.
 * @param id
 * @param parent the parent object for which we check the scope of this object from. By default document.body.
 */
export function remove_element(id,parent = document.body){
    let element = document.getElementById(id);

    if(!parent.contains(element)){
        console.error("Cannot remove element from body that is not a child of the body.");
        return;
    }

    parent.removeChild(element);
}