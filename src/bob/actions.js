import {postForData} from '../utils';

const Actions = {
    ASKQUESTION : 1,
    ANSWER : 2,
    UNABLETOANSWER : 3,
    EVALRESPONSE : 4,
    RELATEDQUESTIONS : 5,
    ASKERRCODE : 6,
    SHOWCOMMONERRORS : 7,
    SHOWHELP : 8
}

export async function postActionMsg(actionID) {
    let data = await postForData('/post-bob-msg', {
        actionID: actionID
    })
    return data.msg;
} 

export default Actions;
