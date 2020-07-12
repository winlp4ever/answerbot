import React, {Component, useState, useContext, useEffect, useRef} from 'react'
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
import {ArrowLeftCircle, Bookmark, Star} from 'react-feather'

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
                   {i <= score? <Star className='filled'/>:<Star />}
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

    const togglePin = () => {
        setPin(!pin)
    }

    return <div>
        <div className='chat'>
            <span className='text'>{msg}</span>
        </div>
        {showAnswer && <div 
            className={'answer' + (foc? ' foc': '')} 
        >
            
            <div className='taskbar'>
                
                <Button className={pin? 'pinned' : 'pin'} 
                    onClick={togglePin}>
                    <Bookmark/>
                </Button>
                <Button className={'open-next-to' + (foc ? ' clicked': '')} 
                    onClick={handleClick}
                >
                    <ArrowLeftCircle />
                </Button>
            </div>
            
            <span 
                className='answer-text' 
            > 
                <MdRender source={content.text} />
                <Button className='see-more' onClick={handleClick}>...voir plus</Button>
            </span>
        </div>}
        <RelatedQuestions qs={content.related_questions} socket={socket}/>
        {showAnswer && <RateTheAnswer />}
        <AskRequest q={content.original_question}/>
    </div>
}

export default Answer