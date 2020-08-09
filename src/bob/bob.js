// import react
import React, {Component, useState, useContext, useEffect, useRef} from 'react';
import {userContext} from '../user-context/user-context';
import {colorMode} from '../app/app';

// third party imports
import io from 'socket.io-client';
import {CSSTransition} from 'react-transition-group';
import $ from 'jquery';
import Sound from 'react-sound';
import Button from '@material-ui/core/Button'
// import style file
import './_bob.scss';

// other cpns imports
import BobMenu from './menu';
import Ask from './ask';
import NewChat from './new-chat'
import HistoryBookmarks from './history-bookmarks';
import AnswerInsights from './answer-insights';
import IncomingMsg from '../../sounds/incoming-msg.mp3';
// import svgs
import BobAva from '../../imgs/bob/bob-transparent.svg'
import { Clock, MessageCircle } from 'react-feather';

import { useMatomo } from '@datapunt/matomo-tracker-react'

const Options = [
    {
        icon: <MessageCircle />,
        cl: 'view-ask',
        view: (props) => <Ask {...props} />,
        name: 'chat'
    },
    {
        icon: <Clock />,
        cl: 'view-bookmarks',
        view: (props) => <HistoryBookmarks {...props} />,
        name: 'history'
    }
]

const PageTrack = (props) => {
    const { trackPageView } = useMatomo()

    useEffect(() => {
        let st = performance.now()
        trackPageView()
        return () => {}
    }, [])
    return null
}

export default class Bob extends Component {
    static contextType = userContext;
    state = {
        hints: [],
        chats: [],
        pins: [],
        tab: 0, 
        minimal: true,
        newResponseComing: false,
        insight: null,
        isTyping: false
    }
    socket = io({
        transports: ['websocket']
    })


    _setInsight = (cnt) => {
        if (cnt == null) 
            this.setState({insight: null});
        else if (cnt.type != 'answer')
            this.setState({insight: null});
        else if (cnt.answer == null) 
            this.setState({insight: null});
        else 
            this.setState({insight: cnt});
    }

    _scrollToBottom = () => {
        if ($(".old-chats").length > 0) {
            $(".old-chats").animate({
                scrollTop: 1e10
            }, 500);
        }
    }

    componentDidMount () {
        this.socket.on('bob-msg', msg => {
            if (msg.conversationID == this.context.user.userid) {
                let chats_ = this.state.chats.slice();
                chats_.push(msg.chat);
                // update state
                this.setState({
                    newResponseComing: true,
                    chats: chats_,
                    isTyping: false
                });
                this._scrollToBottom();
            }
        })
        this.socket.on('new-chat', msg => {
            if (msg.conversationID == this.context.user.userid) {
                let chats_ = this.state.chats.slice();
                chats_.push(msg.chat);
                this.setState({chats: chats_, hints: [], isTyping: true});
                this._scrollToBottom();
            }
        })
    }

    componentWillUnmount () {
        this.socket.disconnect();
    }

    toggleMode = () => {
        if (this.state.minimal) {
            this.setState({minimal: false, newResponseComing: false});
        } else {
            this.setState({minimal: true, insight: null});
        }
    }

    changeTab = (id) => {
        this.setState({tab: id});
    }

    render() {
        let props = {
            socket: this.socket,
            chats: this.state.chats,
            hints: this.state.hints,
            setInsight: this._setInsight,
            insight: this.state.insight,
            isTyping: this.state.isTyping
        }
        let V = Options[this.state.tab]
        return <div className={'bob-container' + (this.props.colorMode == 0 ? ' light': ' dark')}>
            <CSSTransition 
                in={this.state.insight != null} 
                unmountOnExit 
                classNames='answer-insights-container' 
                timeout={250}
            >
                <AnswerInsights 
                    content={this.state.insight} 
                    setContent={this._setInsight}
                />
            </CSSTransition>
                
            {this.state.newResponseComing && <Sound 
                url={IncomingMsg} 
                playStatus='PAUSED' 
                onFinishedPlaying={_ => this.setState({newResponseComing: false})}
            />}
            <div className='bob-ava' >
                {this.state.newResponseComing && <span className='notif-res'></span>}
                
                <BobAva onClick={this.toggleMode} />
            </div>
 
            <CSSTransition 
                in={!this.state.minimal} 
                unmountOnExit 
                classNames='bob' 
                timeout={350}
            >
                <div className='bob maximal'>
                    <PageTrack />
                    <BobMenu 
                        options={Options} 
                        activeTab={this.state.tab}
                        changeTab={this.changeTab} 
                        toggleMode={this.toggleMode}
                    />
                    {this.context.user.userid? <V.view {...props}/>: null}
                </div>
            </CSSTransition>
        </div>
    }
}