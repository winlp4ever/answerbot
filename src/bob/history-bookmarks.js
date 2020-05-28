import React, {Component, useState, useContext, useRef} from 'react'
import { userContext } from '../user-context/user-context'
import './_history-bookmarks.scss'

// import svgs
import ExpandIcon from '../../imgs/bob/expand.svg'
import ClockIcon from '../../imgs/bob/clock.svg'
import BmrkIcon from '../../imgs/bob/bmk.svg'

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
    
    let view = false
    if (props.q.answer) {
        if (props.q.answer.fuzzy) view = false
        else view = true 
    } else view = false

    if (!view) return null
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
    const user = useContext(userContext).user

    const toggleSpan = () => {
        setSpan(!span)
        console.log('oof')
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
            {user.history.map((q, id) => <OldQ key={id} insight={props.insight} setInsight={props.setInsight} q={q}/>)}
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