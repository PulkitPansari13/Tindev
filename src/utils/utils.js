export function getChatKey(userId1, userId2){
    if(userId1<userId2)
        return userId1+userId2;
    return userId2+userId1;
}

export function getDate(timestamp){
    const jsDate = timestamp.toDate();
    const options = {
        day: "numeric",
        month: "short",
        year:"numeric"
    }
    return jsDate.toLocaleDateString("en-IN", options)
}