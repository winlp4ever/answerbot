import React, {useState, useEffect} from 'react';

import './_welcome.scss';

import Actions, {postActionMsg} from './actions';

import Bob from '../../imgs/bob/_bob.svg'

const Welcome = () => {
    const [msg, setMsg] = useState('')

    const _retrieveMsg = async () => {
        setMsg(await postActionMsg(Actions.ASKQUESTION))
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