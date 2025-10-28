import NImage from '../image/image';
import EmojiPicker from 'emoji-picker-react';
import './comments.css';
import { useState } from 'react';

const Comments = () => {

    const[open, setOpen] = useState(false);

    return (
        <div className="comments">
            <div className="commentList">
                <span className= 'commentCount'>Comments</span>
                <div className = "comment">
                    <NImage src="/general/noAvatar.png" alt="" />
                    <div className="commentContent">
                        <span className="commentUser">username</span>
                        <p className="commentText"> Hi</p>
                        <span className="commentTime"> 1 h</span>
                    </div>
                </div>
            </div>
            <form className="commentForm">
                <input type="text" placeholder="Add a comment..." />
                <div className="emoji">
                    <div onClick={() => setOpen((prev) => !prev)}>☺️</div>
                    {open && (<div className="emojiPicker">
                        <EmojiPicker/>
                    </div>
                    )}
                </div>
            </form>
        </div>
    )
}

export default Comments;