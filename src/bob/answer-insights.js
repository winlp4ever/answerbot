import React, { useState } from 'react';

import './_answer-insights.scss';
import MdRender from '../markdown-render/markdown-render';
import A from '../../imgs/bob/A.svg'
import ExploreIcon from '../../imgs/bob/explore.svg'
import {CSSTransition} from 'react-transition-group'
import AnswerVideo from './answer-video';

const FullAnswer = ({src}) => {
    return <div className='full-answer'>
        <h4>
            &#128214;
            Answer
        </h4>
        <MdRender source={src} />
    </div>
}

const AnswerInsights = ({content}) => {
    if (content != null) if (content.answer.source_type == 'video') 
        return <AnswerVideo url={content.answer.uri} start_time={1000 * content.answer.start_time_in_milliseconds} /> 
    return <div className='answer-insights-container'>
        {content != null && 
            <div className='answer-insights'>
            <FullAnswer src={content.answer.text} />
            {content.answer.uri? <div className='source'>
                <h4>Explore Answer Link</h4>
                <a href={content.answer.uri} target='_blank'>{content.answer.uri}</a>
            </div>: null}
        </div>}
    </div>
}

export default AnswerInsights;