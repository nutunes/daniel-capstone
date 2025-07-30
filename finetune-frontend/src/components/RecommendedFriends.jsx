import { useState, useEffect } from 'react'
import RecommendedUserElement from './RecommendedUserElement';
import GraphComponent from './GraphComponent';



const RecommendedFriends = ({friendPageRefresh, setFriendPageRefresh}) => {
    const [recommendedUsers, setRecommendedUsers] = useState(null);
    const [graphDisplay, setGraphDisplay] = useState(null);
    const [userWeights, setUserWeights] = useState(null);


    const fetchRecommendedUsers = async() => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/friends/recommended_friends`, {
                credentials: 'include',
            });
            if (!response || !response.ok){
                throw new Error('failed to get friends');
            }
            const responseJSON = await response.json();
            setRecommendedUsers(responseJSON);
        } catch(error){
            console.error('failed to fetch friends ' + error)
        }
    }


    const fetchUserAccount = async() => {
        try{
            const response = await fetch(`http://127.0.0.1:3000/login/account`, {
                credentials: 'include',
            });
            if (!response || !response.ok){
                throw new Error('failed to fetch')
            }
            const profile = await response.json()
            setUserWeights(profile.regressionWeights)
        } catch(error){
            console.error('failed to get account ' + error)
        }
    }


    const updateGraphDisplay = async() => {
        try {
            // Weight matrix is an array of regression weight arrays that will be sent to get dimensions reduced
            const weightMatrix = [userWeights]
            const users = ['you']
            for (let user of recommendedUsers){
                weightMatrix.push(user.regressionWeights)
                users.push(user.username)
            }
            const response = await fetch(`http://127.0.0.1:8000/mds`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(weightMatrix),
            });
            const reducedWeights = await response.json();
            const display = {
                'labels': users,
                'points': reducedWeights
            }
            setGraphDisplay(display);
        } catch(error){
            console.error('failed to get reduced dimension coordinates ' + error)
        }
    }

    // refetch recommended users whenever the page triggers a rerender
    useEffect(()=>{
        fetchRecommendedUsers();
    }, [friendPageRefresh])

    // only need to get the user's weights once, on mount
    useEffect(()=>{
        fetchUserAccount();
    }, [])

    // Each time recommended users is updated, fetch the reduced dimension coordinates
    useEffect(()=>{
        updateGraphDisplay()
    }, [recommendedUsers])




    return (
        <div className='flex flex-col items-center flex-1'>
            <p className='font-fredoka text-3xl'>Recommended Users</p>
            <div className='flex flex-col m-10 items-center w-full gap-3 justify-center'>
                {recommendedUsers === null && <p className='font-fredoka'>Loading friends...</p>}
                {recommendedUsers?.length === 0 && <p className='font-fredoka'>You have added no friends</p>}
                {graphDisplay !== null && <GraphComponent displayInfo={graphDisplay}/>}
                {recommendedUsers?.map(user=>{
                    return(
                        <RecommendedUserElement user={user} updated={()=>setFriendPageRefresh(prev=>!prev)} key={user.id} />
                    )
                })}
            </div>
        </div>
    )
}


export default RecommendedFriends