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
