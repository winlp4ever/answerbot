import React, {useState, useContext, useEffect, useRef} from 'react'
import {userContext} from '../user-context/user-context'

import Button from '@material-ui/core/Button'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import {useInterval, getCurrentTime, postForData} from '../utils'

import SendIcon from '../../imgs/bob/send.svg'
import io from 'socket.io-client'
var cnt = 0

import './_new-chat.scss'

const Hints = ({hints, applyHint, autoComplete}) => {
    const [focus, setFocus] = useState(-1)

    const toggleHint = (i) => {
        setFocus(i)
    }

    return <div className='question-hints'>
        {hints.map((h, id) => <div 
            key={id} 
            className={'hint' + (focus==id? ' focus': '') + (autoComplete-1 == id? ' auto-complete': '')}
            onMouseEnter={_ => toggleHint(id)}
            onMouseLeave={_ => toggleHint(-1)}
            onClick={_ => applyHint(h.text)}
        >
            <span 
                dangerouslySetInnerHTML={{__html: (h.rep != '-' ? h.text: `<a>@${h.text}</a>`)}} 
            />
            <span className='similarity-score'>{`${parseInt((h.score-1.25)*4/3 * 100)}%`}</span>
        </div>)}
    </div>
}

const socket = io()

const NewChat = (props) => {
    const [newchat, setNewchat] = useState('')
    const [viewHints, setViewHints] = useState(true)
    const [autoComplete, setAutoComplete] = useState(0)
    const [focus, setFocus] = useState(false)
    const [askForHints, setAskForHints] = useState(false)
    const [hints, setHints] = useState([])

    const input = useRef(null)
    const sending = useRef(null)
    const user = useContext(userContext).user

    useInterval(async () => {
        if (askForHints) {
            let data = await postForData('https://bobtva.theaiinstitute.ai:5600/post-hints', {
                conversationID: user.userid,
                typing: newchat,
                timestamp: new Date().getTime()
            })

            setHints(data.hints)
            setAskForHints(false)
        }
    }, 100)

    const viewHideHints = () => {
        setViewHints(!viewHints)
        input.current.focus()
    }

    const handleChange = (e) => {
        setNewchat(e.target.value)
        if (e.target.value.length == 7) setViewHints(true)
        if (!askForHints) setAskForHints(true)
    }

    const handleAutoComplete = () => {
        if (viewHints & autoComplete >= 0 & autoComplete < props.hints.length) {
            setNewchat(props.hints[autoComplete].text)
            input.current.value = props.hints[autoComplete].text
        }
    }

    const applyHint = (h) => {
        const nc = {
            time: getCurrentTime(true),
            user: user,
            type: 'chat',
            text: h
        }
        props.socket.emit('ask-bob', {
            chat: nc,
            conversationID: user.userid
        })
        setNewchat('')
        input.current.value = ''
    }

    const send = () => {
        if (newchat == '') return
        const nc = {
            time: getCurrentTime(true),
            user: user,
            type: 'chat',
            text: newchat
        }
        props.socket.emit('ask-bob', {
            chat: nc,
            conversationID: user.userid,
        })
        setNewchat('')
        input.current.value = ''
    }

    const handleKeyDown = (e) => {
        let keycode = e.keyCode || e.which
        if (keycode == 13) {
            e.preventDefault()
            sending.current.click()
        }
        else if (keycode == 9) {
            e.preventDefault()
            if (autoComplete >= props.hints.length) setAutoComplete(0)
            else {
                setAutoComplete(autoComplete + 1)
                handleAutoComplete()
            }
        }
        else if (keycode == 27) {
            e.preventDefault()
            setViewHints(false)
        }
    }
    if (!user.userid) return null;
    return <div className={'new-chat' + (focus? ' focus': '')}>
        {
            (viewHints & newchat != '' & newchat != ' ' & hints.length > 0)?
             <Hints 
                hints={hints} 
                applyHint={applyHint} 
                autoComplete={autoComplete}
            />: null
        } 
        <TextareaAutosize
            ref={input}
            placeholder='entrez une question'
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={'enter-question' + (newchat.length > 0? ' textin': '')}
            onFocus={_ => setFocus(true)}
            onBlur={_ => setFocus(false)}
        />
        <Button onClick={send} ref={sending}>
            <SendIcon />
        </Button>
    </div>
}

export default NewChat