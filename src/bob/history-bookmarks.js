import React, {Component, useState, useContext, useRef, useEffect} from 'react'
import { userContext } from '../user-context/user-context'
import './_history-bookmarks.scss'

import { request } from '../utils'

// import svgs
import ExpandIcon from '../../imgs/bob/expand.svg'
import ClockIcon from '../../imgs/bob/clock.svg'
import BmrkIcon from '../../imgs/bob/bmk.svg'

import { HelpCircle, ArrowLeft, ArrowRight } from 'react-feather'
import { Button } from '@material-ui/core'

const StatusColors = {
    opened: '#ffeb3b',
    answered: '#82b1ff'
}

const DiscussCard = ({q}) => {
    const [answer, setAnswer] = useState('')

    const retrieveAnswer = async () => {
        let data = await request(`http://localhost:6710/message/user/${user_id}`, {
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
            Discuss With Teachers
            <BmrkIcon/> 
        </h4>
        {span && <div>
            {bms.map((b, id) => <div 
                    key={id} 
                    className='old-bookmark'
                    onMouseEnter={_ => {}} 
                    onMouseLeave={_ => {}}
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
        />
    </div>
}

export default HistoryBookmarks