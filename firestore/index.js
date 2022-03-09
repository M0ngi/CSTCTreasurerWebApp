const firebaseAdmin = require("firebase-admin");

const firestore = firebaseAdmin.app().firestore();
const auth = firebaseAdmin.app().auth();

const MAX_PER_PAGE = 2;

let usersArray = {};

module.exports.getUsers = async (page) => {
    let users = await auth.listUsers(page === -1 ? 1000 : MAX_PER_PAGE);
    while(page > 0){
        users = await auth.listUsers(MAX_PER_PAGE, users.pageToken);
        page--;
    }

    let usersList = {};
    for(let i = 0; i < users.users.length; i++){
        const jsonArr = users.users[i].toJSON();
        if(!usersArray[jsonArr.uid]){
            console.log("Load")
            const data = (await firestore.doc("users/"+jsonArr.uid).get()).data();
            if(data === undefined){
                usersList[i] = {uid: jsonArr.uid, name: "[!] NOT FOUND", email: "[!] NOT FOUND", paidFee: true, cin: "00000000"}
                continue;
            }

            usersArray[jsonArr.uid] = {
                email: jsonArr.email,
                name: data.name ?? "",
                paidFee: data.paidFee ? true : false,
                cin: data.cin,
                payementMethod: data.payementMethod ? data.payementMethod : "Not set",
                roomType: data.roomType
            }
        }

        usersList[i] = {uid: jsonArr.uid, ...usersArray[jsonArr.uid]}
    }

    return usersList;
};

module.exports.updateUserPayment = async (uid, paid)=>{
    let userDoc = firestore.doc("users/"+uid);
    if(!((await userDoc.get()).exists)) return {code: 502, error: 'User not found.'};

    if(typeof paid !== "boolean") return {code: 503, error: 'Invalid parameters.'};

    await userDoc.update({paidFee: paid});

    if(!usersArray[uid]){
        const user = await auth.getUser(uid);
        usersArray[uid] = {
            email: user.email,
            name: user.displayName ?? ""
        }
    }
    usersArray[uid].paidFee = paid;
    return {code: 200, res: 'ok'};
}