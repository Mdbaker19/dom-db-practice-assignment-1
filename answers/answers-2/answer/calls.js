const DB_Endpoint = "https://draco-practice-1-default-rtdb.firebaseio.com/";
const options = {food: "food.json", users: "users.json"};

function fetchData(option) {
    return fetch(`${DB_Endpoint}${option}`).then(res => res.json());
}