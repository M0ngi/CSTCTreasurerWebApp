import ModalBtn from "./modalBtn";
import "./style.css";

export default function ModalPopup(props){
    if(props.display){
        const confirmPayment = async () => {
            props.preloaderController(true);
            for(let i=0; i<props.users.length; i++){
                await fetch(
                    "/api/changeUserStatus",
                    {
                        "method": "POST",
                        "headers": {
                        "Content-Type": "application/json",
                        "accept": "application/json"
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                        uid: props.users[i].uid,
                        paid: !props.users[i].paidFee
                        })
                    }
                ).then(response => response.json())
                .then(response => {
                    if(response.code === 200){
                        // Success
                    }
                    else {
                        alert("Error when setting " + props.users[i].name + ".\nResponse: " + response);
                        window.location.reload();
                    }
                });
            }
            props.preloaderController(false);
            closeModalDialog();
        }

        const confirmEmailSent = async () => {
            props.preloaderController(true);
            for(let i=0; i<props.users.length; i++){
                await fetch(
                    "/api/setMailSent",
                    {
                        "method": "POST",
                        "headers": {
                        "Content-Type": "application/json",
                        "accept": "application/json"
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                        uid: props.users[i].uid,
                        emailSent: !props.users[i].emailSent
                        })
                    }
                ).then(response => response.json())
                .then(response => {
                    if(response.code === 200){
                        // Success
                    }
                    else {
                        alert("Error when setting " + props.users[i].name + ".\nResponse: " + response);
                        window.location.reload();
                    }
                });
            }

            props.preloaderController(false);
            closeModalDialog();
        }
        
        const closeModalDialog = () => {
            if(props.type == 0) props.resetCheckbox();
            props.modalController({display: false})
        }

        document.getElementsByTagName('body')[0].style = "overflow: hidden;"
        return (
            <div className="modalContainer" onClick={(e)=>{
                if(e.target.className === "modalContainer"){
                    closeModalDialog();
                }
            }}>
                <div className={"modal " + (props.display ? "visible" : "visible")}>
                    <div className="modalText">
                        {
                            props.type === 0 ?
                            <div>
                                You're about to mark the following users as <div className={"action " + (props.users[0].paidFee ? "red" : "green")}><b>{props.users[0].paidFee ? "Not paid" : "Paid"}</b></div>, Proceed?
                                <div className="usersListModal">
                                    {
                                        props.users.map((user, index)=>{
                                            return (
                                                <div key={index} className="userModalLine">
                                                    {user.name === "" ? "[!] NOT SET" : user.name} ({user.email} - ID: {user.uid})
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                            : 
                            <div>
                                <div onClick={()=>{
                                    const elem = document.querySelector("#emailList");
                                    elem.select();
                                    elem.focus();
                                }} className="clickable selAll">Select all</div>
                                <textarea id="emailList" className="emailList" readOnly value={
                                    (()=>{
                                        return props.users.map((user)=>{
                                            return user.email;
                                        }).join('\n');
                                    })()
                                }></textarea>
                            </div>
                        }
                    </div>
                    <div className="modalBtns">
                        <ModalBtn action={closeModalDialog} text={props.type === 0 ? "Cancel" : "Close"}/>
                        <ModalBtn action={props.type === 0 ? confirmPayment : confirmEmailSent} text="Confirm" />
                    </div>
                </div>
            </div>
        );
    }
    else {
        document.getElementsByTagName('body')[0].style = "overflow: auto;"
        return <></>;
    }
}