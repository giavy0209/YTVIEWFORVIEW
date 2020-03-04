import React, {useState, useCallback, useEffect} from 'react'

export default function Header({User,Point,changeTab,DisplayBar}){
    return(
        <header style={{display:DisplayBar}}>
            <div class="left">
                <p><i class="fas fa-dollar-sign"></i>{Point}</p>
            </div>
            <div class="right">
                <p onClick={()=>changeTab('profile')}><i class="fas fa-user"></i>{User}</p>
            </div>
        </header>
    )
}
