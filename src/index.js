let prevXPath = "";
let prevDefaultIframe = "";
let defaultIframe = "";
let pause = true;
let reg = />+-+\s*/g;
//let yaml = require("js-yaml") ;
function getElementByXpath(path, doc) {
    return doc.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
function getXPath(elm, doc) {
    var allNodes = doc.getElementsByTagName('*');
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
        if (elm.hasAttribute('id')) {
            var uniqueIdCount = 0;
            for (var n = 0; n < allNodes.length; n++) {
                if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
                if (uniqueIdCount > 1) break;
            };
            if (uniqueIdCount == 1) {
                segs.unshift('//' + elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
                return segs.join('/');
            } else {
                segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
            }
        } else if (elm.hasAttribute('class')) {
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
        } else {
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                if (sib.localName == elm.localName) i++;
            };
            segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
        };
    };
    return segs.length ? '//' + segs.join('/') : null;
};
function updateTask(task) {
    console.log("UpdateTask Worked!!!!");
    chrome.storage.sync.get("storagekey", function (result) {
        var array = result["storagekey"] ? result["storagekey"] : [];
        console.log(task);
        array.push.apply(array, task);
        var jsonObj = {};
        jsonObj["storagekey"] = array;
        console.log(array);
        chrome.storage.sync.set(jsonObj, () => {
        });
    });
}
function updateStatus() {
    console.log("UpdateStatus is working!!!!");
    chrome.storage.sync.get("updateKey", function (result) {
        let key = result["updateKey"] ? result["updateKey"] : false;
        pause = key;
    });
}
let fill_data = (xpath, value) => {
    let json_obj = {
        "fill_data": {
            "xpath": `${xpath}`,
            "value": `${value}`
        }
    };
    return json_obj;
}
function switch_iframe(xpath) {
    let json_obj = {
        "switch_iframe": {
            "xpath": `${xpath}`
        }
    };

    return json_obj;
}
function switch_to_default_iframe() {
    let json_obj = {
        "switch_to_default_iframe": {}
    }

    return json_obj;
}
let click_button = (xpath) => {
    let json_obj = {
        "click_button": {
            "xpath": `${xpath}`
        }
    };

    return json_obj;
};
let validate = (xpath) => {
    let json_obj = {
        "xpath": `${xpath}`
    }

    return json_obj;
};
// function getCountOfPath(xpath , doc){
//     let count = doc.evaluate(`count(${xpath})` , document , null , XPathResult.ANY_TYPE , null).numberValue ;
//     return count ;
// }
// function getXPath(tarelement , doc){
//     let XPath = "" ;
//     let minXPath = "" ;
//     let min = 10000 ;
//     tagName = tarelement.tagName.toLowerCase() ;
//    if(tagName === ""){
//        tagName = '*' ;
//    }
//    let attributes = tarelement.attributes ;
//    Array.prototype.slice.call(attributes).forEach(element => {
//        let temp = `//${tagName}[@${element.name}='${element.value}']` ;
//        let count = getCountOfPath(temp , doc) ;
//        if(count < min && element.value !== ""){
//            minXPath = temp ;
//            min = count ;
//        }
//        if(count === 1 && element.value !== ""){
//            if(XPath === ""){
//                XPath = temp ;
//            }
//        }
//    });
//    if(XPath === ""){
//        return `${minXPath}[1]`;
//    }
//    else{
//        return XPath ;
//    }
// }
function fillDataEvent(event) {
    let task = [] ;
    console.log("Inside fillDataEvent");
    let idoc = event.view.document ;
    if (prevXPath !== "") {
        console.log(prevXPath);
        let tarelement = getElementByXpath(prevXPath, idoc);
        console.log(tarelement);
        if (tarelement !== null) {
            let prevTagName = tarelement.tagName.toLowerCase();
            let prevVal = tarelement.value;
            console.log("JUST above fill_data task");
            if ((prevTagName === "input" || prevTagName === "textarea")) {
                console.log("This has been fired after if condition passed");
                console.log(fill_data(prevXPath, prevVal));
                console.log("This is the XPath " + prevXPath);
                task.push(fill_data(prevXPath, prevVal));
                console.log("This has been printed by fill data event:" + prevVal + "at path" + prevXPath);
            }
        }
    }
    let tarelement = event.target;
    let XPath = getXPath(tarelement, idoc);
    prevXPath = XPath;
    console.log(click_button(XPath));
    console.log("This is the XPath " + XPath);
    task.push(click_button(XPath));

    return task ;
}
function eventHandlerInIframe(event) {
    let task = [];
    console.log("You Clicked into iframe");
    let XiPath = getXPath(document.activeElement, document);
    console.log("Active element in parent window is :" + XiPath);
    prevDefaultIframe = defaultIframe;
    defaultIframe = `${XiPath}`;
    if (prevDefaultIframe != defaultIframe) {
        if (prevDefaultIframe === "") {
            console.log("switch to iframe :" + XiPath);
            task.push(switch_iframe(XiPath));
        }
        else {
            console.log("Switch to default frame");
            task.push(switch_to_default_iframe());
            console.log("switch to iframe :" + XiPath);
            task.push(switch_iframe(XiPath));
        }
    }
    let tas = fillDataEvent(event) ;
    task.push.apply(task, tas);
    updateTask(task);
}
function findAllFrames(document) {
    let allIframe = document.getElementsByTagName("iframe");
    // console.log("The number of Iframes are : " + allIframe.length) ;
    Array.prototype.slice.call(allIframe).forEach(iframe => {
        // let iframePath = getXPath(iframe) ;
        //console.log(iframePath) ;
        let iwindow = iframe.contentWindow;
        let idoc = iwindow.document;
        // console.log("Event Listener added to " + iframe.id); 

            if(iframe.id === "operationsIFrame"){
                console.log("Printing idoc") ;
                console.log(idoc.body) ;
            }
            iwindow.addEventListener('click', eventHandlerInIframe);

        //  idoc.addEventListener('DOMSubtreeModified' , (event)=>{
        //      console.log("Inside IDOC Listener!!") ;
        //      console.log(event.path[3]) ;
        //      let iwin = event.path[3] ;
        //      iwin.addEventListener('click', eventHandlerInIframe);
        //  })
    });
}
updateStatus();
window.addEventListener("keyup", function (event) {
    console.log(event.target.tagName);
    let tarelement = document.activeElement;
    prevXPath = getXPath(tarelement, document);
    // if (event.key === 'Enter') {
    //     console.log("AAAAAAA") ;
    //     console.log(event) ;
    //     if(pause === false){
    //         let task = [] ;
    //     console.log("This is triggered by Enter Keyword " + event.target.tagName) ;
    //         prevDefaultIframe = defaultIframe ;
    //         defaultIframe = "" ;
    //         if(prevDefaultIframe != defaultIframe){
    //             console.log("switch to default Iframe") ;
    //             task.push(switch_to_default_iframe()) ;
    //         }
    //            fillDataEvent(event , task) ;
    //            updateTask(task) ;
    //     }
    // }
});
document.addEventListener('DOMSubtreeModified' , ()=>{
    // console.log("Inside DOMsubtreeModified") ;
    findAllFrames(document) ;
    // if(document.activeElement != null){
    //     let tarelement = document.activeElement ;
    //     console.log("Getting Active element " + tarelement.tagName) ;
    //     prevXPath = getXPath(tarelement) ;
    // }
})
// window.addEventListener('mousedown' , (event) =>{
//     updateTask([document]) ;
// })
window.addEventListener('click', (event) => {
    if (pause === false) {
        let task = [];
        console.log("Active element is in original window :" + document.activeElement.tagName);
        prevDefaultIframe = defaultIframe;
        defaultIframe = "";
        if (prevDefaultIframe != defaultIframe) {
            console.log("switch to default Iframe");
            task.push(switch_to_default_iframe);
        }
        task.push.apply(task, fillDataEvent(event));
        updateTask(task);
    }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "validation") {
        updateTask([validate(XPath)]);
    }
    else if (request.type === "quit_broswer") {
        console.log("inside quit_browser");
        // chrome.storage.sync.get("storagekey", function (result) {
        //     var array = result["storagekey"];
        //     chrome.storage.sync.remove("storagekey", () => { });
        //     var task = { 'task': array };
        //     let data = yaml.dump(JSON.parse(JSON.stringify(task)));
        //     let dat = data.replace(reg , '') ;
        //     console.log("This is printed by dat :" + dat) ;
        //     let blob = new Blob([dat] , { type: 'application/yaml'});
        //     let url = URL.createObjectURL(blob);
        //     var a = document.createElement('a');
        //     a.href = url;
        //     a.download = "daksha.yaml";
        //     a.style.display = 'none';
        //     document.body.appendChild(a);
        //     a.click();
        //     delete a;
        // });
    }
    else if (request.type === "pause") {
        console.log("Recording Paused !!!");
        var jsonObj = {};
        jsonObj["updateKey"] = true;
        chrome.storage.sync.set(jsonObj, () => {
        });
        pause = true;
    }
    else if (request.type === "start") {
        console.log("Recording started !!!!");
        var jsonObj = {};
        jsonObj["updateKey"] = false;
        chrome.storage.sync.set(jsonObj, () => {
        });
        pause = false;
    }
    else if (request.type === "clear") {
        chrome.storage.sync.remove("storagekey", () => { });
        chrome.storage.sync.remove("updateKey", () => { });
        console.log("StorageKey Cleared!!!");
        prevXPath = "";
        prevDefaultIframe = "";
        defaultIframe = "";
    }

    return true;
})
