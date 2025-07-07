let validation = {
    "id" : "validate" , 
    "title": "Validate" , 
    "contexts":["all"]
}
let quit_browser = {
    "id" : "" , 
    "title": "Quit_" , 
    "contexts":["all"]
}
let pause = {
    "id" : "pause" ,
    "title": "Pause" , 
    "contexts" : ["all"]
}
let clear = {
    "id" : "clear" ,
    "title": "Clear" , 
    "contexts" : ["all"]
}
let start = {
    "id" : "start" ,
    "title" : "Start" , 
    "contexts" : ["all"]
}
chrome.runtime.onInstalled.addListener(() =>{
    chrome.contextMenus.create(validation) ;
})
chrome.runtime.onInstalled.addListener(() =>{
    chrome.contextMenus.create(quit_browser) ;
})
chrome.runtime.onInstalled.addListener(()=>{
    chrome.contextMenus.create(pause) ;
})
chrome.runtime.onInstalled.addListener(()=>{
    chrome.contextMenus.create(clear) ;
})
chrome.contextMenus.onClicked.addListener((info , tab) =>{
    if(info.menuItemId === "validate"){
      console.log("Inside validate menu...") ;
        let obj = {
            "type" : "validation" ,
            "msg" : {}
        }
        chrome.tabs.sendMessage(tab.id , obj , ()=>{ return true ;}) ;
        console.log("Message Sent..")
    }
    else if(info.menuItemId === "quit_broswer"){
        let obj = {
            "type" : "quit_broswer"
        }
        chrome.tabs.sendMessage(tab.id , obj , ()=>{ return true ;}) ;
    }
    else if(info.menuItemId === "pause"){
        let obj = {
            "type" : "pause"
        }
        chrome.tabs.sendMessage(tab.id , obj , ()=>{ return true ;}) ;
        chrome.contextMenus.create(start) ;
        chrome.contextMenus.remove(info.menuItemId) ;
    }
    else if(info.menuItemId === "clear"){
        let obj = {
            "type" : "clear"
        }
        console.log("clear message event fired");
        chrome.tabs.sendMessage(tab.id , obj , ()=>{ return true ;}) ;

    }
    else if(info.menuItemId === "start"){
        let obj = {
            "type" : "start"
        }
        chrome.tabs.sendMessage(tab.id , obj , ()=>{ return true ;}) ;
        chrome.contextMenus.create(pause) ;
        chrome.contextMenus.remove(info.menuItemId) ;
    }


})
