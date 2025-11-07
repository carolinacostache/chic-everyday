import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { useState } from 'react'; 

const followUser = async (username) => {
  const res = await apiRequest.post(`/users/follow/${username}`);
  return res.data;
};

const FollowButton = ({ username }) => { 
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false); 
  const queryKey = ["profile", username];

  const { data, isPending } = useQuery({ 
    queryKey: queryKey,
    queryFn: () => 
      apiRequest.get(`/users/${username}`).then((res) => res.data),
      refetchOnWindowFocus: false
  });
  
  const isFollowing = data?.isFollowing;

  const mutation = useMutation({
    mutationFn: () => followUser(username), 
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKey });
      const previousProfileData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          isFollowing: !oldData.isFollowing,
          followerCount: oldData.isFollowing
            ? oldData.followerCount - 1
            : oldData.followerCount + 1,
        };
      });

      return { previousProfileData };
    },

    onError: (err, variables, context) => {
      if (context?.previousProfileData) {
        queryClient.setQueryData(queryKey, context.previousProfileData);
      }
    },

    onSettled: () => {
      setIsLoading(false); 
    },
  });

  if (isPending) {
    return <button disabled>Loading...</button>;
  }

  return (
    <button
      onClick={() => {
        if (isLoading) return;
        setIsLoading(true);
        mutation.mutate();
      }}
      disabled={isLoading} 
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;