import React, { useState } from 'react';

import './_answer-insights.scss';
import MdRender from '../markdown-render/markdown-render';
import A from '../../imgs/bob/A.svg'
import ExploreIcon from '../../imgs/bob/explore.svg'

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
        <div className='answer-insights'>
            <FullAnswer src={content.answer.answer_paragraph} />
            <div className='orientation'>
                <h4><ExploreIcon />Explorer</h4>
                {content.answer.orientation? <span>{content.answer.orientation}</span>: null}
            </div>
            {content.answer.source? <div className='source'>
                <a href={content.answer.source} target='_blank'>{content.answer.source}</a>
            </div>: null}
        </div>
    </div>
}

export default AnswerInsights;