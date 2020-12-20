import React, { useState, useContext, useEffect } from 'react';

import './_answer-insights.scss';
import MdRender from '../markdown-render/markdown-render';
import { userContext } from '../user-context/user-context';
import { Feather, Link } from 'react-feather';

import AnswerVideo from './answer-video';

const FullAnswer = ({src, url}) => {
    return <div className='full-answer'>
        <h4>
            <Feather />
            Answer
        </h4>
        <MdRender source={src} />
        {
            (url !== '' && url !== null) && 
            <div className='answer-link'>
                <a href={url} target='_blank'><b>Explore the source</b></a>
            </div>
        }
    </div>
}

const AnswerInsights = ({content}) => {
    const user = useContext(userContext).user;

    const [ url, setURL] = useState('');
    
    useEffect(() => {
        try {
            if (content.answer.uri.startsWith('/')) {
                setURL(user.referrer + content.answer.uri);
            } else {
                setURL(content.answer.uri);   
            }
        } catch (err) {}
    }, [content])

    return <div className='answer-insights-container'>
        {
            content != null && 
            <div className='answer-insights'>
                { 
                    content.answer.source_type === 'video' && 
                    <AnswerVideo 
                        url={content.answer.uri}
                        start_time={0}
                    />
                }
                { content.answer.text !== '' && <FullAnswer src={content.answer.text} url={url} /> }
            </div>
        }
    </div>
}

export default AnswerInsights;