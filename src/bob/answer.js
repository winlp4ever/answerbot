import React, {Component, useState, useContext, useEffect, useRef} from 'react'
import ReactDOM, { findDOMNode } from 'react-dom'
import {userContext} from '../user-context/user-context'

import Button from '@material-ui/core/Button'
import {CSSTransition} from 'react-transition-group';

import './_answer.scss'
import MdRender from '../markdown-render/markdown-render'
import Actions, {postActionMsg} from './actions'
import RelatedQuestions from './related-questions'
import AskRequest from './ask-request'

// import svgs
import RatingIcon from '../../imgs/bob/rating.svg'
import StarIcon from '../../imgs/bob/star.svg'
import _StarIcon from '../../imgs/bob/_star.svg'
import PinIcon from '../../imgs/bob/pin.svg'
import _PinIcon from '../../imgs/bob/_pin.svg'

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
            <RatingIcon />
            <b>{evalMsg}</b>&nbsp;
            <span className='rating-stars'>
                {[1, 2, 3, 4, 5].map(i => <i 
                    key={i}
                    onClick={_ => setScore(i)}
                    className={i <= score ? 'on': 'off'}
                >
                   {i <= score? <_StarIcon />:<StarIcon />}
                </i>)}
            </span>
            
        </span>
    </div>
}

const Answer = ({content, socket, setIns}) => {
    const Us = useContext(userContext)
    const helpEnter = useRef(null)
    const helpTimeout = useRef(null)

    let u = content.datetime in Us.user.bookmarks
    const [pin, setPin] = useState(u)
    const [foc, setFoc] = useState(false)
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
        clearTimeout(helpEnter.current)
        clearTimeout(helpTimeout.current)
    }

    const handleMouseEnter = () => {
        if (!foc) {
            setIns(content)
            clearTimeout(helpEnter.current)
            helpEnter.current = setTimeout(() => {
                setShowHelp(true)
                clearTimeout(helpTimeout.current)
                helpTimeout.current = setTimeout(() => setShowHelp(false), 1000)
            }, 1000) 
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
            
            <CSSTransition 
                in={showHelp} 
                unmountOnExit 
                classNames='help-info' 
                timeout={250}
            >
                <div className='help-info'>Cliquer a focus!</div>
            </CSSTransition>
            
            <div className='taskbar'>
                <Button className={pin? 'pinned' : 'pin'} 
                    onClick={togglePin}>
                    {pin? <PinIcon/>: <_PinIcon/>}
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
        <AskRequest q={content.original_question}/>
    </div>
}

export default Answer