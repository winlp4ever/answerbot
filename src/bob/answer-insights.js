import React, { useState } from 'react';

import './_answer-insights.scss';

const AnswerInsights = ({content}) => {
    return <div className='answer-insights-container'>
        <div className='answer-insights'>
            <div className='full-answer'>
                <h4><img src={require('../../imgs/bob/A.svg')} /> Reponse complete:</h4>
                <MdRender source={content.answer.answer_paragraph.replace('\\n', 'w')} />
            </div>
            <div className='orientation'>
                <h4><img src={require('../../imgs/bob/traces.svg')} /> Explore encore:</h4>
                {content.answer.orientation? <span>{content.answer.orientation}</span>: null}
            </div>
            {content.answer.source? <div className='source'>
                <a href={content.answer.source} target='_blank'>{content.answer.source}</a>
            </div>: null}
        </div>
    </div>
}

export default AnswerInsights;