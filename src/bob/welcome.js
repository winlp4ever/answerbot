import React, {useState, useEffect} from 'react';

import './_welcome.scss';
import Bob from '../../imgs/bob/_bob.svg';

const Welcome = () => {
    const [msg, setMsg] = useState('')

    const _retrieveMsg = async () => {
        setMsg('Hi, have a question? Just ask me!!!')
    }
    useEffect(() => {
        _retrieveMsg();
    }, [])

    return <div className='bob-welcome'>
        <Bob />
        <h2>{msg}</h2>
    </div>
}

export default Welcome;