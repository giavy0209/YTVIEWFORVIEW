import React, {useState, useCallback, useEffect} from 'react'

export default function MainComponentLogin(props){
    const currentVersion = '1.2.0';
    let {setDisplayLoading,socket,ipcRenderer} = props
    const [Alert,setAlert] = useState('')
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = useCallback(()=>{
        if(username.length <6 || password.length < 6){
            setAlert('Tên đăng nhập và mật khẩu phải dài hơn 6 ký tự')
        }else{
            setDisplayLoading(0.8)
            socket.emit('client-login',{username, password,currentVersion})
        }
    },[username,password])
    const reg = useCallback(()=>{
        if(username.length <6 || password.length < 6){
            setAlert('Tên đăng nhập và mật khẩu phải dài hơn 6 ký tự')
        }else{
            setDisplayLoading(0.8)
            socket.emit('client-reg',{username, password})
        }
    },[username,password])
    useEffect(()=>{
        socket.on('already-login',()=>{
            setDisplayLoading(0)
            setAlert('Bạn đã đăng nhập trên 1 thiết bị khác. Đăng xuất khỏi thiết bị cũ và thử lại')
        })
        socket.on('login-fail',function(){
            setDisplayLoading(0)
            setAlert('Sai tên đăng nhập hoặc mật khẩu')
        })
        socket.on('login-success', function(data){
            setDisplayLoading(0)
            props.waitForLogin(data)
        })
        socket.on('reg-fail',function(){
            setDisplayLoading(0)
            setAlert('Tên đăng nhập đã tồn tại')
        })
        socket.on('reg-success',function(){
            setDisplayLoading(0)
            setAlert('Đăng ký thành công, vui lòng bấm đăng nhập')
        })
        socket.on('old-version', ()=>{
            setDisplayLoading(0)
            setAlert('Bạn đang dùng phiên bản cũ, truy cập fanpage facebook để tải phiên bản mới nhất của ứng dụng')
        })
        socket.on('undefind', ()=>{
            setDisplayLoading(0)
            setAlert('Kết nối đến server bị lỗi. Truy cập fanpage để được hỗ trợ thêm')
        })
        ipcRenderer.send('req-userInfo')
        ipcRenderer.on('res-userInfo',(event,data)=>{
            if(data.username && data.password){
                setDisplayLoading(0.8)
                data.currentVersion = currentVersion;
                socket.emit('client-login-with-data',data)
            }
        })
    },[])
    return(
        <section id="login">
            <p>Vui lòng đăng nhập, hoặc đăng ký</p>
            <p>Tên đăng nhập và mật khẩu phải dài hơn 6 ký tự, được phép có dấu, khoảng trắng, ký tự đặt biệt, số và chữ</p>
            <input onChange={(e)=>setUsername(e.target.value)} value={username} type="text" placeholder="user name"/>
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="text" placeholder="password"/>
            <button onClick={()=>{login()}}>Đăng nhập</button>
            <button onClick={()=>{reg()}}>Đăng ký</button>
            <p className="alert"> {Alert} </p>
            <div className="button-fb"><a href="https://fb.me/YTViewForView"><i className="fab fa-facebook-f"></i>Theo dõi fanpage để nhận cập nhật nhanh nhất</a></div>
        </section>
    )
}