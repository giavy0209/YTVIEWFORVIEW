import React, {useState, useCallback, useEffect} from 'react'

export default function MainComponentLogin({ipcRenderer,logoutSuccess,socket,setDisplayLoading,UserData,Gmail,setGmail,PassGmail,setPassGmail}){
    const [Noti, setNoti] = useState('');
    const [CurrentGmail,setCurrentGmail] = useState(Gmail)
    const [CurrentPassGmail,setCurrentPassGmail] = useState(PassGmail)
    useEffect(()=>{
        socket.on('gmail-used',data=>{
            setDisplayLoading(0)
            setNoti('Gmail này đã được sử dụng cho tài khoản '+data.username+'.Nếu đó là bạn, hãy sử dụng tài khoản '+data.username+' để sử dụng hoặc tạo Gmail khác để sử dụng cho tài khoản này. Nếu bạn không sở hữu tài khoản đó vui lòng liên hện Fanpage để được hỗ trợ.')
        })
        socket.on('wrong-gmail',()=>{
            setDisplayLoading(0)
            setNoti('Sai định dạng Gmail')
        })
        socket.on('logout-success',()=>{
            setDisplayLoading(0)
            logoutSuccess()
        })
        ipcRenderer.on('logouted',()=>{
            socket.emit('logout',UserData.user._id)
        })
    },[])

    const ValidateEmail = useCallback(()=>{
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(CurrentGmail.match(mailformat) && CurrentGmail.indexOf('@gmail.com') != -1){
            setDisplayLoading(0.8)
            socket.emit('edit-gamil',{id:UserData.user._id,gmail:CurrentGmail})
            socket.removeEventListener('edit-mail-success')
            socket.on('edit-mail-success',()=>{
                setDisplayLoading(0)
                setNoti('Sửa Gmail thành công')
                setGmail(CurrentGmail)
            })
        }
        else {
            setNoti('Định định dạng gmail bạn nhập không đúng. Chỉ chấp nhận gmail, các loại mail khác đều không hợp lệ')
        }
    },[CurrentGmail])

    const editPassGmail = useCallback(()=>{
        setDisplayLoading(0.8)
        socket.emit('edit-pass-gmail',{id:UserData.user._id, gmailPass:CurrentPassGmail})
        socket.on('edit-pass-gmail-success',()=>{
            socket.removeEventListener('edit-pass-gmail-success')
            setDisplayLoading(0)
            setNoti('Cập nhật mật khẩu Gmail thành công.')
            setPassGmail(CurrentPassGmail)
        })
    },[CurrentPassGmail])

    const logout = useCallback(()=>{
        setDisplayLoading(0.8)
        ipcRenderer.send('logout')
    })


    return(
        <section id="profile">
            <p>Nhập ít nhất Gmail để chạy view</p>
            <input value={CurrentGmail} onChange={(e)=>{setCurrentGmail(e.target.value)}} type="text" placeholder="Nhập Gmail" />
            <input value={CurrentPassGmail} onChange={(e)=>{setCurrentPassGmail(e.target.value)}} type="text" placeholder="Nhập mật khẩu gmail để tự đăng nhập" />
            <button onClick={()=>{ValidateEmail()}}>Cập nhật Gmail</button>
            <button onClick={()=>{editPassGmail()}}>Cập nhật mật khẩu</button>
            <button onClick={()=>{logout()}}>Đăng xuất khỏi thiết bị này</button>
            <p style={{color:'#ff0000'}}>{Noti}</p>
        </section>
    )
}