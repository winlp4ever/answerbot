import React, {Component, useState, useContext, useEffect, useRef} from 'react'
import {userContext} from '../user-context/user-context'

import Actions, {postActionMsg} from './actions'

import {getCurrentTime} from '../utils'

import Button from '@material-ui/core/Button';

import GotoIcon from '../../imgs/bob/goto.svg'
import RelatedIcon from '../../imgs/bob/related.svg'

import './_related-questions.scss'

const RelatedQuestions = ({content, socket}) => {
    const [viewRel, setViewRel] = useState(false)

    const user = useContext(userContext).user
    
    const toggleRel = () => setViewRel(!viewRel)

    const ask = (txt) => {
        const nc = {
            time: getCurrentTime(true),
            user: user,
            type: 'chat',
            text: txt
        }
        socket.emit('ask-bob', {
            chat: nc,
            conversationID: user.userid
        })
    }

    return <div className='related-questions'>
        {viewRel? <div>
            {content.related_questions.map((q, id) => <div className='rel-q' key={id}>
                <Button 
                    className='text' 
                    onClick={_ => ask(q.text)}   
                >
                    <a dangerouslySetInnerHTML={{__html: q.text}} />
                </Button>
            </div>)}
        </div>: <div>
            {content.related_questions.slice(0, 1).map((q, id) => <div className='rel-q' key={id}>
                <Button 
                    className='text' 
                    onClick={_ => ask(q.text)}   
                >
                    <a dangerouslySetInnerHTML={{__html: q.text}} />
                </Button>
            </div>)}
            <Button className='text see-more'
                onClick={toggleRel} >
                View more ...
            </Button>
        </div>}
    </div>
}

export default RelatedQuestions