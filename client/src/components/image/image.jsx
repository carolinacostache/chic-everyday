import { Image } from '@imagekit/react';

const NImage = ({src, alt, className, w, h}) => {
    return (
            <Image
                urlEndpoint={import.meta.env.VITE_URL_IK_ENDPOINT}
                src={src}
                transformation={[{ 
                    width: w, 
                    aspectRatio: "auto" 
                }]}
                lqip={{ active: true, quality: 20 }}
                alt={alt}
                loading="lazy"
                className={className}
            />
    );
}

export default NImage;