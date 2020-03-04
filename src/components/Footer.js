import React, {useCallback,} from 'react'

export default function Footer(props){
    const checkActive = useCallback((tabName)=>{
        if(tabName == props.tab){
            return "active"
        }else{
            return ""
        }
    })
    return(
        <footer style={{display:props.DisplayBar}}>
            <div onClick={()=>{props.waitChangeTab('campain')}} className={checkActive('campain')}>
                <i class="fas fa-home"></i>
                <p>Chiến dịch</p>
            </div>
            <div onClick={()=>{props.waitChangeTab('view')}} className={checkActive('view')}>
                <i class="fas fa-play"></i>
                <p>Xem Video</p>
            </div>
            <div onClick={()=>{props.waitChangeTab('earnmore')}} className={checkActive('earnmore')}> 
                <i class="fas fa-dollar-sign"></i>
                <p>Kiếm thêm</p>
            </div>
        </footer>
    )
}