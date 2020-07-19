import React, {Component, useState, useContext, useEffect, useRef} from 'react'
import {userContext} from '../user-context/user-context'

import Actions, {postActionMsg} from './actions'

import {getCurrentTime} from '../utils'

import Button from '@material-ui/core/Button';

import GotoIcon from '../../imgs/bob/goto.svg'
import RelatedIcon from '../../imgs/bob/related.svg'

import './_related-questions.scss'

const RelatedQuestions = ({qs, socket}) => {
    const [viewRel, setViewRel] = useState(false)
    const [msg, setMsg] = useState('')
    

    const _retrieveMsg = async () => {
        setMsg(await postActionMsg(Actions.RELATEDQUESTIONS))
    }

    useEffect(() => {
        _retrieveMsg()
    }, [])

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
    if (qs.length == 0) return null
    return <div className='related-questions'>
        <span className={'text' + (viewRel? ' rel': '')}
            onClick={toggleRel}
        >
            <RelatedIcon />
            <b>{msg}</b>
        </span>
        {viewRel? <div>
            {qs.map((q, id) => <div className='rel-q' key={id}>
                <Button 
                    className='text' 
                    onClick={_ => ask(q.question_text)}   
                >
                    <a dangerouslySetInnerHTML={{__html: q.question_text}} />
                    <GotoIcon />
                </Button>
            </div>)}
        </div>: <div>
            {qs.slice(0, 2).map((q, id) => <div className='rel-q' key={id}>
                <Button 
                    className='text' 
                    onClick={_ => ask(q.question_text)}   
                >
                    <a dangerouslySetInnerHTML={{__html: q.question_text}} />
                    <GotoIcon />
                </Button>
            </div>)}
            <Button className='text see-more'
                onClick={toggleRel} >
                Voir plus ...
            </Button>
        </div>}
    </div>
}

export default RelatedQuestions