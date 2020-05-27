import React, {Component, useState, useContext, useEffect, useRef} from 'react'
import ReactDOM, { findDOMNode } from 'react-dom'
import {userContext} from '../user-context/user-context'

import Button from '@material-ui/core/Button'
import StarsIcon from '@material-ui/icons/Stars'
import Sound from 'react-sound'

import './_ask.scss'
import MdRender from '../markdown-render/markdown-render'
import IsTyping from '../../sounds/is-typing.mp3'
import Lottie from 'react-lottie'
import TypingIcon from '../../imgs/typing.json'
import Welcome from './welcome'
import Actions, {postActionMsg} from './actions'
import ExTrouble from './ex-trouble'
import RelatedQuestions from './related-questions'
import NewChat from './new-chat'

class Typing extends Component {
    state = {
        times: 0
    }

    increment = () => {
        this.setState({times: this.state.times+1})
    }

    render() {
  
        const defaultOptions = {
            loop: true,
            autoplay: true,
            animationData: TypingIcon,
            rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
            }
        }
  
        return(
            <div className='is-typing'>
                {this.state.times < 2 && <Sound 
                    url={IsTyping} 
                    playStatus='PLAYING' 
                    onFinishedPlaying={this.increment}
                />}
                <Lottie options={defaultOptions} width={50}/>
            </div>
        )
    }
}
  
const Chat = ({content}) => {
    return <div className='chat'>
        <span className='text'>{content.text}</span>
        <span className='time'>{content.time}</span>
    </div>
}

const RateTheAnswer = () => {
    const [score, setScore] = useState(0)
    const [evalMsg, setEvalMsg] = useState('')

    const _retrieveMsg = async () => {
        setEvalMsg(await postActionMsg(Actions.EVALRESPONSE))
    }
    
    useEffect(() => {
        _retrieveMsg()
    }, [])

    return <div className='rating'>
        <span className='text'>
            <img src={require('../../imgs/bob/rating.svg')} />
            <b>{evalMsg}</b>&nbsp;
            <span className='rating-stars'>
                {[1, 2, 3, 4, 5].map(i => <i 
                    key={i}
                    onClick={_ => setScore(i)}
                    className={i <= score ? 'on': 'off'}
                >
                   {i <= score? <img src={require('../../imgs/bob/_star.svg')} />:
                   <img src={require('../../imgs/bob/star.svg')} />}
                </i>)}
            </span>
            
        </span>
    </div>
}



const Answer = ({content, socket, setIns}) => {
    const Us = useContext(userContext)

    let u = content.datetime in Us.user.bookmarks
    const [pin, setPin] = useState(u)
    const [foc, setFoc] = useState(false)
    const [onceTime, setOnceTime] = useState(true)
    const [showHelp, setShowHelp] = useState(false)
    const [msg, setMsg] = useState('')
    const [showAnswer, setShowAnswer] = useState(false)

    const _retrieveMsg = async () => {
        if (content.text != '') {
            if (content.answer.fuzzy) {
                setMsg(await postActionMsg(Actions.UNABLETOANSWER))
                setShowAnswer(false)
            }
            else {
                setMsg(await postActionMsg(Actions.ANSWER))
                setShowAnswer(true)
            }
        } else {
            setMsg(await postActionMsg(Actions.UNABLETOANSWER))
            setShowAnswer(false)
        }
    }

    useEffect(() => {
        _retrieveMsg()
    }, [])

    useEffect(() => {
        if (showHelp) setTimeout(()=> setShowHelp(false), 1200)
    }, [showHelp])

    const handleClick = () => {
        if (foc) setIns(null)
        else setIns(content)
        setFoc(!foc)
    }

    const handleMouseLeave = () => {
        if (!foc) {
            setIns(null)
        }
        setShowHelp(false)
    }

    const handleMouseEnter = () => {
        if (!foc) {
            setIns(content)
        }
        if (!foc & onceTime) {
            setShowHelp(true)
            setOnceTime(false)
        }
    }

    const togglePin = () => {
        if (pin) {
            let dct = Us.user
            delete dct.bookmarks[content.datetime]
            Us.updateUser(dct)
        }
        else {
            let dct = Us.user
            dct.bookmarks[content.datetime] = content
            Us.updateUser(dct)
        }
        setPin(!pin)
    }

    return <div>
        <div className='chat'>
            <span className='text'>{msg}</span>
        </div>
        {showAnswer && <div 
            className={'answer' + (foc? ' foc': '')} 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {showHelp? <div className='help-info'>Cliquer a focus!</div>: null}
            <div className='taskbar'>
                <Button className={pin? 'pinned' : 'pin'} 
                    onClick={togglePin}>
                    {pin? <img src={require('../../imgs/bob/pin.svg')}/>:
                    <img src={require('../../imgs/bob/_pin.svg')}/>}
                </Button>
            </div>
            <span 
                className='answer-text' 
            > 
                <MdRender source={content.text} />
            </span>
        </div>}
        <RelatedQuestions qs={content.related_questions} socket={socket}/>
        {showAnswer && <RateTheAnswer />}
    </div>
}

const ChatSegment = (props) => {
    // get user context
    const user = useContext(userContext).user

    let cl = 'chat-segment'
    let isBob = false
    // check if these phrases are spoken by current user
    if (props.chats.length > 0) {
        if (user.userid == props.chats[0].user.userid) cl += ' me'
        if (props.chats[0].user.userid == -1) {
            cl += ' chatbot'
            isBob = true
        }
    }
    return <div className={cl}>
        <div className='user'>
            {isBob &&
                <div>
                    <span>Bob</span>
                    <img src={require('../../imgs/bob/bob-outlined.svg')} />
                </div>
            }
        </div>
        <div className='content'>
            {props.chats.map((c, id) => {
                if (c.type == 'chat') return <Chat key={id} content={c}/>
                if (c.type == 'answer') 
                    return <Answer key={id} content={c} socket={props.socket} setIns={props.setIns}/>
                if (c.type == 'exercise-err-message' || 'exercise-common-errs')
                    return <ExTrouble key={id} content={c} />
            })}
        </div>
    </div>
}

const Ask = (props) => {
    let chatSegments = []
    let segment = []
    let currentUser = ''
    props.chats.forEach((c, id) => {
        if (c.user.userid != currentUser) {
            currentUser = c.user.userid
            if (segment.length > 0) {
                chatSegments.push(segment)
                segment = []
            }
        }
        segment.push(c)
    })
    if (segment) chatSegments.push(segment)

    return <div className='ask'>
        <div className='old-chats'>
            {props.chats.length == 0? <Welcome />: null}
            {chatSegments.map((p, id) => <ChatSegment 
                key={id} 
                chats={p} 
                socket={props.socket} 
                setIns={props.setInsight}
            />)}
            {props.isTyping && <Typing />}
        </div>
        <NewChat socket={props.socket} hints={props.hints}/>
    </div>
}

export default Ask