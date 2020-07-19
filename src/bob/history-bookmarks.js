import React, {Component, useState, useContext, useRef, useEffect} from 'react'
import { userContext } from '../user-context/user-context'
import './_history-bookmarks.scss'

import {postForData} from '../utils'

// import svgs
import ExpandIcon from '../../imgs/bob/expand.svg'
import ClockIcon from '../../imgs/bob/clock.svg'
import BmrkIcon from '../../imgs/bob/bmk.svg'

const StatusColors = {
    opened: '#ffeb3b',
    answered: '#82b1ff'
}

const QuestionReq = ({q}) => {
    const [answer, setAnswer] = useState('')

    const retrieveAnswer = async () => {
        let data = await postForData('/post-req-answer', {
            qid: q.id
        })
        if (data.status == 0) {
            setAnswer(data.answer.text)
        }
    }

    useEffect(() => {
        if (q.status == 'answered') {
            retrieveAnswer()
        }
    }, [])

    return <div className='question-request' >
        <span className='timestamp'>{q.date.substr(0, 10)}</span>
        <span className='status' style={{
            background: StatusColors[q.status]
        }}>{q.status}</span>
        <div className='question'><b>You: </b>
            {q.text}
        </div>
        {(q.status == 'answered') && 
        <div className='prof-answer'><b>Prof: </b>
            {answer}
        </div>}
    </div>
}

const OldQ = (props) => {
    const [viewTime, setViewTime] = useState(false)
    const [focus, setFocus] = useState(false)
    const [hover, setHover] = useState(false)
   
    const handleFocus = () => {
        if (!focus) props.setInsight(props.q)
        else props.setInsight(null)
        setFocus(!focus)
    }

    const handleHover = () => {
        if (!focus) {
            if (hover) props.setInsight(null)
            if (!hover) props.setInsight(props.q)
        }
        setHover(!hover)
    }

    const toggleViewTime = () => setViewTime(!viewTime)
    return <div 
        className='old-question' 
        onMouseEnter={toggleViewTime} 
        onMouseLeave={toggleViewTime}
    >
        {viewTime && <span className='time'>{props.q.datetime}</span>}
        <span 
            onClick={handleFocus}
            onMouseEnter={handleHover} 
            onMouseLeave={handleHover}
            className='old-q'
        >
            {props.q.original_question}
        </span>
    </div>
}

const History = (props) => {
    const [span, setSpan] = useState(false)
    const [askedRequests, setAskedRequests] = useState([])
    const [askedQuestions, setAskedQuestions] = useState([])
    const user = useContext(userContext).user

    const _retrieveQuestions = async () => {
        let bqs = await postForData('/post-asked-questions', {
            userid: user.userid
        })
        if (bqs.status == 'ok') setAskedQuestions(bqs.questions)
        let tqs = await postForData('/post-asked-requests', {
            userid: user.userid
        })
        if (tqs.status == 0) setAskedRequests(tqs.questions)
    }

    useEffect(() => {
        _retrieveQuestions()
    }, [])

    const toggleSpan = () => {
        setSpan(!span)
    }
    
    return <div className='bob-history'>
        <h4>
            <ExpandIcon
                onClick={toggleSpan} 
                className={span? 'expand on': 'expand'} 
            />
            History
            <ClockIcon/> 
        </h4>
        {span && <div>
            <div>
                {askedRequests.map((q, id) => <QuestionReq 
                    key={id}
                    q={q}
                />)}
                {askedQuestions.map((q, id) => <OldQ 
                    key={id} 
                    insight={props.insight} 
                    setInsight={props.setInsight} 
                    q={q.content}/>)}
            </div>
        </div>}
    </div>
}

const Bookmarks = (props) => {
    const [span, setSpan] = useState(false)
    const user = useContext(userContext).user

    const toggleSpan = () => setSpan(!span)

    let bms = []
    for (let b in user.bookmarks) {
        bms.push(user.bookmarks[b])
    }
    
    return <div className='bob-bookmarks'>
        <h4>
            <ExpandIcon 
                onClick={toggleSpan} 
                className={span? 'expand on': 'expand'} 
            />
            Bookmarks
            <BmrkIcon/> 
        </h4>
        {span && <div>
            {bms.map((b, id) => <div 
                    key={id} 
                    className='old-bookmark'
                    onMouseEnter={_ => props.setInsight(b)} 
                    onMouseLeave={_ => props.setInsight(null)}
                >
                    <span className='q_'>
                        {b.original_question}
                    </span>
                </div>
            )}
        </div>}
        
    </div>
}

const HistoryBookmarks = (props) => {
    return <div className='history-bookmarks'>
        <Bookmarks 
            bookmarks={props.bookmarks}
            setInsight={props.setInsight}
            insight={props.insight}
        />
        <History history={props.history}
            setInsight={props.setInsight}
            insight={props.insight}
        />
    </div>
}

export default HistoryBookmarks