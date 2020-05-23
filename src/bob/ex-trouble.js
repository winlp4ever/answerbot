import React, { useState, useEffect } from 'react';
import {postForData} from '../utils';

import Actions, {postActionMsg} from './actions'
import './_ex-trouble.scss'

const ExTrouble = ({content}) => {
    const [errAvailable, setErrAvailable] = useState(false)
    const [msg, setMsg] = useState('')

    const _retrieveMsg = async () => {
        if (content.type == 'exercise-err-message')
            setMsg(await postActionMsg(Actions.SHOWHELP))
        else 
            setMsg(await postActionMsg(Actions.SHOWCOMMONERRORS))
    }

    useEffect(() => {
        _retrieveMsg()
    }, [])

    return <div className='ex-trouble'>
        <div className='chat'>
            <span className='text'>{msg}</span>
        </div>
        {content.type == 'exercise-err-message'? <div className='err-msgs'>
            <span 
                className='err-msg' 
            > 
                <img src={require('../../imgs/bob/err.svg')} />
                {content.text}
            </span>
        </div>: <div className='err-msgs'>
            {content.answer.map((m, id) => {
                    if (m.error_code_message) 
                        return <span key={id} className='err-msg'>
                            <img src={require('../../imgs/bob/err.svg')} />
                            {m.error_code_message}
                        </span>
                    return null;
                }
            )}
        </div>}
    </div>
}

export default ExTrouble