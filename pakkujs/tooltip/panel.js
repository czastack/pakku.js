/*
var panel_src=`
<div class="pakku-panel">
    <p class="pakku-panel-title">
        <button type="button" class="pakku-panel-close">关闭</button>
        <span class="pakku-panel-text"></span>
    </p>
    <hr>
    <div class="pakku-panel-desc"></div>
    <hr class="pakku-for-desc">
    <div class="pakku-panel-peers"></div>
    <hr>
    <div class="pakku-panel-footer text-fix"></div>
</div>
`;
*/
function make_panel_dom() {
    var dom=make_elem('div','pakku-panel');
    var dom_title=make_elem('p','pakku-panel-title');
    var dom_close=make_elem('button','pakku-panel-close');
    
    dom_close.type='button';
    dom_close.textContent='关闭';
    
    dom_title.appendChild(dom_close);
    dom_title.appendChild(make_elem('span','pakku-panel-text'));
    
    dom.appendChild(dom_title);
    dom.appendChild(make_elem('hr',''));
    dom.appendChild(make_elem('div','pakku-panel-desc'));
    dom.appendChild(make_elem('hr','pakku-for-desc'));
    dom.appendChild(make_elem('div','pakku-panel-peers'));
    dom.appendChild(make_elem('hr',''));
    dom.appendChild(make_elem('div','pakku-panel-footer text-fix'));
    
    return dom;
};

var style_src=`

.pakku-panel {
    background-color: rgba(243,243,243,.8);
    color: black;
    width: 300px;
    position: absolute;
    z-index: 10000;
    top: 10px;
    padding: 5px;
    border-radius: 5px;
    left: -305px;
    box-shadow: 2px 2px 50px black;
}
.pakku-panel-title {
    overflow-x: hidden;
    text-overflow: ellipsis;
    line-height: calc(1em + 6px);
    vertical-align: middle;
}
.pakku-panel-close {
    color: black !important;
    background-color: #f3f3f3 !important;
    border-radius: 5px;
    border: 1px solid black !important;
    padding: 3px;
    cursor: pointer;
    margin-right: 5px;
}
.pakku-panel-desc {
    line-height: 1.2em;
}
.pakku-panel-peers {
    height: 350px;
    overflow-y: auto;
}
.pakku-panel-footer {
    overflow: hidden;
    text-overflow: ellipsis;
}

.pakku-panel * {
    user-select: initial !important;
}
.pakku-panel a {
    color: black;
    border-bottom: 1px solid black;
}
.pakku-panel .text-fix {
    overflow-x: hidden;
    text-overflow: ellipsis;
    line-height: calc(1em + 6px);
    vertical-align: middle;
}
.pakku-panel-footer a {
    display: inline-block;
}
.pakku-panel-desc:empty~hr.pakku-for-desc {
    display: none;
}
.pakku-panel * {
    font-family: Consolas, Courier, '微软雅黑', 'Microsoft Yahei', '宋体', monospace;
}
.pakku-panel-peers p:nth-child(1) {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.pakku-panel-peers p:nth-child(2) {
    display: none;
}
.pakku-panel-footer:empty::after {
    content: '可以在 pakku 的选项中关闭弹幕信息显示框';
}

.pakku-panel-peers div {
    cursor: pointer;
}
.pakku-panel-peers div:hover p:nth-child(1) {
    white-space: initial;
    word-wrap: break-word;
    word-break: break-all;
}
.pakku-panel-peers div:hover p:nth-child(2) {
    display: initial;
}
.pakku-panel-peers div.black {
    background-color: rgba(0,0,0,.8);
}
.pakku-panel-peers div.white {
    background-color: rgba(255,255,255,.8);
}
.pakku-panel-peers div.black:hover {
    background-color: rgba(0,0,0,1);
}
.pakku-panel-peers div.white:hover {
    background-color: rgba(255,255,255,1);
}
`;
var global_style_obj=document.createElement('style');
global_style_obj.textContent=style_src;

var _mem_uidhash={};
function _load_uidhash(uidhash,logger,callback) {
    if(_mem_uidhash[uidhash]) {
        callback(_mem_uidhash[uidhash]);
        return;
    }
    var xhr=new XMLHttpRequest();
    xhr.open('get','//biliquery.typcn.com/api/user/hash/'+uidhash+'?_ABOUT_THIS_REQUEST_='+DISCLAIMER);
    xhr.onreadystatechange=function() {
        if(this.readyState!=4) return;
        var res;
        try {
            if(this.status!=200) throw 1;
            res=JSON.parse(this.responseText);
        } catch(e) {
            logger.textContent=uidhash+' UID 获取失败';
            throw e;
        }
        callback(_mem_uidhash[uidhash]=res);
    };
    xhr.send();
}
var _mem_info={};
function _load_info(uid,logger,callback) {
    if(_mem_info[uid]) {
        callback(_mem_info[uid]);
        return;
    }
    var xhr=new XMLHttpRequest();
    xhr.open('get','//api.bilibili.com/cardrich?type=json&mid='+uid);
    xhr.onreadystatechange=function() {
        if(this.readyState!=4) return;
        var res;
        try {
            if(this.status!=200) throw 1;
            res=JSON.parse(this.responseText);
        } catch(e) {
            logger.innerHTML='';
            logger.appendChild(make_a(
                uidhash+' ('+uid+') 个人信息加载失败',
                '//space.bilibili.com/'+uid
            ));
            throw e;
        }
        callback(_mem_info[uid]=res);
    }
    xhr.send();
}

function query_uid(uidhash,logger) {
    logger.textContent=uidhash+' 正在获取 UID...';
    _load_uidhash(uidhash,logger,function(res) {
        if(res.error) {
            logger.textContent=uidhash+' UID 未收录';
            return;
        }
        var uid;
        try {
            uid=parseInt(res.data[0].id);
        } catch(e) {
            logger.textContent=uidhash+' UID 无效';
            throw e;
        }
        logger.textContent=uidhash+' ('+uid+') 正在加载个人信息...';
        _load_info(uid,logger,function(res) {
            var nickname,lv,exp,regtime;
            try {
                nickname=res.data.card.name;
                lv=res.data.card.level_info.current_level;
                exp=res.data.card.level_info.current_exp;
                regtime=new Date(res.data.card.regtime*1000);
            } catch(e) {
                logger.innerHTML='';
                logger.appendChild(make_a(
                    uidhash+' ('+uid+') 个人信息无效',
                    '//space.bilibili.com/'+uid
                ));
                throw e;
            }
            
            logger.innerHTML='';
            logger.appendChild(make_a(
                uidhash+': Lv'+lv+'('+exp+') @'+format_date(regtime)+' '+nickname,
                '//space.bilibili.com/'+uid
            ));
        })
    })
}

console.log('pakku panel: script injected, D.length = '+D.length);
for(var i=0;i<D.length;i++)
    D[i].text=D[i].text.replace(/[\r\n\t]/g,'');

var try_left=20;
function try_inject() {
    var danmu_lists=[].slice.call(document.querySelectorAll('.bilibili-player-danmaku'));
    // maybe player is in an iframe
    [].slice.call(document.querySelectorAll('iframe')).forEach(function(frame) {
        try {
            [].slice.call(frame.contentDocument.querySelectorAll('.bilibili-player-danmaku')).forEach(function(elem) {
                danmu_lists.push(elem);
            })
        } catch(e) { // maybe cross-domain
            console.error(e);
        }
    })
    if(!danmu_lists.length) { // maybe player is not ready yet
        if(--try_left)
            setTimeout(try_inject,500);
        return;
    }
    
    danmu_lists.forEach(function(list_elem) {
        console.log('bind danmu-list obj ',list_elem);
        var panel_obj=document.createElement('div');
        
        panel_obj.style.display='none';
        panel_obj.appendChild(make_panel_dom());
        panel_obj.querySelector('.pakku-panel-close').addEventListener('click',function() {
            panel_obj.style.display='none';
        });
        document.addEventListener('click',function(e) {
            if(!panel_obj.contains(e.target) && !list_elem.contains(e.target))
                panel_obj.style.display='none';
        });
        
        list_elem.appendChild(panel_obj);
        panel_obj.appendChild(global_style_obj);
        
        list_elem.addEventListener('click',function(e) {
            var dm_obj=e.target.parentElement;
            if(dm_obj && dm_obj.classList.contains('danmaku-info-row') && dm_obj.getAttribute('dmno')) {
                var dm_str=dm_obj.querySelector('.danmaku-info-danmaku').title.replace(/[\r\n\t]/g,'');
                var dmno=parseInt(dm_obj.getAttribute('dmno'));
                var text_container=panel_obj.querySelector('.pakku-panel-text'),
                    desc_container=panel_obj.querySelector('.pakku-panel-desc'),
                    peers_container=panel_obj.querySelector('.pakku-panel-peers'),
                    footer_container=panel_obj.querySelector('.pakku-panel-footer');
                
                
                panel_obj.style.display='block';
                text_container.textContent='';
                desc_container.innerHTML='';
                peers_container.innerHTML='';
                footer_container.textContent='';
                
                var info=null;
                // the list might be sorted in a wrong way, so let's guess the index
                if(D[dmno] && D[dmno].text===dm_str)
                    info=D[dmno];
                else {
                    var cnt=0;
                    for(var i=0;i<D.length;i++)
                        if(D[i].text===dm_str) {
                            info=D[i];
                            cnt++;
                        }
                    if(cnt>1)
                        desc_container.appendChild(make_p('* 数据可能不准确'));
                }
                
                if(info) {
                    text_container.textContent=info.text;
                    info.desc.forEach(function(d) {
                        desc_container.appendChild(make_p(d));
                    });
                    info.peers.forEach(function(p) {
                        var self=document.createElement('div');
                        var color=proc_rgb(parseInt(p.attr[3]));
                        self.style.color='rgb('+color[0]+','+color[1]+','+color[2]+')';
                        self.classList.add(get_L(color[0],color[1],color[2])>.5 ? 'black' : 'white');
                        
                        self.appendChild(make_p(proc_mode(p.mode)+' '+p.orig_str));
                        self.appendChild(make_p(
                            p.reason+' '+p.attr[6]+' '+p.time.toFixed(2)+'s '+parseInt(p.attr[2])+'px '
                            +format_datetime(new Date(parseInt(p.attr[4])*1000))
                        ));
                        
                        (function(self,uidhash,container) {
                            self.addEventListener('click',function() {
                                query_uid(uidhash,container);
                            });
                        })(self,p.attr[6],footer_container);
                        
                        peers_container.appendChild(self);
                    });
                } else
                    desc_container.appendChild(make_p('找不到弹幕详情'));
            }
        });
    });
}
try_inject();