import React, { useState } from 'react';

import './_answer-insights.scss';
import MdRender from '../markdown-render/markdown-render';
import A from '../../imgs/bob/A.svg'
import ExploreIcon from '../../imgs/bob/explore.svg'
import {CSSTransition} from 'react-transition-group'

const FullAnswer = ({src}) => {
    return <div className='full-answer'>
        <h4>
            <A/> 
            Réponse complète
        </h4>
        <MdRender source={src} />
    </div>
}

const Orientation = ({src}) => {
    return <div className='orientation'>
        <h4>
            <ExploreIcon /> 
            Explorer
        </h4>
        {content.answer.orientation? <span>{content.answer.orientation}</span>: null}
    </div>
}

const AnswerInsights = ({content}) => {
    return <div className='answer-insights-container'>
        {content != null && 
            <div className='answer-insights'>
            <FullAnswer src={content.answer.answer_paragraph} />
            {content.answer.orientation ? <div className='orientation'>
                <h4><ExploreIcon />Explorer</h4>
                <span>{content.answer.orientation}</span>
            </div>: null}
            {content.answer.source? <div className='source'>
                <h4><ExploreIcon />Explorer</h4>
                <a href={content.answer.source} target='_blank'>{content.answer.source}</a>
            </div>: null}
        </div>}
    </div>
}

export default AnswerInsights;