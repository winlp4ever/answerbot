import React, {Component, useState, useContext, useEffect, useRef} from 'react'
import {userContext} from '../user-context/user-context'

import Button from '@material-ui/core/Button'
import {CSSTransition} from 'react-transition-group';

import './_answer.scss'
import MdRender from '../markdown-render/markdown-render'
import AskRequest from './ask-request'
import {postForData} from '../utils'

// import svgs
import _StarIcon from '../../imgs/bob/_star.svg'
import _PinIcon from '../../imgs/bob/_pin.svg'
import { Maximize2, Bookmark, Star, ThumbsUp, ThumbsDown, Minimize2 } from 'react-feather'


const Answer = ({content, socket, setIns}) => {
    const Us = useContext(userContext)

    const [liked, setLiked] = useState(0)
    const [foc, setFoc] = useState(false)
    const [showAnswer, setShowAnswer] = useState(false)

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

    const toggleLiked = (note) => {
        if (liked !== note) setLiked(note);
        else setLiked(0);
    }

    console.log(content);
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
        <AskRequest q={content.original_question}/>
    </div>
}

export default Answer