import NImage from '../image/image'
import './collections.css'

const Collections =()=>{
    return(
        <div className='collections'>
            <div className='collection'>
                <NImage src ="/pins/pin1.jpeg" alt=""/>
                <div className='collectionInfo'>
                    <h1>name 1</h1>
                    <span> 12 pins 1 day ago</span>
                </div>
            </div>
            
        </div>
    )
}

export default Collections