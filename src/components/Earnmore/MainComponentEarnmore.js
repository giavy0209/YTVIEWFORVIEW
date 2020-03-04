import React, {useState, useCallback, useEffect} from 'react'

export default function MainComponentView(props){
    let {socket,setPoint,UserData,setDisplayLoading,RefID,setRefID,RefFor,setRefFor} = props;
    let {user} = UserData;
    const [CurrentAlert, onChangeCurrentAlert] = useState('');
    const [CurrentRefFor, setCurrentRefFor] = useState(RefFor);
    useEffect(()=>{
        socket.on('res-refID', refID=>{
            setDisplayLoading(0)
            setRefID(refID)
        })
        socket.on('add-ref-id-success',({point,refFor})=>{
            setDisplayLoading(0)
            onChangeCurrentAlert('Bạn được cộng 2000 coins từ mã giới thiệu')
            setPoint(point)
            setRefFor(refFor)
        })
        socket.on('already-ref',()=>{
            setDisplayLoading(0)
            onChangeCurrentAlert('Bạn đã nhập mã giới thiệu rồi')
        })
        socket.on('wrong-refID',()=>{
            setDisplayLoading(0)
            onChangeCurrentAlert('Sai mã giới thiệu')
        })
    },[])

    function getRefID(){
        setDisplayLoading(0.8)
        socket.emit('req-refID', user._id)
    }
    function addRefFor(){
        setDisplayLoading(0.8)
        socket.emit('add-ref-for',{id:user._id, RefFor: CurrentRefFor})
    }
    return(
        <section id="earnmore">
            <input value={CurrentRefFor} onChange={(e)=>{setCurrentRefFor(e.target.value)}} type="text" placeholder="Nhập mã giới thiệu"/>
            <button onClick={addRefFor}>Nhập mã giới thiệu nhận 2000Coins</button>
            <button style={RefID == '' ? {display:'inline-block'} : {display:'none'}} onClick={getRefID}>Lấy mã giới thiệu</button>
            <p>Chia sẽ app nhận 5% số coins kiếm được từ người giới thiệu</p>
            <p>{RefID == '' ? "Bạn chưa có mã giới thiệu" : "Mã giới thiệu của bạn: " + RefID}</p>
            <p>Nếu bạn phát hiện lỗi trong quá trình sử dụng, vui lòng báo cáo về Fanpage: fb.com/YTViewForView, mỗi lỗi báo cáo chính xác bạn sẽ được thưởng 60000Coin</p>
            <p style={{color:'#ff0000'}}>{CurrentAlert}</p>
        </section>
    )
}