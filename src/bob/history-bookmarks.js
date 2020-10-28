import React, {Component, useState, useContext, useRef, useEffect} from 'react'
import { userContext } from '../user-context/user-context'
import './_history-bookmarks.scss'

import { postForData, request } from '../utils'

// import svgs
import ExpandIcon from '../../imgs/bob/expand.svg'
import ClockIcon from '../../imgs/bob/clock.svg'
import BmrkIcon from '../../imgs/bob/bmk.svg'

import { HelpCircle, ArrowLeft, ArrowRight } from 'react-feather'
import { Button } from '@material-ui/core'

const StatusColors = {
    opened: '#ffeb3b',
    answered: '#82b1ff'
}

const BOENDPOINT='https://localhost:6710';

const DiscussCard = (props) => {
    const [span, setSpan] = useState(false);
    const [messages, setMessages] = useState([]);

    const retrieveConversation = async () => {
        let data = await request(`${BOENDPOINT}/conversation/${props.message.id}`, 'get')
        console.log('conver', data);
        setMessages(data.conversation);
    }

    useEffect(() => {
        retrieveConversation()
    }, [])

    return <div 
        className='question-request' 
        onClick={() => setSpan(!span)}
    >
        {
            span ? <div>
                {
                    messages.map(m => {
                        return <div key={m.id} className='discuss'> 
                            <span>-</span>
                            <span>{props.userid == m.from_user_id? <b>{m.content}</b>: m.content}</span>
                        </div>
                    })
                }
            </div>: <span><b>{props.message.content}</b></span>
        }   
    </div>
}

const Bookmarks = (props) => {
    const [span, setSpan] = useState(false)
    const [bookmarks, setBookmarks] = useState([])
    const user = useContext(userContext).user

    const toggleSpan = () => setSpan(!span)

    const fetchData = async () => {
        console.log(user.userid)
        let data = await request(`${BOENDPOINT}/user/${user.userid}/message?msg_type=question`, 'get');
        console.log(data)
        console.log('all user msgs', data.messages);
        setBookmarks(data.messages)
    }
    useEffect(() => {
        fetchData();
    }, [])

    return <div className='discussions'>
        <h4>
            <ExpandIcon 
                onClick={toggleSpan} 
                className={span? 'expand on': 'expand'} 
            />
            Discuss With Teachers
            <BmrkIcon/> 
        </h4>
        {span && <div>
            { 
                bookmarks.map((b, id) => {
                    return <DiscussCard key={id} userid={user.userid} message={b} />
                }) 
            }
        </div>}
        
    </div>
}

const HistoryBookmarks = (props) => {
    return <div className='history-bookmarks'>
        <Bookmarks 
            bookmarks={props.bookmarks}
        />
    </div>
}

export default HistoryBookmarks