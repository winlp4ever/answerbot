import React, { useState, useEffect, useRef } from 'react';

var cnt = 0

export function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
        }
    }, [delay]);
}

export function getCurrentTime(minimum=false) {
    const t = new Date();
    const month = t.toLocaleString('default', { month: 'short' });
    const timeZoneOffset = parseInt(t.getTimezoneOffset()/(-60))
    if (minimum) return `${t.getDate()} ${month} ${t.getFullYear()} ${t.getHours()}:${t.getMinutes()}`
    return `${t.getDate()} ${month} ${t.getFullYear()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()} GMT${(timeZoneOffset>0? '+': '') + timeZoneOffset}`
}

export function dateToString(d) {
    // transform a date string to a string of local time date
    const t = new Date(d);
    console.log(d);
    const month = t.toLocaleString('default', { month: 'short' });
    const timeZoneOffset = parseInt(t.getTimezoneOffset()/(-60))
    return `${t.getDate()} ${month} ${t.getFullYear()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()} GMT${(timeZoneOffset>0? '+': '') + timeZoneOffset}`
}

export async function postForData(endpoint, dict={}) {
    let response = await fetch(endpoint, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dict)
    });
    let data = await response.json();
    return data;
}

export async function request(endpoint, method, json={}) {
    let body = JSON.stringify(json)
    let req = {
        method: method,
        headers: {'Content-Type': 'application/json'}
    }
    if (!['get', 'GET'].includes(method)) {
        req.body = body
    } 
    let response = await fetch(endpoint, req);
    let data = await response.json();
    return data;
}
