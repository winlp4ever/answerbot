import React, {Component, useState, useContext, useEffect, useRef} from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import {userContext} from '../user-context/user-context';

import Button from '@material-ui/core/Button';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import StarsIcon from '@material-ui/icons/Stars';
import RadioButtonCheckedRoundedIcon from '@material-ui/icons/RadioButtonCheckedRounded';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import $ from 'jquery';

import './_ask.scss';
import MdRender from '../markdown-render/markdown-render';

import {getCurrentTime} from '../utils';

const Chat = ({content}) => {
    return <div className='chat'>
        <span className='text'>{content.text}</span>
        <span className='time'>{content.time}</span>
    </div>
}

const RateTheAnswer = ({content}) => {
    const [score, setScore] = useState(0);
    const [hov, setHov] = useState(0);

    return <div className='rating'>
        <span className='text'>
            <img src={require('../../imgs/bob/rating.svg')} />
            <b>Please rate the answer</b>
        </span>
        <div className='rating-score'>
            {[1, 2, 3, 4, 5].map(i => <span 
                key={i}
                onClick={_ => setScore(i)}
                className={i <= score ? 'on': 'off'}
            >
                {i <= score? <StarsIcon />: <RadioButtonUncheckedRoundedIcon />}
            </span>)}
        </div>
    </div>
}

const MultipleChoice = ({content}) => {
    return null;
}

const RelatedQuestions = ({qs, socket}) => {
    const [viewRel, setViewRel] = useState(false);

    const user = useContext(userContext).user;
    
    const toggleRel = () => setViewRel(!viewRel);

    const ask = (txt) => {
        const nc = {
            time: getCurrentTime(true),
            user: user,
            type: 'chat',
            text: txt
        }
        socket.emit('ask-bob', {
            chat: nc,
            conversationID: user.userid
        });
    }
    if (qs.length == 0) return null;
    return <div className='related-questions'>
        <span className={'text' + (viewRel? ' rel': '')}
            onClick={toggleRel}
        >
            <img src={require('../../imgs/bob/related.svg')} />
            <b>Wanna see some related questions?</b>
        </span>
        {viewRel? <div>
            {qs.map((q, id) => <div className='rel-q' key={id}>
                <span 
                    className='text' 
                    onClick={_ => ask(q.question_normalized)} 
                    dangerouslySetInnerHTML={{__html: q.question_normalized}} 
                />
            </div>)}
        </div>:null}
    </div>
}

const Answer = ({content, socket, setIns}) => {
    const Us = useContext(userContext);

    let u = content.datetime in Us.user.bookmarks
    const [pin, setPin] = useState(u);
    const [mini, setMini] = useState(false);
    const togglePin = () => {
        if (pin) {
            let dct = Us.user;
            delete dct.bookmarks[content.datetime];
            Us.updateUser(dct);
        }
        else {
            let dct = Us.user;
            dct.bookmarks[content.datetime] = content;
            Us.updateUser(dct);
        }
        setPin(!pin)
    };
    const toggleMini = () => setMini(!mini);

    return <div> 
        <div className='chat'>
            <span className='text'>{content.text != '' ? 'I found something for you': 
                'I have troubles getting an answer for your question'}</span>
        </div>
        {content.text != '' ? <div 
            className={'answer'} 
            onMouseEnter={_ => setIns(content)} 
            onMouseLeave={_ => setIns(null)}
        >
            <div className='taskbar'>
                <Button className={pin? 'pinned' : 'pin'} 
                    onClick={togglePin}>
                    <img src={require('../../imgs/bob/pin.svg')}/>
                </Button>
            </div>
            <span 
                className='answer-text' 
            > 
                <MdRender source={content.text} />
            </span>
        </div>:null}
        {content.text != ''? <RateTheAnswer />:null}
        <RelatedQuestions qs={content.related_questions} socket={socket}/>
    </div>
}

const ChatSegment = (props) => {
    // get user context
    const user = useContext(userContext).user;

    let cl = 'chat-segment';
    let isBob = false;
    // check if these phrases are spoken by current user
    if (props.chats.length > 0) {
        if (user.username == props.chats[0].user.username) cl += ' me';
        if (props.chats[0].user.username == 'bob') {
            cl += ' chatbot';
            isBob = true;
        }
    }
    return <div className={cl}>
        <div className='user'>
            {isBob ? 
                <img src={require('../../imgs/bob/robot.svg')} />
            : null}
        </div>
        <div className='content'>
            {props.chats.map((c, id) => {
                if (c.type == 'chat') return <Chat key={id} content={c}/>;
                if (c.type == 'answer') 
                    return <Answer key={id} content={c} socket={props.socket} setIns={props.setIns}/>;
            })}
        </div>
    </div>
}

const Hints = ({hints, applyHint, autoComplete}) => {
    const [focus, setFocus] = useState(-1);

    const toggleHint = (i) => {
        setFocus(i);
    }
    console.log(hints);
    return <div className='question-hints'>
        {hints.map((h, id) => <div 
            key={id} 
            className={'hint' + (focus==id? ' focus': '') + (autoComplete-1 == id? ' auto-complete': '')}
            onMouseEnter={_ => toggleHint(id)}
            onMouseLeave={_ => toggleHint(-1)}
            onClick={_ => applyHint(h[1])}
        >
            <span>{h[1]}</span><span className='similarity-score'>{`${parseInt(h[2] * 100)}%`}</span>
        </div>)}
    </div>
}

const NewChat = (props) => {
    const [newchat, setNewchat] = useState('');
    const [viewHints, setViewHints] = useState(true);
    const [autoComplete, setAutoComplete] = useState(0);

    const input = useRef(null);
    const sending = useRef(null);
    const user = useContext(userContext).user;

    const viewHideHints = () => {
        setViewHints(!viewHints);
        input.current.focus();
    }

    const handleChange = (e) => {
        setNewchat(e.target.value);
        if (e.target.value.length == 7) setViewHints(true);
        props.socket.emit('ask-for-hints-bob', {
            'typing': e.target.value,
            'conversationID': user.userid
        })
    }

    const handleAutoComplete = () => {
        if (viewHints & autoComplete >= 0 & autoComplete < props.hints.length) {
            setNewchat(props.hints[autoComplete][1]);
            input.current.value = props.hints[autoComplete][1];
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
        });
        setNewchat('');
        input.current.value = '';
    }

    const send = () => {
        if (newchat == '') return;
        const nc = {
            time: getCurrentTime(true),
            user: user,
            type: 'chat',
            text: newchat
        }
        props.socket.emit('ask-bob', {
            chat: nc,
            conversationID: user.userid
        });
        setNewchat('');
        input.current.value = '';
    }

    const handleKeyDown = (e) => {
        
        let keycode = e.keyCode || e.which;
        if (keycode == 13) {
            e.preventDefault();
            sending.current.click();
        }
        else if (keycode == 9) {
            e.preventDefault();
            if (autoComplete >= props.hints.length) setAutoComplete(0);
            else {
                setAutoComplete(autoComplete + 1);
                handleAutoComplete();
            }
        }
        else if (keycode == 27) {
            e.preventDefault();
            setViewHints(false);
        }
    }

    return <div className='new-chat'>
        {viewHints & newchat != '' & newchat != ' ' & props.hints.length > 0 ?
            <Hints 
                hints={props.hints} 
                applyHint={applyHint} 
                autoComplete={autoComplete}
            />
        : null}
        <Button className={'show-hints' + (viewHints? '': ' not-show') + 
            ((props.hints.length > 0 & viewHints)? ' hinting': '')} 
            onClick={viewHideHints}
        >
            <img src={require('../../imgs/bob/hint.svg')}/>
        </Button>
        <TextareaAutosize
            ref={input}
            placeholder='ask a question'
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={'enter-question' + (newchat.length > 0? ' textin': '')}
        />
        <Button onClick={send} ref={sending}>
            <img src={require('../../imgs/bob/send.svg')}/>
        </Button>
    </div>
}

const Welcome = () => {
    return <div className='bob-welcome'>
        <img src={require('../../imgs/bob/welcome-bot.svg')} />
        <h2>Hi, I'm here to help!</h2>
        <span>Ask me any course-relevant question and I'll try my best to untie the knot!</span>
    </div>
}

const Ask = (props) => {
    let chatSegments = [];
    let segment = [];
    let currentUser = '';
    props.chats.forEach((c, id) => {
        if (c.user.username != currentUser) {
            currentUser = c.user.username;
            if (segment.length > 0) {
                chatSegments.push(segment);
                segment = [];
            }
        }
        segment.push(c);
        
    })
    if (segment) chatSegments.push(segment);

    return <div className='ask'>
        
        <div className='old-chats'>
            {props.chats.length == 0? <Welcome />: null}
            {chatSegments.map((p, id) => {
                return <ChatSegment key={id} chats={p} socket={props.socket} setIns={props.setInsight}/>
            })}
        </div>
        <NewChat socket={props.socket} hints={props.hints}/>
    </div>
}

export default Ask;
export { NewChat };