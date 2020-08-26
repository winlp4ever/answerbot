import React, {useState, useRef} from 'react'
import ReactPlayer from 'react-player'
import { Button } from '@material-ui/core'
import {Play, Pause} from 'react-feather'
import './_answer-video.scss'

const AnswerVideo = ({url, start_time}) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [ready, setReady] = useState(false)

    const ref = useRef()

    const handleReady = () => {
        if (!ready) {
            ref.current.seekTo(start_time / parseFloat(ref.current.getDuration()))
            setReady(true)
        }
    }

    const handlePlay = () => {
        setIsPlaying(!isPlaying)
    }
    return <div className='answer-video'>
        <div className='video-wrapper'>
            <ReactPlayer 
                url={url} 
                ref={ref}
                playing={isPlaying}
                onReady={handleReady}
                onPause={() => setIsPlaying(false)}
                width='100%'
                height='100%'
            />
        </div>
        <div className='controls'>
            <Button 
                className='play'
                onClick={handlePlay}
            >
                {isPlaying ? <Pause/>: <Play/>}
            </Button>
        </div>
    </div>
}

export default AnswerVideo