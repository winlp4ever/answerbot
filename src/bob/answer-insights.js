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
    return <div className='answer-insights-container'>
        {
            content != null && 
            <div className='answer-insights'>
                <FullAnswer src={content.answer.text} />
                {
                    (content.answer.uri != '' && content.answer.uri != null) && 
                    <div className='source'>
                        <span>Explore the full answer </span>
                        <a 
                            href={ content.answer.uri } 
                            { ...((new URL(content.answer.uri)).hostname == window.location.hostname ? {}: { target: '_blank' }) }
                        >
                            here
                        </a>
                    </div>
                }
            </div>
        }
    </div>
}

export default AnswerInsights;