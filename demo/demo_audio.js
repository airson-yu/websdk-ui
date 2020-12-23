/* eslint-disable no-undef */
var global_data = {
    ipaddr: '123.56.126.189',
    port: 80,
    orgid: 1,
    username: '',
    consoleName: null,
    client: null,
    logonName: 'websdkcu1',
    password: '123456',
    param_uid1: 65812,
    param_uid2: 65813,
    param_tgid1: 98787,
    param_tgid2: 100512,
    con_id: 81965, //83644, //登录后会自动更新
    con_other_id: 83645
}

var api_demo = {
    // XXX authRequest
    req_login: function () {
        document.getElementById('sdk_tip').innerText = '正在登录中...';
        websdk.request.authRequest.logon(global_data.ipaddr, global_data.port, global_data.orgid, global_data.logonName, global_data.password, global_data.consoleName, 2, function (rsp) {
            console.log('demo_req_logon result:', rsp);
            if (rsp.cmd_status === 0) {
                document.getElementById('sdk_tip').innerText = '登录成功';

                // XXX 设置当前调度台账号的ID，其他接口会使用此ID
                global_data.con_id = rsp.uid;

                //设置关闭视频时的操作: 1:询问, 2:只关闭视频窗口, 3:关闭视频窗口并结束推流
                websdk.websdkui && websdk.websdkui.configApi.set_video_close_action(1);
                //只针对终端主动推的视频 0：与set_video_close_action一致，1:询问, 2:只关闭视频窗口, 3:关闭视频窗口并结束推流
                websdk.websdkui && websdk.websdkui.configApi.set_video_push_close_action(3);
                //只针对调度台拉取的视频 0：与set_video_close_action一致，1:询问, 2:只关闭视频窗口, 3:关闭视频窗口并结束推流
                websdk.websdkui && websdk.websdkui.configApi.set_video_pull_close_action(3);

            } else {
                document.getElementById('sdk_tip').innerText = '登录失败';
            }
        }, 'demo_req_logon');
    },
    req_logout: function () {
        websdk.request.authRequest.logout(function (rsp) {
            console.log('demo_req_logout result:', rsp);
        }, 'demo_req_logout');//
    },
    req_change_passwd: function () {
        websdk.request.authRequest.changePasswd(global_data.logonName, global_data.password, global_data.password, function (rsp) {
            console.log('demo_req_change_passwd result:', rsp);
        }, 'demo_req_change_passwd');//
    },
    req_emergencyHandled: function () {
        //uid, extUid, processor, timestamp, ack_type
        var ts = Math.floor(new Date().getTime() / 1000);
        websdk.request.authRequest.emergencyHandled(global_data.param_uid1, null, global_data.con_id, ts, 0, function (rsp) {
            console.log('demo_req_emergencyHandled result:', rsp);
        }, 'demo_req_emergencyHandled');//
    },

    // XXX userRequest
    req_user_profile: function () {
        var targets = null;
        //var targets = [global_data.param_uid1];
        websdk.request.userRequest.getUserInfo(targets, null, function (rsp) {
            console.log('demo_req_user_profile result:', rsp);
        }, 'demo_req_user_profile');//
    },
    req_console_profile: function () {
        var targets = null;
        //var targets = [global_data.param_uid1];
        websdk.request.userRequest.getConsoleInfo(targets, function (rsp) {
            console.log('demo_req_console_profile result:', rsp);
        }, 'demo_req_console_profile');//
    },
    req_params_set: function () {
        websdk.request.userRequest.setUserParams([global_data.param_uid1], null, {'gps_report': 0}, function (rsp) {
            console.log('demo_req_params_set result:', rsp);
        }, 'demo_req_params_set');//
    },
    req_user_state: function () {
        //websdk.request.userRequest.noticeUserState([global_data.param_uid1], null, function (rsp) {
        websdk.request.userRequest.getUserStateAsync(null, null, function (rsp) {
            console.log('demo_req_user_state result:', rsp);
        }, 'demo_req_user_state');//
    },

    req_add_admin_users: function () {
        //var uids = [65835, 65836];
        //var ext_uids = ['itrunk_65835', 'itrunk_65836'];
        //websdk.request.userRequest.addAdminUsers(uids, null, function (rsp) {
        websdk.request.userRequest.addAdminUsers([global_data.param_uid1], null, function (rsp) {
            console.log('demo_req_add_admin_users result:{}', rsp);
        }, 'demo_req_add_admin_users');//
    },

    // XXX gpsRequest
    req_query_gps: function () {
        websdk.request.gpsRequest.queryGPS(global_data.param_uid1, null, function (rsp) {
            console.log('demo_req_query_gps result:', rsp);
        }, 'demo_req_query_gps');//
    },
    req_query_history_gps: function () {
        // XXX 起始时间和结束时间不能超过24小时，且不能超过当前时间
        websdk.request.gpsRequest.queryHistoryGPS(global_data.param_uid1, null, '2019-06-05 10:00:46', '2019-06-05 22:00:46', function (rsp) {
            console.log('demo_req_query_history_gps result:', rsp);
        }, 'demo_req_query_history_gps');//
    },

    // XXX groupRequest
    req_group_attach_info: function (targets) {
        if (!targets) {
            targets = [global_data.param_tgid1];
        }
        websdk.request.groupRequest.getGroupAttachInfo(targets, function (rsp) { // [global_data.param_tgid1]
            console.log('demo_req_group_attach_info result:', rsp);
        }, 'demo_req_group_attach_info');//
    },
    req_grp_profile: function (targets) {
        if (!targets) {
            targets = null;
        }
        websdk.request.groupRequest.getGroupInfo(targets, function (rsp) { // [global_data.param_tgid1]
            console.log('demo_req_grp_profile result:', rsp);
        }, 'demo_req_grp_profile');//
    },
    req_enter_group: function () {
        websdk.request.groupRequest.enterGroup(global_data.con_id, null, global_data.param_tgid1, 0, function (rsp) {
            console.log('demo_req_enter_group result:{}', rsp);
            //api_demo.req_grp_profile([global_data.param_tgid1]);
        }, 'demo_req_enter_group');//
    },
    req_leave_group: function () {
        websdk.request.groupRequest.leaveGroup(global_data.con_id, null, global_data.param_tgid1, function (rsp) {
            console.log('demo_req_leave_group result:{}', rsp);
            //api_demo.req_grp_profile([global_data.param_tgid1]);
        }, 'demo_req_leave_group');//
    },
    force_enter_group: function () {
        websdk.request.groupRequest.forceEnterGroup(global_data.param_tgid1, function (rsp) {
            console.log('demo_force_enter_group result:{}', rsp);
            //api_demo.req_grp_profile([global_data.param_tgid1]);
        }, 'demo_force_enter_group');//
    },
    force_leave_group: function () {
        websdk.request.groupRequest.forceLeaveGroup(global_data.param_tgid1, function (rsp) {
            console.log('demo_force_leave_group result:{}', rsp);
            //api_demo.req_grp_profile([global_data.param_tgid1]);
        }, 'demo_force_leave_group');//
    },
    req_add_group_member: function () {
        websdk.request.groupRequest.addGroupMember(global_data.param_tgid1, [global_data.param_uid2], null, function (rsp) {
            console.log('demo_req_add_group_member result:{}', rsp);
            //api_demo.req_grp_profile([global_data.param_tgid1]);
        }, 'demo_req_add_group_member');
    },
    req_remove_group_member: function () {
        websdk.request.groupRequest.removeGroupMember(global_data.param_tgid1, [global_data.param_uid2], null, function (rsp) {
            console.log('demo_req_remove_group_member result:{}', rsp);
            //api_demo.req_grp_profile([global_data.param_tgid1]);
        }, 'demo_req_remove_group_member');
    },

    req_create_group: function () {
        var name = 'tg_' + new Date().getTime();
        websdk.request.groupRequest.createGroup(name, [global_data.param_uid1, global_data.param_uid2], null, function (rsp) {
            console.log('demo_req_create_group result:{}', rsp);
        }, 'demo_req_create_group');
    },

    req_delete_group: function () {
        // XXX 指定需要删除的组的ID
        var tgid = 0;//
        websdk.request.groupRequest.deleteGroup(tgid, null, function (rsp) {
            console.log('demo_req_delete_group result:{}', rsp);
        }, 'demo_req_delete_group');
    },

    // XXX imRequest
    //

    // XXX voiceRequest
    voice_call: function () {
        websdk.request.voiceRequest.call(global_data.con_id, global_data.param_uid1, null, null, 0, 15, 0, 1, null, function (rsp) {
            console.log('demo_voice_call result:{}', rsp);
        }, 'demo_voice_call');//
    },
    voice_call_stop: function () {
        websdk.request.voiceRequest.call(global_data.con_id, global_data.param_uid1, null, null, 0, 15, 0, 0, null, function (rsp) {
            console.log('demo_voice_call_stop result:{}', rsp);
        }, 'demo_voice_call_stop');//
    },
    req_ptt_on: function () {
        websdk.request.voiceRequest.pttOn(global_data.param_tgid1, function (rsp) {
            console.log('demo_req_ptt_on result:{}', rsp);
        }, 'demo_req_ptt_on');//
    },
    req_ptt_off: function () {
        websdk.request.voiceRequest.pttOff(global_data.param_tgid1, function (rsp) {
            console.log('demo_req_ptt_off result:{}', rsp);
            api_demo.req_get_audio_list();
        }, 'demo_req_ptt_off');//
    },
    voice_pstn_call: function () {
        var telno = document.getElementById('pstn_telno').value;
        if (!telno) {
            alert('请输入需要拨打的号码');
            return;
        }
        websdk.view.showPstnVoiceCallModal(null, telno, function (result) {
            console.log('showPstnVoiceCallModal result:{}', result);
            websdk.request.voiceRequest.call(global_data.con_id, null, null, null, 0, 32, 0, 1, telno, function (rsp) {
                console.log('demo_voice_pstn_call result:{}', rsp);
            }, 'demo_voice_pstn_call');//
        });

    },
    voice_pstn_dtmf_call: function () {
        var telno = document.getElementById('pstn_telno').value;
        if (!telno) {
            alert('请输入需要拨打的号码');
            return;
        }
        var subno = document.getElementById('pstn_subno').value;
        if (!subno) {
            alert('请输入需要拨打的分机号码');
            return;
        }
        websdk.request.voiceRequest.dtmf(telno, subno, function (rsp) {
            console.log('demo_voice_pstn_dtmf_call result:{}', rsp);
        }, 'demo_voice_pstn_dtmf_call');//
    },
    voice_pstn_call_stop: function () {
        var telno = document.getElementById('pstn_telno').value;
        if (!telno) {
            alert('请输入需要结束拨打的号码');
            return;
        }
        websdk.request.voiceRequest.call(global_data.con_id, null, null, null, 0, 32, 0, 0, telno, function (rsp) {
            console.log('demo_voice_pstn_call_stop result:{}', rsp);
        }, 'demo_voice_pstn_call_stop');//
    },

    req_get_audio_list: function (){
        console.log('req_get_audio_list');
        var url = api_demo.build_url('/data/api/audio/list');
        var param = 'uid=' + global_data.con_id+'&start=0&length=2';
        $('#audio_grid').empty();
        api_demo.post(url, param, function (data) {
            //console.log(data);
            audio_obj.renderGrid(data.rows);
        }, function (e) {
            console.warn("getAudioList error:{}", e);
        });
    },

    // XXX videoRequest
    req_play_video: function () {
        //var that = this;
        //playVideo = (demander, target, extdemander, exttarget, session, channel, resolution, callback, cbid) => {
        websdk.request.videoRequest.playVideo(global_data.con_id, global_data.param_uid1, null, null, 0, 0, 0, function (rsp) {
            console.log('demo_req_play_video result:{}', rsp);
        }, 'demo_req_play_video');//
    },
    req_stop_video: function () {
        //stopPlayVideo = (demander, target, extdemander, exttarget, session, channel, stop_type, callback, cbid) => {
        websdk.request.videoRequest.stopPlayVideo(global_data.con_id, global_data.param_uid1, null, null, 0, 0, 0, function (rsp) {
            console.log('demo_req_stop_video result:{}', rsp);
        }, 'demo_req_stop_video');//
    },

    req_get_video_list: function () {
        websdk.request.videoRequest.getVideoList(0, 10, '2020-04-01 11:11:11', '2022-04-01 11:11:11', null, function (rsp) {
            console.log('demo_req_get_video_list result:{}', rsp);
        }, 'demo_req_get_video_list');//
    },

    req_transform_video: function () {
        var videoid = 93;
        var videourl = '/home/itrunk/video/record/2020-04-08/01665363_00065777_2020-04-08_14:16:34_0.mp4';
        websdk.request.videoRequest.transformVideo(videoid, videourl, function (rsp) {
            console.log('demo_req_transform_video result:{}', rsp);
        }, 'demo_req_transform_video');//
    },

    req_get_push_video_users: function () {
        websdk.request.videoRequest.getPushVideoUsers(function (rsp) {
            console.log('demo_req_get_push_video_users result:{}', rsp);
        }, 'demo_req_get_push_video_users');//
    },

    req_get_play_video_uids: function () {
        websdk.view.getPlayVideoUids(function (rsp) {
            console.log('demo_req_get_play_video_uids result:{}', rsp);
        }, 'demo_req_get_play_video_uids');//
    },

    // XXX listeners
    logonNotice: function () {
        websdk.listeners.logonNotice(function (rsp) {
            console.log('demo logonNotice result:', rsp);
        }, 'demo');
    },
    logoutNotice: function () {
        websdk.listeners.logoutNotice(function (rsp) {
            console.log('demo logoutNotice result:', rsp);
        }, 'demo');
    },
    emergencyAlarmNotice: function () {
        websdk.listeners.emergencyAlarmNotice(function (rsp) {
            console.log('demo emergencyAlarmNotice result:', rsp);
        }, 'demo');
    },
    emergencyHandledNotice: function () {
        websdk.listeners.emergencyHandledNotice(function (rsp) {
            console.log('demo emergencyHandledNotice result:', rsp);
        }, 'demo');
    },
    userProfileNotice: function () {
        websdk.listeners.userProfileNotice(function (rsp) {
            console.log('demo userProfileNotice result:', rsp);
        }, 'demo');
    },
    userParamsNotice: function () {
        websdk.listeners.userParamsNotice(function (rsp) {
            console.log('demo userParamsNotice result:', rsp);
        }, 'demo');
    },
    userStateNotice: function () {
        websdk.listeners.userStateNotice(function (rsp) {
            console.log('demo userStateNotice result:', rsp);
        }, 'demo');
    },
    userGPSNotice: function () {
        websdk.listeners.userGPSNotice(function (rsp) {
            console.log('demo userGPSNotice result:', rsp);
        }, 'demo');
    },
    userQueryGPSNotice: function () {
        websdk.listeners.userQueryGPSNotice(function (rsp) {
            console.log('demo userQueryGPSNotice result:', rsp);
        }, 'demo');
    },
    callStatusNotice: function () {
        websdk.listeners.callStatusNotice(function (rsp) {
            console.log('demo callStatusNotice result:', rsp);
        }, 'demo');
    },
    pttStatusNotice: function () {
        websdk.listeners.pttStatusNotice(function (rsp) {
            console.log('demo pttStatusNotice result:', rsp);
        });
    },
    groupAttachInfoNotice: function () {
        websdk.listeners.groupAttachInfoNotice(function (rsp) {
            console.log('demo groupAttachInfoNotice result:', rsp);
        }, 'demo');
    },
    enterGroupNotice: function () {
        websdk.listeners.enterGroupNotice(function (rsp) {
            console.log('demo enterGroupNotice result:', rsp);
        }, 'demo');
    },
    leaveGroupNotice: function () {
        websdk.listeners.leaveGroupNotice(function (rsp) {
            console.log('demo leaveGroupNotice result:', rsp);
        }, 'demo');
    },
    addGroupMemberNotice: function () {
        websdk.listeners.addGroupMemberNotice(function (rsp) {
            console.log('demo addGroupMemberNotice result:', rsp);
        }, 'demo');
    },
    removeGroupMemberNotice: function () {
        websdk.listeners.removeGroupMemberNotice(function (rsp) {
            console.log('demo removeGroupMemberNotice result:', rsp);
        }, 'demo');
    },
    groupMemStatusNotice: function () {
        websdk.listeners.groupMemStatusNotice(function (rsp) {
            console.log('demo groupMemStatusNotice result:', rsp);
        }, 'demo');
    },
    errMsgNotice: function () {
        websdk.listeners.ErrMsg(function (rsp) {
            console.log('demo ErrMsg result:', rsp);
            if (rsp.cmd_status == 52001) {
                document.getElementById('sdk_tip').innerText = '尚未登录';
            }
        }, 'demo');
    },

    dynamicNotice: function (msg_code) {
        websdk.listeners.dynamicNotice(msg_code, function (rsp) {
            console.log('demo dynamicNotice type:' + msg_code + ',result:', rsp);
        }, 'demo');
    },

    // XXX UI
    showUserModal: function () {
        websdk.view.showUserModal(global_data.param_uid1, null, function (result) {
            console.log('showUserModal result:{}', result);
        });
    },
    showUserModal2: function () {
        websdk.view.showUserModal(global_data.param_uid2, null, function (result) {
            console.log('showUserModal2 result:{}', result);
        });
    },
    showUserModal3: function () {
        websdk.view.showUserModal(global_data.con_other_id, null, function (result) {
            console.log('showUserModal3 result:{}', result);
        });
    },
    showGroupModal: function () {
        websdk.view.showGroupModal(global_data.param_tgid1, function (result) {
            console.log('showGroupModal result:{}', result);
        });
    },
    showGroupModal2: function () {
        websdk.view.showGroupModal(global_data.param_tgid2, function (result) {
            console.log('showGroupModal2 result:{}', result);
        });
    },
    showCreateGroupModal: function () {
        websdk.view.showCreateGroupModal(function (result) {
            console.log('showCreateGroupModal result:{}', result);
        });
    },
    // XXX other

    /** build full url */
    build_url: function (uri) {
        if (global_data.ipaddr && global_data.port) {

            return 'http://' + global_data.ipaddr + ':' + global_data.port + uri;
            //return 'http://localhost:8888' + uri;
        } else {
            console.warn('global_data ipaddr or port empty');
        }
        return null;
    },
    /** ajax post */
    post: function (url, param, callback, callback_err) {
        var xhr = new XMLHttpRequest();
        xhr.open('post', url, true);
        xhr.setRequestHeader('Access-Control-Allow-Origin', url);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                callback(this.response);
            }
        }
        /*xhr.ontimeout = function(e) {};
        if(onError){
            xhr.onerror = function(e) {
                onError(e);
            };
        }*/
        xhr.timeout = 1200000; // 20分钟请求未完成就超时
        if (callback_err) {
            xhr.ontimeout = function (e) {
                callback_err(e);
            };
            xhr.onerror = function (e) {
                callback_err(e);
            };
        }
        xhr.responseType = 'json';
        xhr.send(param);
        return xhr;
    }

}

websdk.init(function (result) {

    //websdk.view = websdk.vm.$children[0];

    if (window.websdk.private_cache && window.websdk.private_cache.login_uid) {
        document.getElementById('sdk_tip').innerText = '登录成功';
    }

    console.log('websdk.init result:', result);

    api_demo.logonNotice();
    api_demo.logoutNotice();
    api_demo.emergencyAlarmNotice();
    api_demo.emergencyHandledNotice();
    api_demo.userProfileNotice();
    api_demo.userParamsNotice();
    api_demo.userStateNotice();
    api_demo.userGPSNotice();
    api_demo.userQueryGPSNotice();
    api_demo.callStatusNotice();
    api_demo.pttStatusNotice();
    api_demo.groupAttachInfoNotice();
    api_demo.enterGroupNotice();
    api_demo.leaveGroupNotice();
    api_demo.addGroupMemberNotice();
    api_demo.removeGroupMemberNotice();
    api_demo.groupMemStatusNotice();
    api_demo.errMsgNotice();
    api_demo.dynamicNotice('notice_im_modal_open');
    api_demo.dynamicNotice('notice_im_modal_close');
    api_demo.dynamicNotice('notice_video_modal_open');
    api_demo.dynamicNotice('notice_video_modal_close');
    api_demo.dynamicNotice('notice_video_call_modal_open');
    api_demo.dynamicNotice('notice_video_call_modal_close');
    api_demo.dynamicNotice('notice_voice_call_modal_open');
    api_demo.dynamicNotice('notice_voice_call_modal_close');

    //api_demo.req_login();

});

window.addEventListener('unhandledrejection', function (event) {
    if (event.reason.code == 9) { // code:9, message:"The element has no supported sources.", name:"NotSupportedError"
        alert('音频文件已经不存在，无法播放');
    }
    //console.log(event.reason);
});

var audio_obj = {

    renderGrid: function (data) {
        if (!data || data.length <= 0) {
            return;
        }
        var dom = '';
        for (let i = 0; i < data.length; i++) {
            var row = data[i];
            dom += '<div style="padding:3px;">' + this.renderGridRow(row.path, row, {row: row.id}) + '</div>';
        }
        $('#audio_grid').html(dom);
    },

    renderGridRow: function (data, row, meta) {
        var btn_id = 'media_' + row.suffix + '_' + row.id;
        var path = data;//'/data/static/ring.mp3'

        //path = './assets/adk/audio/ring.wav';
        //path = 'https://localhost:8443/data/static/ring.mp3';

        var dom;
        if (path.indexOf('http') >= 0) { //已经是可以播放的url
            dom = '<button id="' + btn_id + '" class="btn btn-default btn-xs mgBtm0" style="" onclick="audio_obj.doPlay(\'' + btn_id + '\', \'' + path + '\', \'' + row.suffix + '\', \'' + row.id + '\', ' + meta.row + ');">播放</button>' +
                '<span id="play_' + btn_id + '" style="display: none;">' +
                '<button style="float:left;" class="btn btn-default btn-xs mgBtm0" style="" onclick="audio_obj.doStop(\'' + btn_id + '\');">停止</button><audio preload id="audio_' + btn_id + '" onended="audio_obj.onAudioEnd(\'' + btn_id + '\', ' + meta.row + ');" src="' + path + '"></audio>' +
                '</span>';
        } else {
            dom = '<button id="' + btn_id + '" class="btn btn-default btn-xs mgBtm0" style="" onclick="audio_obj.doPlay(\'' + btn_id + '\', \'' + path + '\', \'' + row.suffix + '\', \'' + row.id + '\' ,' + meta.row + ');">播放</button><span id="play_' + btn_id + '"></span>';
        }
        return dom;
    },

    doPlay: function (btn_id, path, suffix, id, row) {
        /*var audio = document.getElementById('audio_dom_id');
        audio.setAttribute('src', src);
        audio.play();*/

        var $audio_html = $('#play_' + btn_id).html();
        if ($audio_html) {

            $('#' + btn_id).hide();
            $('#play_' + btn_id).show();

            if ($('#play_' + btn_id + ' div.audioplayer').length <= 0) {
                $('#audio_' + btn_id).audioPlayer();
                //$('#audio_' + btn_id).parent().css('margin-left', '40px');//.css('float', 'right');//.css('width', '80%')
                $('#audio_' + btn_id).parent().css('margin-left', '40px');//.css('float', 'right');//.css('width', '80%')
                setTimeout(function () {
                    $('#audio_' + btn_id + '+div').click();
                }, 200);
            } else {
                $('#audio_' + btn_id + '+div').click();
            }
            return;
        }

        //lh.mask('正在加载语音，请稍等...');
        $.post(api_demo.build_url('/api/audio/load'), {suffix: suffix, id: id, path: path}, function (rsp) {
            /*// FIXME FOR TEST
            if (!rsp.success) {
                rsp.success = true;
                rsp.url = '/data/static/ring.mp3';
                rsp.url = 'h-t-t-p-s-:-/-/-l-ocalhost:8443/rtv/file/rt_audio/20180614/73795/65581_73795_116599310_20180614102903.wav';
            }
            // FIXME END*/

            setTimeout(function () { // 延时加载音频是因为，服务器音频转换可能尚未完成
                if (rsp.success) {
                    lh.hideMask();
                    //var $dom = $('#' + btn_id);
                    $('#' + btn_id).hide();
                    var dom = '<button style="float: left;" class="btn btn-default btn-xs mgBtm0" onclick="doStop(\'' + btn_id + '\');">停止</button><audio preload id="audio_' + btn_id + '" onerror="onAudioError(\'' + btn_id + '\', ' + row + ');" onended="onAudioEnd(\'' + btn_id + '\', ' + row + ');" src="' + rsp.url + '"></audio>';
                    $('#play_' + btn_id).html(dom);
                    //$dom.replaceWith(dom);
                    $('#audio_' + btn_id).audioPlayer();
                    $('#audio_' + btn_id).parent().css('margin-left', '40px');//.css('float', 'right');//.css('width', '80%')
                    setTimeout(function () {
                        $('#audio_' + btn_id + '+div').click();
                    }, 200);
                } else {
                    lh.hideMask();
                    lh.alert(rsp.msg);
                }
            }, 2000);

        });
    },

    doStop: function (btn_id) {
        // audio element的load方法与jQuery的load方法冲突，这里使用原生方法调用 2020年2月6日14:46:8
        // (Uncaught TypeError: Cannot read property 'indexOf' of undefined at k.fn.init.k.fn.load (jquery-3.4.1.min.js:formatted:3981))
        $('#audio_' + btn_id)[0].load();
        $('#' + btn_id).show();
        var $aobj = $('#play_' + btn_id + ' a')[0];
        if ($aobj && $aobj.text == 'Pause') {
            $('#audio_' + btn_id + '+div').click();
        }
        $('#play_' + btn_id).hide();
    },

    onAudioEnd: function (btn_id, row) { // 自动连播
        console.log('onAudioEnd:', btn_id, row);
    },

    onAudioError: function (btn_id) { // 加载失败
        //先隐藏当前播放条
        $('#audio_' + btn_id + '+div').click();
        $('#play_' + btn_id).hide();
        $('#' + btn_id).show();

        console.log('onAudioError:', btn_id);
    }

}

