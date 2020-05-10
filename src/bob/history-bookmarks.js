import React, {Component, useState, useContext, useRef} from 'react';
import { userContext } from '../user-context/user-context';
import './_history-bookmarks.scss';

import {AnswerInsights} from './ask';

const History = (props) => {
    const user = useContext(userContext).user;
    return <div className='bob-history'>
        <h4><img src={require('../../imgs/bob/clock.svg')}/> History:</h4>
        {user.history.map((q, id) => {
            return <div key={id} className='old-question'>
                <span className='time'>At {q.datetime}, you have asked:</span>
                <span 
                    onMouseEnter={_ => props.setInsight(q)} 
                    onMouseLeave={_ => props.setInsight(null)}
                    className='old-q'
                >
                    {q.original_question}
                </span>
            </div>
        })}
    </div>
}

const Bookmarks = (props) => {
    const user = useContext(userContext).user;

    let bms = [];
    for (let b in user.bookmarks) {
        bms.push(user.bookmarks[b]);
    }
    
    return <div className='bob-bookmarks'>
        <h4><img src={require('../../imgs/bob/bmk.svg')}/> Bookmarks:</h4>
        {bms.map((b, id) => {
            return <div key={id} className='old-bookmark'>
                <span 
                    onMouseEnter={_ => props.setInsight(b)} 
                    onMouseLeave={_ => props.setInsight(null)}
                    className='q_'>
                    {b.original_question}
                </span>
            </div>
        })}
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

export default HistoryBookmarks;