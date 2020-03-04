import React, {useState, useCallback, useEffect} from 'react'
import io from 'socket.io-client/dist/socket.io';
import Header from './components/Header'
import Footer from './components/Footer'
import Loading from './components/Loading'
import MainComponentLogin from './components/Login/MainComponentLogin'
import MainComponentCampain from './components/Campain/MainComponentCampain'
import MainComponentView from './components/View/MainComponentView'
import MainComponentEarnmore from './components/Earnmore/MainComponentEarnmore'
import MainComponentProfile from './components/Profile/MainComponentProfile'
const connectionConfig = {
    jsonp: false,
    reconnection: true,
    reconnectionDelay: 100,
    reconnectionAttempts: 100000
  };
const socket = io('https://ytviewforview.xyz',connectionConfig);

const { ipcRenderer } = window.require("electron");

export default function App(){
    const [DisplayBar,setDisplayBar] = useState('none');
    const [Point, setPoint] =useState(0);
    const [RefID, setRefID] =useState('');
    const [RefFor, setRefFor] =useState('');
    const [Gmail, setGmail] =useState('');
    const [PassGmail, setPassGmail] =useState('');
    const [DisplayLoading, setDisplayLoading] = useState(0);
    const [AutoRunTime, setAutoRunTime] =useState(0);
    const [User, setUser] = useState('none');
    const [UserData, setUserData] = useState();
    const [ListVideo, setListVideo] = useState(UserData ? UserData.video : []);
    const [FooterTab, setFooterTab] = useState('');
    const loginSuccess = useCallback(data=>{
        ipcRenderer.send('storage-data',{username:data.user.username, password: data.user.password})
        setRefFor(data.user.refFor)
        setRefID(data.user.refID)
        setGmail(data.user.gmail)
        setPassGmail(data.user.gmailPass)
        setUserData(data)
        setListVideo(data.video)
        setDisplayBar('flex')
        setFooterTab('campain')
        setUser(data.user.username);
        setPoint(data.user.point);
        setAutoRunTime(data.user.autoRun)
        setFooterTab('campain')
    },[])
    const logoutSuccess = useCallback(()=>{
        setGmail('')
        setPassGmail('')
        setListVideo([])
        setDisplayBar('none')
        setFooterTab('')
        setUser('')
        setPoint(0)
        setAutoRunTime(0)
        setUserData({})
    },[loginSuccess])
    const [MainComponent, setMainComponent] = useState(<MainComponentLogin ipcRenderer={ipcRenderer} setDisplayLoading={setDisplayLoading} socket={socket} waitForLogin={loginSuccess}/>);
    const changeTab = useCallback((tabName)=>{
        setFooterTab(tabName)
    },[])

    useEffect(()=>{
        if(FooterTab==="campain"){
        setMainComponent(<MainComponentCampain ListVideo={ListVideo} setListVideo={setListVideo} setDisplayLoading={setDisplayLoading} Point={Point} setPoint={setPoint} socket={socket} UserData={UserData}/>)
        }else if(FooterTab === "view"){
        setMainComponent(<MainComponentView
            Gmail={Gmail}
            PassGmail={PassGmail}
            setDisplayLoading={setDisplayLoading} 
            setAutoRunTime={setAutoRunTime} 
            AutoRunTime={AutoRunTime} 
            setPoint={setPoint} 
            Point={Point} 
            socket={socket} 
            UserData={UserData}/>)
        }else if(FooterTab==="earnmore"){
        setMainComponent(<MainComponentEarnmore RefFor={RefFor} setRefFor={setRefFor} RefID={RefID} setRefID={setRefID} setDisplayLoading={setDisplayLoading} setPoint={setPoint} socket={socket} UserData={UserData}/>)
        }else if(FooterTab==="profile"){
        setMainComponent(<MainComponentProfile ipcRenderer={ipcRenderer} PassGmail={PassGmail} setPassGmail={setPassGmail} Gmail={Gmail} setGmail={setGmail} logoutSuccess={logoutSuccess} setDisplayLoading={setDisplayLoading} socket={socket} UserData={UserData} setUserData={setUserData}/>)
        }else{
            setMainComponent(<MainComponentLogin  ipcRenderer={ipcRenderer} setDisplayLoading={setDisplayLoading} socket={socket} waitForLogin={loginSuccess}/>)
        }
    },[FooterTab,Point,ListVideo,Gmail,PassGmail,AutoRunTime,RefFor,RefID,UserData,loginSuccess,logoutSuccess])
    
    useEffect(()=>{
        ipcRenderer.send('req-check-file')
        ipcRenderer.on('not-enought-file',()=>{
            setMainComponent(<h1 style={{textAlign:'center',color:'#ff0000'}}>Cài đặt thiếu file. Vui lòng tắt duyệt virus rồi cài lại ứng dụng</h1>)
        })
    },[])

    return(
        <>
        <Header DisplayBar={DisplayBar} style={{display:DisplayBar}} changeTab={changeTab} User={User} Point={Point} style={{display:DisplayBar}}/>
        <div className="container">
            {MainComponent}
        </div>
        <Footer DisplayBar={DisplayBar} waitChangeTab={changeTab} tab={FooterTab} style={{display:DisplayBar}}/>
        <Loading DisplayLoading={DisplayLoading}/>
        </>
    )
}