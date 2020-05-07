import React, {Component, useState, useContext, useRef} from 'react';
import { userContext } from '../user-context/user-context';
import './_history-bookmarks.scss';

import {AnswerInsights} from './ask';

const History = ({history}) => {
    const user = useContext(userContext).user;
    return <div className='bob-history'>
        <h4><img src={require('../../imgs/bob/clock.svg')}/> History:</h4>
        {user.history.map((q, id) => {
            return <div key={id} className='old-question'>
                <span className='time'>At {q.datetime}, you have asked:</span>
                <span className='old-q'>{q.original_question}</span>
            </div>
        })}
    </div>
}

const Bookmarks = ({bookmarks}) => {
    const user = useContext(userContext).user;

    let bms = [];
    for (let b in user.bookmarks) {
        bms.push(user.bookmarks[b]);
    }
    
    return <div className='bob-bookmarks'>
        <h4><img src={require('../../imgs/bob/bmk.svg')}/> Bookmarks:</h4>
        {bms.map((b, id) => {
            return <div key={id} className='old-bookmark'>
                <span className='q_'>{b.original_question}</span>
            </div>
        })}
    </div>
}

const HistoryBookmarks = (props) => {
    return <div className='history-bookmarks'>
        <Bookmarks bookmarks={props.bookmarks}/>
        <History history={props.history}/>
    </div>
}

export default HistoryBookmarks;