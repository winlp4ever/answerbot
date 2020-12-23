import React, { Component, useState, useContext, useEffect, useRef } from 'react'
import { userContext } from '../user-context/user-context'

import Button from '@material-ui/core/Button'
import { CSSTransition } from 'react-transition-group';

import './_answer.scss'
import MdRender from '../markdown-render/markdown-render'
import TeacherRequest from './teacher-request'
import { request } from '../utils'

// import svgs
import _StarIcon from '../../imgs/bob/_star.svg'
import _PinIcon from '../../imgs/bob/_pin.svg'
import { Maximize2, ThumbsUp, ThumbsDown, Minimize2 } from 'react-feather'
import { BOB_API_ENDPOINT } from '../variables';


const Answer = ({content, setIns}) => {
    const user = useContext(userContext).user

    const [numberOfLikes, setNumberOfLikes] = useState(0);
    const [liked, setLiked] = useState(0);
    const [foc, setFoc] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);

    const retrieveLike = async () => {
        let data = await request(
            `${BOB_API_ENDPOINT}/answer/${content.answer.id}/rating?userID=${user.userid}`, 
            'get'
        )
        setLiked(data.rating);
    }

    const retrieveNumberOfLikes = async () => {
        let data = await request(
            `${BOB_API_ENDPOINT}/answer/${content.answer.id}/rating`, 
            'get'
        )
        setNumberOfLikes(data.rating);
    }

    useEffect(() => {
        retrieveLike();
        retrieveNumberOfLikes();
    }, [])

    const _retrieveMsg = async () => {
        if (content.text != '') {
            if (content.answer.fuzzy) {
                setShowAnswer(false)
            }
            else {
                setShowAnswer(true)
            }
        } else {
            setShowAnswer(false)
        }
    }

    useEffect(() => {
        _retrieveMsg()
    }, [])

    const handleClick = () => {
        if (foc) setIns(null)
        else setIns(content)
        setFoc(!foc)
    }

    const toggleLiked = async (note) => {
        if (liked !== note) { 
            setLiked(note);
            await request(
                `${BOB_API_ENDPOINT}/answer/${content.answer.id}/rating/${user.userid}/${note}`, 
                'post'
            );
            await retrieveNumberOfLikes();
        }
        else {
            setLiked(0);
            await request(
                `${BOB_API_ENDPOINT}/answer/${content.answer.id}/rating/${user.userid}/0`, 
                'post'
            );
            await retrieveNumberOfLikes();
            console.log(data);
        } 
    }

    return <div>
        {showAnswer && <div 
            className={'answer' + (foc? ' foc': '')} 
        >
            
            <div className='taskbar'>
                <Button className={liked == -1? 'pinned' : 'pin'} 
                    onClick={_ => toggleLiked(-1)}
                >
                    <ThumbsDown />
                </Button>
                
                <Button className={liked == 1? 'pinned' : 'pin'} 
                    onClick={_ => toggleLiked(1)}
                >
                    <ThumbsUp />
                </Button>
                { numberOfLikes > 0 && numberOfLikes }
                <Button className={'open-next-to' + (foc ? ' clicked': '')} 
                    onClick={handleClick}
                >
                    {foc ? <Minimize2 />: <Maximize2 />}
                </Button>
            </div>
            
            <span 
                className='answer-text' 
            > 
                <MdRender source={content.answer.text} />
                
            </span>
            <Button className='see-more' onClick={handleClick}>(see more)...</Button>
        </div>}
        <TeacherRequest q={content.original_question}/>
    </div>
}

export default Answer