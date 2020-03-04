import React from 'react'
import loading from '../assets/loading.gif'
export default function Header(props){
    return(
        <div className={props.DisplayLoading == 0? "mask-loading off" : "mask-loading"}>
            <img alt="" src={loading}/>
        </div>
    )
}
