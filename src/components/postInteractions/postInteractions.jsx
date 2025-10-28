import NImage from '../image/image';
import './postInteractions.css';

const PostInteractions = () => {
    return (
        <div className="postInteractions">
            <div className="interactionIcons">
                <NImage src="/general/react.svg" alt="" />
                273
                <NImage src="/general/share.svg" alt="" />
                <NImage src="/general/more.svg" alt="" />

            </div>
            <button>Save</button>
        </div>
    )
}

export default PostInteractions;