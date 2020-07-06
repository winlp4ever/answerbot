import React, { useState, useContext } from 'react'

import { postForData } from '../utils'
import {userContext} from '../user-context/user-context'

import { v4 as uuidv4 } from 'uuid'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import Button from '@material-ui/core/Button'
import { Check, X, Inbox } from 'react-feather'
import './_ask-request.scss'

const AskRequest = (props) => {
    const [wantToSend, setWantToSend] = useState(false)
    const [sent, setSent] = useState(false)
    const [msg, setMsg] = useState(`Bonjour,
Je voudrais savoir: 
"${props.q}"
Merci,`)
    const [foc, setFoc] = useState(false)
    const user = useContext(userContext).user

    const toggleFocus = () => setFoc(!foc)
    const toggleMode = () => setWantToSend(!wantToSend)
    const handleChange = (e) => {
        setMsg(e.target.value)
    }
    const sendReq = async () => {
        let data = await postForData('/ask-teachers', {
            userid: user.userid,
            uuid: uuidv4(),
            q: msg
        })
        console.log(data)
        setSent(true)
    }
    if (!wantToSend) return <Button 
        className='text ask-req' 
        onClick={toggleMode}
        startIcon={<Inbox />}
    >
        Demandez aux profs
    </Button>
    return <div className={'ask-request' + (foc? ' focus': '')}>
        {!sent ? <div>
            <h4>Mon message</h4>
            <TextareaAutosize 
                onChange={handleChange}
                defaultValue={msg}
                onFocus={toggleFocus}
                onBlur={toggleFocus}
            />
            <div className='send-or-cancel'>
                <Button 
                    onClick={sendReq}
                    startIcon={<Check/>}
                    className='send'
                >
                    <span>
                        Envoyer
                    </span>
                </Button>
                <Button 
                    onClick={toggleMode}
                    startIcon={<X/>}
                    className='cancel'
                >
                    <span>
                        Annuler
                    </span>
                </Button>
            </div>
        </div>: <div>
            <span className='text'>
                La question a été envoyée. Vous serez notifié quand la réponse vienne
            </span>
        </div>}
        
    </div>
}

export default AskRequest