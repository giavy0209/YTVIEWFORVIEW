import React, {useState, useCallback, useEffect} from 'react'

export default function MainComponentView({Gmail,PassGmail,setPoint,setDisplayLoading,UserData,socket}){
    let {user} = UserData;
    const [AutoRunStatus, setAutoRunStatus]= useState(false)
    const [IsNotFirstRender, setIsNotFirstRender]= useState(false)
    const [IsCheckLoginGmail, setIsCheckLoginGmail] =useState(false);
    const [CurrentVideoInfo, setCurrentVideoInfo]= useState({})
    const [URL, setURL]= useState('')
    const [Time, setTime]= useState(0)
    const [Alert, setAlert] = useState('Vui lòng chờ hệ thống xác thực gmail');
    const [IsWrongFB, setIsWrongFB] = useState(false)

    const reqVideo = useCallback(()=>{
        setAutoRunStatus(true)
        setDisplayLoading(0.8)
        socket.emit('req-list-view',user._id);
    },[])

    useEffect(()=>{
        if(IsWrongFB){
            console.log('wrong-fb')
            setIsWrongFB(false)
            socket.emit('watched-video',{userID: user._id,videoID:CurrentVideoInfo._id,isAutoRun:false})
        }
    },[IsWrongFB,CurrentVideoInfo])
    useEffect(()=>{
        document.querySelector('webview').addEventListener('did-frame-finish-load',e=>{
            if(e.target.src.includes('https://accounts.google.com/')){
                document.querySelector('webview').executeJavaScript(`
                    document.getElementById('identifierId').value = "`+Gmail+`"
                    document.getElementById('identifierNext').click()
                    setTimeout(() => {
                        document.querySelector('#password input').value = "`+PassGmail+`"
                        document.getElementById('passwordNext').click();
                        setTimeout(()=>{
                            document.body.insertAdjacentHTML('afterbegin','<h1 style="text-align:center;position: relative;z-index: 9999;background-color:#ff8178">Tự động đăng nhập thất bại. Bạn hãy thực hiện đăng nhập bằng tay<h1/>')
                        },5000)
                    }, 5000);
                `)
            }
            
            if(e.target.src.includes('https://myaccount.google.com')){
                document.querySelector('webview').executeJavaScript(`
                function checkLogin(){
                    array = document.querySelectorAll('header a')
                    for (let index = 0; index < array.length; index++) {
                        const element = array[index];
                        if(element.getAttribute('aria-label')){
                            if(element.getAttribute('aria-label').toLowerCase().indexOf('`+Gmail+`'.toLowerCase()) != -1 ){
                                return true
                                break
                            }
                        }
                        if(index == array.length - 1){
                            return false
                        }
                    }
                }
                checkLogin()
                `).then(isRight=>{
                    if(isRight){
                        setAlert('Bạn đã đăng nhập google thành công. Bạn có thể xem video để kiếm điểm')
                        setIsCheckLoginGmail(true)
                    }else{
                        setAlert('Tài khoản google bạn nhập không khớp với gmail đã xác thực. Bạn cần nhập đúng gmail đã xác thực')
                    }
                })
            }

            if(e.target.src.includes('https://m.facebook.com/')&&!e.target.src.includes('https://lm.facebook.com/')){
                document.querySelector('webview').executeJavaScript(`
                    function checkURL(){
                        var url = document.querySelector("#m_story_permalink_view #u_0_1")
                        if(url){
                            var ytURL =  url.getAttribute('href')
                            return ytURL
                        }else{
                            return false
                        }
                    }
                    checkURL()
                `).then(url=>{
                    if(url){
                        setURL(url)
                    }else{
                        setIsWrongFB(true)
                        setDisplayLoading(0.8)
                    }
                })
            }
        })

        socket.on('res-list-view',function(video){
            setDisplayLoading(0)
            setCurrentVideoInfo(video)
            if(video.videoID.includes('www.facebook')){
                setURL(video.videoID.replace('www','m'))
            }else if(video.videoID.includes('https://facebook')){
                setURL(video.videoID.replace('https://','https://m.'))
            }else{
                setURL(video.videoID)
            }
        })
        socket.on('updated-status',data=>{
            setDisplayLoading(0)
            setPoint(data.point)
            reqVideo()
        })
        socket.on('no-video',function(){
            setDisplayLoading(0)
            setAlert('Đã hết video để xem, bạn vui lòng thử lại sau. Để kiếm thêm coin, hãy tham khảo tab kiếm thêm')
            setURL('https://youtube.com');
            setTimeout(() => {
                reqVideo()
            }, 10000);
        })
    },[])

    React.useEffect(()=>{
        setIsNotFirstRender(true)
        if(IsNotFirstRender){
            setTimeout(() => {
                if(Time > 0){
                    setTime(Time - 1)
                }else{
                    setURL('')
                    setDisplayLoading(0.8)
                    setTimeout(() => {
                        socket.emit('watched-video',{userID: user._id,videoID:CurrentVideoInfo._id,isAutoRun:false})
                    }, 5000);
                }
            }, 1000);
        }
    },[Time])

    useEffect(()=>{
        if(URL.includes('https://lm.facebook.com') || URL.includes('youtube.com') ||URL.includes('youtu.be')){
            setTime(CurrentVideoInfo.totalTime)
        }
    },[URL,CurrentVideoInfo])

    
    return(
        <section id="view">
            <webview style={IsCheckLoginGmail? {width:"100%", height:300, marginTop:20, pointerEvents:'none'}:{width:'100%', height:400,marginTop:20, pointerEvents:"all"}}
            src={IsCheckLoginGmail ? URL : "https://accounts.google.com/"}
            webpreferences="javascript=1"
            useragent="Mozilla/5.0 (Windows NT 10.0; WOW64; rv:70.0) Gecko/20100101 Firefox/70.0">
            </webview>
            <button 
            style={{position:'relative'}}
            className={AutoRunStatus || !IsCheckLoginGmail ?"button-disable" : ''} 
            onClick={()=>{reqVideo()}}>
                Xem video
            </button>
            <div className="video-detail">
                <p>{Time ? Time:0}</p>
                <p>Secons</p>
            </div>
            <div className="video-detail">
                <p>{CurrentVideoInfo.totalTime ? CurrentVideoInfo.totalTime*9/10:0}</p>
                <p>Coins</p>
            </div>
            <p style={{color:'#ff0000'}}>{Alert}</p>
        </section>
    )
}