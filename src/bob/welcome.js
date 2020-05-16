import React, {useState} from 'react';

import './_welcome.scss';

const Welcome = () => {
    return <div className='bob-welcome'>
        <img src={require('../../imgs/bob/assistant.svg')} />
        <img className='bob-says-hi' src={require('../../imgs/bob/bobsayshi.svg')} />
        <h2>Hi there!</h2>
        <span>Ask me some question!</span>
    </div>
}

export default Welcome;