import React, {useState} from 'react'

const CreateQuestionRequest = (props) => {
    const [sent, setSent] = useState(false)
    const [msg, setMsg] = useState(`
        Je voudrais savoir: 
        "${props.q}"
        Merci,
    `)
    const handleChange = (e) => {
        setMsg(e.target.value)
    }
    const sendReq = () => {
        
    }
}