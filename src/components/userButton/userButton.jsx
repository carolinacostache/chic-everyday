import { use, useState } from 'react'
import './userButton.css'
import NImage from '../image/image';

const UserButton = () => {

    const [open, setOpen] = useState(false);

    const currentUser = true

    return currentUser ? (
        <div className="userButton">
            <NImage src='/general/noAvatar.png' alt="" />
            <NImage
            src='/general/arrow.svg'
            onClick={()=>setOpen((prev) => !prev)}
            alt="" 
            className="arrow"
            />
            {open && (<div className="userOptions">
                <div className="userOption">Profile</div>
                <div className="userOption">Settings</div>
                <div className="userOption">Logout</div>
            </div>)}
        </div>
    ) : (<a href='/' className='loginLink'>Login/ sign up</a>)
}

export default UserButton;