import React, {useState, useCallback, useEffect} from 'react'
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
export default function MainComponentCampain({setDisplayLoading,socket,UserData,Point,setPoint,ListVideo,setListVideo}){
    var {video,user} = UserData;
    const [Noti, setNoti] = React.useState('');
    const [VideoID, setVideoID] = React.useState('');
    const [TotalView, setTotalView] = React.useState(20);
    const [TotalTime, setTotalTime] = React.useState(60);
    const arrTime = [];
    const arrView=[];
    const [WebRef, setWebRef] = React.useState('');
    const [BuyAble, setBuyAble] = React.useState(false);

    for(let i = 60; i <= 600; i+=30){
        arrTime.push(i+'')
    };
    for(let i = 20; i <= 1000; i+=20){
        arrView.push(i+'')
    }
    
    function buy(){
        if(Number(TotalView)*Number(TotalTime) > Point){
            setNoti('Không đủ coins')
        }else{
            setDisplayLoading(0.8)
            socket.on('add-video-success',function(newVideo){
                socket.removeListener('add-video-success')
                // setThisPoint(ThisPoint-Number(TotalView)*Number(TotalTime))
                setPoint(Point-Number(TotalView)*Number(TotalTime))
                setDisplayLoading(0);
                video.push(newVideo)
                setListVideo([...video])
                setNoti('Thêm view video thành công')
            })
            socket.emit('client-add-video',{
                totalTime:Number(TotalTime),
                totalView:Number(TotalView),
                id:user._id,
                videoID:VideoID
            });
        }
    }
    // function comfirmBuy(){
    //     Alert.alert(
    //         'Xác nhận đúng video?',
    //         'Sau khi mua bạn sẽ không thể sửa lại link nếu sai',
    //         [
    //           {
    //             text: 'Cancel',
    //           },
    //           {text: 'OK', onPress: () => buy()},
    //         ],
    //         {cancelable: true},
    //     );
    // }
    function deleteVideo(id){
        confirmAlert({
            title: 'Xác nhận xóa',
            message: 'Sau khi xóa bạn sẽ không thể khôi phục lại',
            buttons: [
              {
                label: 'OK',
                onClick: () => {
                    socket.emit('client-delete-video',id)
                    setDisplayLoading(0.8)
                    socket.on('delete-video-success',function(){
                        socket.removeListener('delete-video-success')
                        var index = video.findIndex(item => item._id === id)
                        video.splice(index,1)
                        setDisplayLoading(0);
                        setListVideo([...video])
                        setNoti('Xóa Video thành công')
                    })
                }
              },
              {
                label: 'Từ từ suy nghĩ lại',
                onClick: () => {}
              }
            ]
          });
    }

    React.useEffect(()=>{
        document.querySelector('webview').addEventListener('did-stop-loading', e=>{
            if(e.target.src.includes('m.facebook.com')){
                document.querySelector('webview').executeJavaScript(`
                    function checkurl(){
                        var aurl = document.querySelector("#m_story_permalink_view #u_0_1")
                        if(aurl){
                            var url = aurl.getAttribute('href')
                            if(url){
                                return url
                            }else{
                                return false
                            }
                        }else{
                            return false
                        }
                    }
                    checkurl()
                `).then(url=>{
                    if(url){
                        if(url.includes('youtube.com') || url.includes('youtu.be')){
                            setNoti('Link của bạn đã chính xác. Bạn có thể mua view')
                            setBuyAble(true)
                            console.log(url)
                        }
                    }else{
                        setNoti('Link của bạn chưa đúng, kiểm tra bài viết trên facebook phải để ở chế độ công khai.')
                        setBuyAble(false)
                        console.log(url)
                    }
                })
            }
        })
        socket.on('add-video-fail',function(){
            setNoti('Không đủ coins');
            setDisplayLoading(0);
        })
        socket.on('add-video-fail-much',function(){
            setNoti('Bạn đã chạy 5 video, vui lòng xóa bớt các video đã chạy xong');
            setDisplayLoading(0);
        })
        socket.on('not-veri-mail',()=>{
            setNoti('Bạn chưa xác thực gmail, vui lòng click vào icon góc trên bên phải để xác thực gmail')
            setDisplayLoading(0);
        })
    },[])
    React.useEffect(()=>{
        if(VideoID.includes('https://m.facebook.com/') || VideoID.includes('https://www.facebook.com/')){
            console.log('run')
            
        }else{
            setNoti('Link của bạn chưa đúng, kiểm tra bài viết trên facebook phải để ở chế độ công khai.')
            setBuyAble(false)
        }

    },[VideoID])
    
    return(
        <section  id="campain">
            <p>Link bài viết facebook có định dạng như sau: "https://m.facebook.com/tên của bạn/posts/id bài viết", bài viết phải để ở chế độ công khai. Nên sử dụng tài khoản facebook trắng để đăng bài. Xem hướng dẫn chi tiết tại fanpage</p>
            <p>Sau khi nhập link, hãy kiểm tra chắc chắn đúng bài viết của bạn cần mua view. Bạn không thể thay đổi sau khi đã tạo chiến dịch</p>
            <input placeholder="Nhập Link bài viết" type="text" onChange={(e)=>{
                setNoti('Link của bạn chưa đúng, kiểm tra bài viết trên facebook phải để ở chế độ công khai.')
                setBuyAble(false)
                if(e.target.value.includes('https://') && e.target.value.includes('facebook.com')){
                    if(e.target.value.includes('https://www')){
                        setVideoID(e.target.value.replace('www','m'))
                    }else if(e.target.value.includes('https://facebook')){
                        setVideoID(e.target.value.replace('https://','https://m.'))
                    }else{
                        setVideoID(e.target.value)
                    }
                }else{
                    setNoti('Link của bạn chưa đúng, kiểm tra bài viết trên facebook phải để ở chế độ công khai.')
                    setBuyAble(false)
                }
            }} />
            <div className="select">
                <p>Thời gian xem(giây)</p>
                <select onChange={e=>{setTotalTime(e.target.value)}}>
                    {arrTime.map(time=>{
                        return(
                            <option key={time} value={time}>{time}s</option>
                        )
                    })}
                </select>
            </div>
            <div className="select">
                <p>Số lượt xem</p>
                <select onChange={e=>{setTotalView(e.target.value)}}>
                    {arrView.map(view=>{
                        return(
                            <option key={view} value={view}>{view}</option>
                        )
                    })}
                </select>
            </div>
            <p>Tổng chi phí: {TotalTime*TotalView} </p>
            <button onClick={()=>{buy()}} style={BuyAble? {backgroundColor:'blue'}:{backgroundColor:'#ccc', pointerEvents:'none'}} >Mua View</button>
            <p>{Noti}</p>
            <webview 
            style={{width:'100%', height:500,pointerEvents:'none',marginTop:20}} 
            src={VideoID} webpreferences="allowRunningInsecureContent=1, javascript=1"
             useragent="Mozilla/5.0 (Windows NT 10.0; WOW64; rv:70.0) Gecko/20100101 Firefox/70.0"
            > 
            </webview>
            <div className="list-running">
                <h1>Video đang chạy</h1>
                {video.map(video=>{
                    return(
                        <div className="running">
                            <p>{video.videoID}</p>
                            <p>{video.totalTime}s</p>
                            <p>{video.finish}/{video.totalView}view</p>
                            <i onClick={()=>{deleteVideo(video._id)}} className="fas fa-trash"></i>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}