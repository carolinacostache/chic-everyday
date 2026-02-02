import { useQuery } from '@tanstack/react-query';
import apiRequest from '../../utils/apiRequest';
import NImage from '../image/image';
import { Link } from 'react-router-dom';
import './FollowListModal.css';

const FollowListModal = ({ userId, type, onClose }) => {

  const { isPending, error, data } = useQuery({
    queryKey: ['followList', userId, type],
    queryFn: () =>
      apiRequest.get(`/users/${userId}/${type}`).then((res) => res.data),
    enabled: !!userId,
  });

  return (
    <div className="followModalOverlay" onClick={onClose}>
      <div className="followModalContent" onClick={(e) => e.stopPropagation()}>
        <div className="followModalHeader">
          <h1>{type === 'followers' ? 'Followers' : 'Following'}</h1>
          <button className="closeButton" onClick={onClose}>X</button>
        </div>
        <div className="followList">
          {isPending && <p>Loading...</p>}
          {error && <p>Error loading list.</p>}
          {data &&
            data.map((item) => {
              const user = type === 'followers' ? item.follower : item.following;
              
              if (!user) return null; 

              return (
                <Link
                  to={`/profile/${user.username}`}
                  className="followItem"
                  key={user._id}
                  onClick={onClose}
                >
                  <NImage
                    src={user.img || '/general/noAvatar.jpg'}
                    alt={user.displayName}
                  />
                  <div className="followUserInfo">
                    <span>{user.displayName}</span>
                    <small>@{user.username}</small>
                  </div>
                </Link>
              );
            })}
          {data && data.length === 0 && (
            <p className="emptyList">
              {type === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;