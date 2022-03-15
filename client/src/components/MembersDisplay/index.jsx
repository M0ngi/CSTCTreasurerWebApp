import './style.css'
import MemberRow from "./memberRow";
import Button from '../Button';
import { useState, useEffect } from 'react';

export default function MembersDisplay(props){
    let [checkedUsers, setCheckedState] = useState(
        new Array(props.rows.length).fill(false)
    );
    let [selectedCount, setSelectedCount] = useState(0);
    let [isInverseChecked, setInverseChecked] = useState(false);
    let [statusDisplay, setStatusDisplay] = useState(0);

    useEffect(()=>{
        resetCheckbox();
    }, [props.rows])

    const onChange = (position)=>{
        checkedUsers[position] = !checkedUsers[position];
        if(checkedUsers[position]) setSelectedCount(++selectedCount);
        else setSelectedCount(--selectedCount);

        setCheckedState(checkedUsers)
    }

    const inverseSelected = ()=>{
        let count = 0;
        const updatedCheckedState = checkedUsers.map((item, ind) =>
            props.displayMask[ind]  && 
            (
                (statusDisplay === 0) || 
                (statusDisplay === 1 && props.rows[ind].paidFee) ||
                (statusDisplay === 2 && !props.rows[ind].paidFee)
            )? (item ? false : (()=>{count++; return true;})() ) : item
        );
        setCheckedState(updatedCheckedState);
        setSelectedCount(count);
        setInverseChecked(!isInverseChecked);
    }

    const resetCheckbox = ()=>{
        setInverseChecked(false); 
        setSelectedCount(0);
        setCheckedState(new Array(props.rows.length).fill(false));
    };

    const changeStatusFilter = ()=>{
        setStatusDisplay((statusDisplay+1) % 3)
    }

    const exportPaidEmails = ()=>{
        let users = [];
        let i = 0;
        while(props.rows[i]){
            if(props.rows[i].paidFee === true && props.rows[i].emailSent === false ){
                users.push(props.rows[i]);
            }
            i++;
        }
        props.modalController({type: 1, display: true, users:users})
    }

    return (
        <div className='displayContainer'>
            <div className='infoDisplay'>
                <div className='viewEmails'>
                    <button onClick={exportPaidEmails} className='clickable exportEmails'>Export emails</button>
                </div>
                <div className='container'>
                    {selectedCount} selected
                    <div className='setBtn'>
                        <Button resetCheckbox={resetCheckbox} users={props.rows} checkedUsers={checkedUsers} modalController={props.modalController} clickable={selectedCount !== 0} text="Mark as paid" />
                    </div>
                </div>
            </div>
            <table>
                <thead>
                    <tr className='tableHeader'>
                        <th className='selector'>
                            <div className='checkboxHeader'>
                                Inverse
                                <input checked={isInverseChecked} type="checkbox" className='invcheckbox clickable' onChange={inverseSelected}/>
                            </div>
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Payment</th>
                        <th>Amount</th>
                        <th onClick={changeStatusFilter} className='clickable'>Status <br/>({(()=>{
                            switch(statusDisplay){
                                case 0:{
                                    return "All";
                                }
                                case 1:{
                                    return "Paid";
                                }
                                case 2:{
                                    return "Not paid"
                                }
                            }
                        })()})</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.rows.map((row, index)=>{
                            if(props.displayMask[index] && 
                                (
                                    (statusDisplay === 0) || 
                                    (statusDisplay === 1 && row.paidFee) ||
                                    (statusDisplay === 2 && !row.paidFee)
                                ))
                                return <MemberRow
                                    resetCheckbox={resetCheckbox}
                                    modalController={props.modalController} 
                                    checked={checkedUsers[index]} 
                                    key={index} 
                                    onChange={()=>{
                                        onChange(index);
                                    }}
                                    {...row} 
                                />;
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}