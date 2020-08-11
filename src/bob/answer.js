import React, {Component, useState, useContext, useEffect, useRef} from 'react'
import {userContext} from '../user-context/user-context'

import Button from '@material-ui/core/Button'
import {CSSTransition} from 'react-transition-group';

import './_answer.scss'
import MdRender from '../markdown-render/markdown-render'
import Actions, {postActionMsg} from './actions'
import RelatedQuestions from './related-questions'
import AskRequest from './ask-request'
import {postForData} from '../utils'

// import svgs
import RatingIcon from '../../imgs/bob/rating.svg'
import StarIcon from '../../imgs/bob/star.svg'
import _StarIcon from '../../imgs/bob/_star.svg'
import PinIcon from '../../imgs/bob/pin.svg'
import _PinIcon from '../../imgs/bob/_pin.svg'
import {Maximize2, Bookmark, Star} from 'react-feather'

const RateTheAnswer = ({aid, uid}) => {
    const user = useContext(userContext).user
    const [score, setScore] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [evalMsg, setEvalMsg] = useState('')

    const _retrieveRating = async () => {
        let data = await postForData('/post-answer-rating', {
            uid: uid,
            aid: aid
        })
        if (data.status = 'ok') {
            setScore(data.rating)
        }
    }

    const _retrieveMsg = async () => {
        setEvalMsg(await postActionMsg(Actions.EVALRESPONSE))
    }

    const submitRating = async (rating) => {
        let data = await postForData('/submit-answer-rating', {
            uid: uid,
            aid: aid,
            rating: rating
        })
        if (data.status == 0) {
            setScore(rating)
            setSubmitted(true)
        }
    }
    
    useEffect(() => {
        _retrieveRating()
        _retrieveMsg()
    }, [])

    return <div className='rating'>
        {!submitted? <span className='text'>
            <RatingIcon />
            <b>{evalMsg}</b>&nbsp;
        </span>: <span
            className='text'
        >
            <b>Merci pour votre evaluation!!! &#128170;</b>
        </span>}
        {!submitted && <span className='rating-stars'>
            {(score > 0) && <span className='already-rate-msg'>Vous avez déjà noté cette réponse.</span>}
            {[1, 2, 3, 4, 5].map(i => <i 
                key={i}
                onClick={_ => submitRating(i)}
                className={i <= score ? 'on': 'off'}
            >
                {i <= score? <Star className='filled'/>:<Star />}
            </i>)}
        </span>}
    </div>
}

const Answer = ({content, socket, setIns}) => {
    const Us = useContext(userContext)

    const [pin, setPin] = useState(false)
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
                    onClick={togglePin}
                >
                    <Bookmark/>
                </Button>
                <Button className={'open-next-to' + (foc ? ' clicked': '')} 
                    onClick={handleClick}
                >
                    <Maximize2 />
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
        {showAnswer && <RateTheAnswer uid={Us.user.userid} aid={content.answer.aid}/>}
        <AskRequest q={content.original_question}/>
    </div>
}

export default Answer