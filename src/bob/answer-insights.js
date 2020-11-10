import React, { useState, useContext, useEffect } from 'react';

import './_answer-insights.scss';
import MdRender from '../markdown-render/markdown-render';
import { userContext } from '../user-context/user-context';

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
    const user = useContext(userContext).user;

    const [ url, setURL] = useState('');
    
    useEffect(() => {
        try {
            let _url = (new URL(content.answer.uri)).hostname;
            setURL(_url);
        } catch (err) {}
    }, [])

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
                            { ...( url == user.referrer ? {}: { target: '_blank' }) }
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