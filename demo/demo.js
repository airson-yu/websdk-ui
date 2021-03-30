/* eslint-disable no-undef */
//全局配置信息，修改配置后，刷新页面才会生效
var global_data = {
    ipaddr: '123.57.63.112',//服务器IP
    port: 80,//服务器端口
    orgid: 59,//组织编号
    consoleName: null,//当调度台账号绑定有多个调度台时，需要指定登录哪个调度台，这里填写调度台的名称
    logonName: 'websdk01',//调度台登录账号
    password: 'QWEasd',//调度台登录密码
    param_uid1: 201217,//测试终端1ID
    param_uid2: 201218,//测试终端2ID
    param_tgid1: 230489,//测试群组1ID
    param_tgid2: 230488,//测试群组2ID
    con_id: 201219, //当前登录的调度台ID，调度台登录后会自动更新
    con_other_id: 201220 //可忽略
}

document.getElementById('sdk_server_tip').style.display = 'block';

function init_config() {
    document.getElementById('ipaddr').value = global_data.ipaddr;
    document.getElementById('port').value = global_data.port;
    document.getElementById('orgid').value = global_data.orgid;
    document.getElementById('logonName').value = global_data.logonName;
    document.getElementById('password').value = global_data.password;
    document.getElementById('param_uid1').value = global_data.param_uid1;
    document.getElementById('param_uid2').value = global_data.param_uid2;
    document.getElementById('param_tgid1').value = global_data.param_tgid1;
    document.getElementById('param_tgid2').value = global_data.param_tgid2;
}

init_config();

// eslint-disable-next-line no-unused-vars
function update_config() {
    global_data.ipaddr = document.getElementById('ipaddr').value;
    global_data.port = document.getElementById('port').value;
    global_data.orgid = document.getElementById('orgid').value;
    global_data.logonName = document.getElementById('logonName').value;
    global_data.password = document.getElementById('password').value;
    global_data.param_uid1 = document.getElementById('param_uid1').value;
    global_data.param_uid2 = document.getElementById('param_uid2').value;
    global_data.param_tgid1 = document.getElementById('param_tgid1').value;
    global_data.param_tgid2 = document.getElementById('param_tgid2').value;
    document.getElementById('cfg_tip').innerText = '配置已更新';
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
        //var starttime = '2021-01-15 06:00:00';
        //var endtime = '2021-01-15 23:00:00';

        // XXX 查询1个小时以内的数据 2021年01月15日17:13:54
        var now = new Date();
        var month = now.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }
        var ymd = now.getFullYear() + '-' + month + '-' + now.getDate();
        var hour = now.getHours();
        var h = now.getHours() < 10 ? ('0' + now.getHours()) : now.getHours();
        var m = now.getMinutes() < 10 ? ('0' + now.getMinutes()) : now.getMinutes();
        var s = now.getSeconds() < 10 ? ('0' + now.getSeconds()) : now.getSeconds();
        var hs = h;
        if (hour > 1) {
            hs = hour - 1;
            hs = hs < 10 ? ('0' + hs) : hs;
        }
        var starttime = ymd + ' ' + hs + ':' + m + ':' + s;
        var endtime = ymd + ' ' + h + ':' + m + ':' + s;
        websdk.request.gpsRequest.queryHistoryGPS(global_data.param_uid1, null, starttime, endtime, function (rsp) {
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

    // XXX videoRequest
    req_play_video: function () {
        //var that = this;
        //playVideo = (demander, target, extdemander, exttarget, session, channel, resolution, callback, cbid) => {
        websdk.request.videoRequest.playVideo(global_data.con_id, global_data.param_uid1, null, null, 0, 0, 0, 2, function (rsp) {
            console.log('demo_req_play_video result:{}', rsp);
        }, 'demo_req_play_video');//
    },
    req_stop_video: function () {
        //stopPlayVideo = (demander, target, extdemander, exttarget, session, channel, stop_type, callback, cbid) => {
        websdk.request.videoRequest.stopPlayVideo(global_data.con_id, global_data.param_uid1, null, null, 0, 0, 0, function (rsp) {
            console.log('demo_req_stop_video result:{}', rsp);
        }, 'demo_req_stop_video');//
    },

    req_set_push_video_play_type: function () {
        //var that = this;
        websdk.request.videoRequest.setPushVideoPlayType(2, function (rsp) {
            console.log('demo_req_set_push_video_play_type result:{}', rsp);
        }, 'demo_req_set_push_video_play_type');//
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
    setLogLevelNone: function () {
        websdk.websdkui.configApi.setLogLevelNone(function (result) {
            console.log('setLogLevelNone result:{}', result);
        });
    },
    setLogLevelDebug: function () {
        websdk.websdkui.configApi.setLogLevelDebug(function (result) {
            console.log('setLogLevelDebug result:{}', result);
        });
    },
    getCurLogLevel: function () {
        websdk.websdkui.configApi.getCurLogLevel(function (result) {
            console.log('getCurLogLevel result:{}', result);
        });
    },

}

websdk.init(function (result) {

    websdk.websdkui.configApi.setLogLevelDebug(function (result) {
        console.log('setLogLevelDebug result:{}', result);
    });

    //websdk.view = websdk.vm.$children[0];

    if (window.websdk.private_cache && window.websdk.private_cache.login_uid) {
        document.getElementById('sdk_tip').innerText = '登录成功';
        global_data.con_id = window.websdk.private_cache.login_uid;
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
