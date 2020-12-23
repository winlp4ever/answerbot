import React, { useState, useContext } from 'react'

import { request } from '../utils'
import {userContext} from '../user-context/user-context'

import { v4 as uuidv4 } from 'uuid'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import Button from '@material-ui/core/Button'
import { Check, X, Inbox } from 'react-feather'
import './_teacher-request.scss'

import { BOB_API_ENDPOINT } from '../variables'

const TeacherRequest = (props) => {
    const [wantToSend, setWantToSend] = useState(false)
    const [sent, setSent] = useState(false)
    const [msg, setMsg] = useState(props.q)
    const [foc, setFoc] = useState(false)
    const user = useContext(userContext).user

    const toggleFocus = () => setFoc(!foc)
    const toggleMode = () => setWantToSend(!wantToSend)
    const handleChange = (e) => {
        setMsg(e.target.value)
    }
    const sendReq = async () => {
        let data = await request(`${BOB_API_ENDPOINT}/message`, 'post', {
            from_user_id: user.userid,
            msg_type: 'question',
            content: msg,
            sent_at: new Date()
        })
        setSent(true)
    }
    if (!wantToSend) return <Button 
        className='text ask-req' 
        onClick={toggleMode}
        startIcon={<Inbox />}
    >
        <span>Ask Teachers</span>
    </Button>
    return <div className={'ask-request' + (foc? ' focus': '')}>
        {!sent ? <div>
            <h4>My Question</h4>
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
                        Send
                    </span>
                </Button>
                <Button 
                    onClick={toggleMode}
                    startIcon={<X/>}
                    className='cancel'
                >
                    <span>
                        Cancel
                    </span>
                </Button>
            </div>
        </div>: <div>
            <span className='text'>
                The Question has been sent.
            </span>
        </div>}
        
    </div>
}

export default TeacherRequest