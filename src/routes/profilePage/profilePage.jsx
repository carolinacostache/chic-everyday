import './profilePage.css';
import NImage from '../../components/image/image';
import { useState } from 'react';
import Collections from '../../components/collection/collections';
import Gallery from '../../components/gallery/gallery';

const Profilepage = () => {
    const[type, setType] = useState("saved");
    return (
        <div className="profilePage">
            <NImage className="profileImg" w={100} h={100} src="/general/noAvatar.png" alt=""/>
            <h1 className="profileName">username</h1>
            <span className="profileUsername">@username</span>
            <div className='followCount'>10 followers - 20 following</div>
            <div className='profileInteractions'>
                <NImage src="/general/share.svg" alt=""/>
                <div className="profileButtons">
                <button>Message</button>
                <button>Follow</button>
                </div>
                <NImage src="/general/more.svg" alt=""/>
            </div>
            <div className='profileOptions'>
                <span onClick={()=>setType("created")} className={type==="created" ? "active" : ""}>Created</span>
                <span onClick={()=>setType("saved")} className={type==="saved" ? "active" : ""}>Saved</span>
            </div>
            {type==="created" ? <Gallery/> : <Collections/>}

        </div>

    )
};

export default Profilepage;