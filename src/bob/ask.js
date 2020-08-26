import React, {Component, useState, useContext, useEffect, useRef} from 'react'
import ReactDOM, { findDOMNode } from 'react-dom'
import {userContext} from '../user-context/user-context'

import Sound from 'react-sound'
import {CSSTransition} from 'react-transition-group';

import './_ask.scss'
import IsTyping from '../../sounds/is-typing.mp3'
import Lottie from 'react-lottie'
import TypingIcon from '../../imgs/typing.json'
import Welcome from './welcome'
import ExTrouble from './ex-trouble'
import Answer, {RateTheAnswer} from './answer'
import NewChat from './new-chat'

// import svgs
import _StarIcon from '../../imgs/bob/_star.svg'
import _PinIcon from '../../imgs/bob/_pin.svg'
import BobOutlined from '../../imgs/bob/bob-outlined.svg'

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
                    playStatus='PAUSED' 
                    onFinishedPlaying={this.increment}
                />}
                <Lottie options={defaultOptions} width={50}/>
            </div>
        )
    }
}
  
const Chat = ({content}) => {
    return <div className='chat'>
        <span className='text' dangerouslySetInnerHTML={{__html: content.text}}/>
        {content.time ? <span className='time'>{content.time}</span>: null}
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
                    <BobOutlined />
                </div>
            }
        </div>
        <div className='content'>
            {props.chats.map((c, id) => {
                if (c.type == 'chat') return <Chat key={id} content={c}/>
                if (c.type == 'answer') 
                    return <Answer key={id} content={c} socket={props.socket} setIns={props.setIns}/>
                if (c.type == 'rating')
                   return <RateTheAnswer key={id} content={c} uid={user.userid} />
                {/**
                    if (c.type == 'exercise-err-message' || 'exercise-common-errs')
                    return <ExTrouble key={id} content={c} />
                */}
            })}
        </div>
    </div>
}

const Ask = (props) => {
    let chatsRef = useRef(null)

    useEffect(() => {
        let $chats = $(findDOMNode(chatsRef.current))
        $($chats).animate({
            scrollTop: 1e10
        }, 500);
    }, [])


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
        <div className='old-chats' ref={chatsRef}>
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