import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useQueryClient } from 'react-query';

export const useAddTrainToList = (userId, listType, setIsInList) => {
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState('');
  
    const queryClient = useQueryClient();
  
    const addTrainToList = async (trainId) => {
      try {
        const response = await axiosInstance.post(`/users/${userId}/${listType}/${trainId}`);
        
        if (response.status === 200) {
          setFeedbackMessage(`Train added to ${listType} successfully!`);
          setFeedbackType('success');
          queryClient.invalidateQueries(['trains']);
          queryClient.invalidateQueries(['wishlist', userId]);
          queryClient.invalidateQueries([listType, userId]);
        }
    } catch (err) {
        if (err.response && err.response.data && err.response.data.error && err.response.data.error.includes("duplicate key value")) {
          setFeedbackMessage('Train is already in your collection.');
        } else {
          setFeedbackMessage('Error adding train to collection.');
        }
        setFeedbackType('error');
      }
    };
  
    const removeTrainFromList = async (trainId) => {
      try {
        await axiosInstance.delete(`/users/${userId}/${listType}/${trainId}`);
        if (setIsInList) {
          setIsInList(false);
        }
        queryClient.invalidateQueries(['wishlist', userId]);

      } catch (error) {
        console.error(`Error removing train from ${listType}:`, error);
      }
    };
  

  return {
    addTrainToList,
    removeTrainFromList,
    feedbackMessage,
    feedbackType,
    setFeedbackMessage,
    setFeedbackType
  };
};


//For reference if needed 

// export const useIsTrainInWishlist = (userId, trainId) => {
//   const [isInWishlist, setIsInWishlist] = useState(false);

//   const checkTrainInWishlist = useCallback(async (trainId) => {
//       try {
//           const response = await axiosInstance.get(`/users/${userId}/wishlist/${trainId}`);
//           setIsInWishlist(response.data.isInWishlist);
//       } catch (error) {
//           console.error('Error checking train in wishlist:', error);
//           // Optionally, you can handle the error more gracefully, e.g., set an error state
//       }
//   }, [userId]);

//   return {
//       isInWishlist,
//       checkTrainInWishlist
//   };
// };

// export const useIsTrainInCollection = (userID, trainID) => {
//     const [isInCollection, setIsInCollection] = useState(false);
  
//     const checkTrainInCollection = useCallback(async (trainID) => {
//         try {
//             const response = await axiosInstance.get(`/users/${userID}/collection/${trainID}`);
//             if (response.status === 200) {
//                 setIsInCollection(true); // Assuming the API responds with { isInCollection: true/false }
//                 isInCollection = true;
//             }
//         } catch (error) {
//             console.error('Error checking train in collection:', error);
//             setIsInCollection(false);
//             isInCollection = false;
//             // Optionally, handle sthe error more gracefully
//         }
//     }, [userID]);
  
//     return {
//         isInCollection,
//         checkTrainInCollection
//     };
//   };