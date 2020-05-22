<template>
    <div id="sdk_webapp">
        <div v-for="obj in im" v-bind:key="'im-' + obj.id">
            <IMModal v-show="obj.main_modal_show" :id="obj.id" :im_target_type="obj.im_target_type"
                     :init_param_obj="obj.init_param_obj" v-on:on-im-cancel="hideIMModal(obj.id)"></IMModal>
            <IMUserListModal v-show="obj.user_list_modal_show" :id="obj.id" :oper_type="obj.oper_type"
                             v-on:on-user-list-cancel="hideIMUserListModal(obj.id)"></IMUserListModal>
        </div>

        <IMImageModal v-show="im_image_modal_show" :url="im_image_modal_url"></IMImageModal>

        <GroupCreateModal v-show="group_create_modal_show" v-on:on-tg-create-cancel="hideGroupCreateModal()"></GroupCreateModal>

        <div v-for="v in video" v-bind:key="'v-' + v.id">
            <VideoModal v-show="v.main_modal_show" :id="v.id" :url="v.url" :resolution="v.resolution" :channel="v.channel"
                        :playid="v.playid" v-on:on-video-cancel="hideVideoModalStopVideo(v.id)"></VideoModal>
        </div>

        <VoiceCallModal v-show="voice_call.modal_show" :status="voice_call.status" :uname="voice_call.uname"
                        :target="voice_call.target" v-on:on-call-cancel="hideVoiceCallModal()"></VoiceCallModal>
        <VoiceConfirmModal v-show="voice_confirm.modal_show" :status="voice_confirm.status" :uname="voice_confirm.uname"
                           :target="voice_confirm.target" v-on:on-call-confirm-cancel="hideVoiceConfirmModal()"></VoiceConfirmModal>

        <VoicePttConfirmModal v-show="voice_ptt_confirm.modal_show" :status="voice_ptt_confirm.status" :uname="voice_ptt_confirm.uname"
                              :target="voice_ptt_confirm.target" v-on:on-call-ptt-confirm-cancel="hideVoicePttConfirmModal()"></VoicePttConfirmModal>

        <VideoCallModal v-show="video_call.modal_show" :status="video_call.status" :uname="video_call.uname"
                        :target="video_call.target" v-on:on-vcall-cancel="hideVideoCallModal()"></VideoCallModal>
        <VideoConfirmModal v-show="video_confirm.modal_show" :status="video_confirm.status" :uname="video_confirm.uname"
                           :target="video_confirm.target" v-on:on-vcall-confirm-cancel="hideVideoConfirmModal()"></VideoConfirmModal>

        <div v-if="debug" style="width: 55%;float: left;">
            <div id="sdk_output"
                 style="width: 100%;height: 480px;margin-left: 10px;padding:10px;overflow: auto;word-break: break-all;line-height: 20px;text-align: left;border:solid 1px gray;"></div>
            <div style="padding:5px;">
                <Button type="success" @click="clear_log()">clear_log</Button>
            </div>
        </div>

        <div v-if="debug" style="width: 43%;float: left;text-align: left;padding:0px 15px;">
            <div style="">
                <div>
                    <label for="sdk_logonName">帐号:</label>
                    <Input id="sdk_logonName" v-model="logonName" placeholder="logonName" clearable style="width: 110px"/>
                    <label for="sdk_password">密码:</label>
                    <Input id="sdk_password" v-model="password" placeholder="password" clearable style="width: 110px"/>
                    <label for="sdk_consoleName">console:</label>
                    <Input id="sdk_consoleName" v-model="consoleName" placeholder="多个console时填写" clearable style="width: 120px"/>
                    <Button style="margin:5px;" type="primary" @click="doLogin()">重新登陆</Button>
                    <span>console id: 68508</span>
                </div>
            </div>
            <div style="height:40px;line-height: 40px;margin: 0 auto;border-bottom:solid 1px gray;">接口调试</div>
            <div style="margin-top:15px;">

                <div style="">
                    <span>通用参数设置：</span>
                    UID1:<Input v-model="param_uid1" placeholder="uid1" style="width: 80px;margin-right:5px;"/>
                    UID2:<Input v-model="param_uid2" placeholder="uid2" style="width: 80px;margin-right:5px;"/>
                    TGID1:<Input v-model="param_tgid1" placeholder="tgid1" style="width: 80px;margin-right:5px;"/>
                    TGID2:<Input v-model="param_tgid2" placeholder="tgid2" style="width: 80px;margin-right:5px;"/>
                </div>

                <Button style="margin:5px;width: 150px;" type="primary" @click="req_user_profile()">req_user_profile</Button>
                <Button style="margin:5px;width: 150px;" type="success" @click="req_user_state()">req_user_state</Button>
                <Button style="margin:5px;width: 150px;" type="primary" @click="req_grp_profile()">req_grp_profile</Button>
                <Button style="margin:5px;width: 150px;" type="success" @click="req_logout()">req_logout</Button>
                <Button style="margin:5px;width: 150px;" type="primary" @click="req_params_set()">req_params_set</Button>
                <Button style="margin:5px;width: 150px;" type="success" @click="req_query_gps()">req_query_gps</Button>
                <Button style="margin:5px;width: 150px;" type="primary" @click="req_query_history_gps()">req_query_history_gps</Button>
                <Button style="margin:5px;width: 150px;" type="success" @click="req_call()">req_call</Button>
                <Button style="margin:5px;width: 150px;" type="primary" @click="req_ptt_on()">req_ptt_on</Button>
                <Button style="margin:5px;width: 150px;" type="success" @click="req_ptt_off()">req_ptt_off</Button>
                <Button style="margin:5px;width: 150px;" type="primary" @click="req_enter_group()">req_enter_group</Button>
                <Button style="margin:5px;width: 150px;" type="success" @click="req_leave_group()">req_leave_group</Button>
                <Button style="margin:5px;width: 150px;" type="primary" @click="req_force_enter_group()">req_force_enter_group</Button>
                <Button style="margin:5px;width: 150px;" type="success" @click="req_force_leave_group()">req_force_leave_group</Button>
                <Button style="margin:5px;width: 150px;" type="primary" @click="req_add_grp_mem()">req_add_grp_mem</Button>
                <Button style="margin:5px;width: 150px;" type="success" @click="req_rem_grp_mem()">req_rem_grp_mem</Button>
                <Button style="margin:5px;width: 150px;" type="primary" @click="req_play_video()">req_play_video</Button>
                <Button style="margin:5px;width: 150px;" type="success" @click="req_stop_play_video()">req_stop_play_video</Button>
                <Button style="margin:5px;width: 150px;" type="primary" @click="req_send_im()">req_send_im</Button>
                <Button style="margin:5px;width: 150px;" type="success" @click="req_im_list()">req_im_list</Button>
                <Button style="margin:5px;width: 150px;" type="primary" @click="req_delete_grp(75291)">req_delete_grp75291</Button>
                <Button style="margin:5px;width: 150px;" type="primary" @click="req_stop_video(68505)">req_stop_video68505</Button>
            </div>
            <div style="height:40px;line-height: 40px;margin: 0 auto;border-bottom:solid 1px gray;">UI调试</div>
            <div style="margin-top:15px;">
                <Button style="margin:5px;width: 105px;" type="primary" @click="localShowIMModalUser(param_uid1)">打开个人68505/66250</Button>
                <Button style="margin:5px;width: 105px;" type="primary" @click="localShowIMModalUser(68509)">打开个人68509</Button>
                <Button style="margin:5px;width: 105px;" type="success" @click="localShowIMModalGroup(param_tgid1)">打开群组74752</Button>
                <Button style="margin:5px;width: 105px;" type="success" @click="localShowIMModalGroup(param_tgid2)">打开群组74753</Button>
                <Button style="margin:5px;width: 105px;" type="primary" @click="hideIMModalUser()">关闭用户窗口</Button>
                <Button style="margin:5px;width: 105px;" type="success" @click="hideIMModalGroup()">关闭群组窗口</Button>

                <div></div>
                <Button style="margin:5px;width: 105px;" type="primary" @click="showGroupCreateModal()">创建临时组</Button>
                <Button style="margin:5px;width: 105px;" type="primary" @click="localShowVoiceConfirmModal()">打开呼叫窗口</Button>
                <Button style="margin:5px;width: 105px;" type="success" @click="hideVoiceConfirmModal()">关闭呼叫窗口</Button>
                <Button style="margin:5px;width: 105px;" type="primary" @click="localShowVoiceCallModal()">打开语音窗口</Button>
                <Button style="margin:5px;width: 105px;" type="success" @click="hideVoiceCallModal()">关闭语音窗口</Button>

                <Button style="margin:5px;width: 105px;" type="primary" @click="localShowVideoConfirmModal()">打开视频呼叫</Button>
                <Button style="margin:5px;width: 105px;" type="success" @click="hideVideoConfirmModal()">关闭视频呼叫</Button>
                <Button style="margin:5px;width: 105px;" type="primary" @click="localShowVideoCallModal()">打开视频窗口</Button>
                <Button style="margin:5px;width: 105px;" type="success" @click="hideVideoCallModal()">关闭视频窗口</Button>

                <Button style="margin:5px;width: 105px;" type="primary" @click="localShowVideoModal()">打开视频窗口</Button>
                <Button style="margin:5px;width: 105px;" type="success" @click="hideVideoModal(param_uid1)">关闭视频窗口</Button>

                <Button style="margin:5px;width: 105px;" type="primary" @click="videoTest()">视频拉流测试</Button>
            </div>
        </div>
    </div>
</template>

<script>
    import logger from "../tools/logger";
    import moment from 'moment';
    import bus from './bus';
    import config from "../tools/config";
    import Result from "../tools/result";
    import {mapActions, mapState, mapGetters} from 'vuex'; //注册 action 和 state
    import IMModal from "./views/im-modal.vue";
    import IMImageModal from "./components/im-image-modal.vue";
    import IMUserListModal from "./views/im-user-list-modal.vue";
    import GroupCreateModal from "./views/group-create-modal.vue";
    import VideoModal from "./views/video-modal.vue";
    import VoiceCallModal from "./views/voice-call-modal.vue";
    import VoiceConfirmModal from "./views/voice-confirm-modal.vue";
    import VoicePttConfirmModal from "./views/voice-ptt-confirm-modal.vue";
    import VideoCallModal from "./views/video-call-modal.vue";
    import VideoConfirmModal from "./views/video-confirm-modal.vue";

    export default {
        name: 'app',
        components: {
            IMModal,
            IMImageModal,
            IMUserListModal,
            GroupCreateModal,
            VideoModal,
            VoiceCallModal,
            VoiceConfirmModal,
            VoicePttConfirmModal,
            VideoCallModal,
            VideoConfirmModal
        },
        data() {
            //return store.state
            return {
                //user_modal_show: store.state.user_modal_show,
                //ip:'39.105.135.70',
                ipaddr: '39.106.213.127',
                port: 80,
                //orgid: 10,
                orgid: 28,
                debug: window.debug,
                username: 'jack',
                logonName: 'websdkcu1',
                password: '123456',
                consoleName: null,
                client: null,
                param_uid1: 66250,
                //param_uid1: 68505,
                param_uid2: 68507,
                param_ext_uid1: 'itrunk_68505',
                param_ext_uid2: 'itrunk_68506',
                param_tgid1: 74752,
                param_tgid2: 74753,
                con_id: 68508,
                last_refid: 0,
            }
        },
        created: function () {
            this.$Message.config({
                duration: 8,
                closable: true
            })
            this.init_global_listeners();
            /*websdk.listeners.pttStatusReplay(function (rsp) {
                logger.debug('app.vue pttStatusReplay result:{}', rsp);
                //this.$bus.$emit('ptt-replay', 0);
            });*/
        },
        destroyed: function () {
            let that = this;
            let root = that.$root;
        },
        methods: {
            /**-------- XXX GLOBAL LISTENERS --------**/
            init_global_listeners: function () {
                let that = this;
                //let root = this.$root;
                let listeners = websdk.listeners;
                listeners.callStatusNotice(function (rsp) {
                    let demander = rsp.demander;
                    let extdemander = rsp.extdemander;
                    let target = rsp.target;
                    let exttarget = rsp.exttarget;
                    let call_type = rsp.call_type;
                    let status = rsp.status;
                    let login_uid = websdk.private_cache.login_uid;
                    let client_id = login_uid === demander ? target : demander;
                    logger.debug('bus.$emit.call-status:{}', client_id);
                    let call_status_im_evt_id = 'call-status-im-' + client_id;
                    bus.$emit(call_status_im_evt_id, rsp);
                    //bus.$emit('call-status-im', rsp);
                    bus.$emit('call-status-video-call', rsp);
                    bus.$emit('call-status-video-confirm', rsp);
                    bus.$emit('call-status-voice-call', rsp);
                    bus.$emit('call-status-voice-confirm', rsp);
                    bus.$emit('call-status-ptt-confirm', rsp);

                    // XXX 这里只处理被动接收的场景，主动发起不在这里处理
                    if (login_uid === demander) {
                        return;
                    }
                    if (call_type == 20) { // 半双工PTT
                        if (status == 67) {
                            // XXX 这种情况是高阶调度台
                            that.showUserModal(demander, extdemander, function () {
                            }, {'attached': true});
                        } else if (status == 65) {
                            // XXX TODO 提示用户，有终端发起半双工请求（请求通话）
                            websdk.request.userRequest.getUserInfo([demander], null, function (rsp) {
                                if (!rsp.user_info) {
                                    return;
                                }
                                let target = rsp.user_info[0];
                                let tip = target.display_name + '：发起通话请求';
                                that.$Message.success(tip);
                            }, 'req_user_profile_app_call_65');
                        }
                    } else if (call_type == 16) { // 16:  全双工RTT（BMS->Console only）
                        if (status == 65) {
                            // XXX TODO 提示用户，有终端发起半双工请求（请求通话）
                            websdk.request.userRequest.getUserInfo([demander], null, function (rsp) {
                                if (!rsp.user_info) {
                                    return;
                                }
                                let target = rsp.user_info[0];
                                let tip = target.display_name + '-发起通话请求';
                                let ts = moment().format('HH:mm:ss');
                                let ts2 = ts.replace(':', '_');
                                let desc = tip + '，请及时处理，请求发起时间：' + ts;
                                //that.$Message.success(tip);
                                that.$Notice.warning({
                                    title: tip,
                                    desc: desc,
                                    duration: 0,
                                    name: 'req_call_' + demander + '_' + ts2
                                });

                            }, 'req_user_profile_app_call_65');
                        }
                    } else if (call_type == 17) { // 17: 全双工语音强拉
                        that.showVoiceCallModal({id: target, status: 11});
                    }

                }, '_app');
                listeners.pttStatusNotice(function (rsp) {
                    //let client_id = rsp.tgid;
                    if (rsp.status === 3) { // XXX 服务器有可能会发重复的状态为3的通知，这里要过滤重复 2019年8月6日16:15:24
                        if (that.last_refid === rsp.refid) {
                            logger.info('repeat_pttStatusNotice:{}', rsp.refid);
                            return;
                        }
                        that.last_refid = rsp.refid;
                    }
                    let login_uid = websdk.private_cache.login_uid;
                    let client_id = login_uid === rsp.target ? rsp.callerid : rsp.target;
                    logger.debug('bus.$emit.ptt-status:{}', client_id);
                    let ptt_status_im_evt_id = 'ptt-status-im-' + client_id;
                    bus.$emit(ptt_status_im_evt_id, rsp);
                }, '_app');
                listeners.pttStatusReplay(function (rsp) {
                    let client_id = rsp.tgid; // XXX ptt_status_replay带的tgid是对方的id，不是console id,可以直接使用
                    logger.debug('bus.$emit.ptt-status-replay:{}', client_id);
                    let ptt_status_replay_im_left_evt_id = 'ptt-status-replay-im-left-' + client_id;
                    let ptt_status_replay_im_right_evt_id = 'ptt-status-replay-im-right-' + client_id;
                    bus.$emit(ptt_status_replay_im_left_evt_id, rsp);
                    bus.$emit(ptt_status_replay_im_right_evt_id, rsp);
                }, '_app');
                listeners.enterGroupNotice(function (rsp) {
                    let client_id = rsp.tgid;
                    logger.debug('bus.$emit.enter-group:{}', client_id);
                    let enter_group_im_evt_id = 'enter-group-im-' + client_id;
                    bus.$emit(enter_group_im_evt_id, rsp);
                }, '_app');
                listeners.leaveGroupNotice(function (rsp) {
                    let client_id = rsp.tgid;
                    logger.debug('bus.$emit.leave-group:{}', client_id);
                    let leave_group_im_evt_id = 'leave-group-im-' + client_id;
                    bus.$emit(leave_group_im_evt_id, rsp);
                }, '_app');
                listeners.addGroupMemberNotice(function (rsp) {
                    let client_id = rsp.tgid || rsp.tgId;
                    logger.debug('bus.$emit.add-group-member:{}', client_id);
                    let add_group_member_im_evt_id = 'add-group-member-im-' + client_id;
                    bus.$emit(add_group_member_im_evt_id, rsp);
                }, '_app');
                listeners.removeGroupMemberNotice(function (rsp) {
                    let client_id = rsp.tgid;
                    logger.debug('bus.$emit.remove-group-member:{}', client_id);
                    let remove_group_member_im_evt_id = 'remove-group-member-im-' + client_id;
                    bus.$emit(remove_group_member_im_evt_id, rsp);
                }, '_app');
                listeners.groupMemStatusNotice(function (rsp) {
                    let client_id = rsp.tgid;
                    logger.debug('bus.$emit.group-mem-status:{}', client_id);
                    let group_mem_status_im_evt_id = 'group-mem-status-im-' + client_id;
                    bus.$emit(group_mem_status_im_evt_id, rsp);
                }, '_app');
                listeners.noticeIM(function (rsp) {
                    let login_uid = websdk.private_cache.login_uid;
                    let client_id = login_uid === rsp.target ? rsp.uid : rsp.target;
                    client_id || (client_id = rsp.uid); //rsp_send_im中没有target
                    //let client_id = rsp.target;
                    logger.debug('bus.$emit.notice-im:{}', client_id);
                    let notice_im_im_evt_id = 'notice-im-im-' + client_id;
                    bus.$emit(notice_im_im_evt_id, rsp);
                }, '_app');
                listeners.emergencyAlarmNotice(function (rsp) {
                    logger.debug('bus.$emit.notice-emergency');
                    //bus.$emit('notice-emergency', rsp);
                    // TODO 触发语音强呼
                    logger.debug('emergency ui notice');
                    let targets = null;
                    let exttargets = null;
                    if (rsp.uid) {
                        targets = [rsp.uid];
                    } else {
                        exttargets = [rsp.extuid];
                    }
                    websdk.request.userRequest.getUserInfo(targets, exttargets, function (rsp2) {
                        if (!rsp2.user_info) {
                            return;
                        }
                        let target = rsp2.user_info[0];
                        let tip = target.display_name + '-发起一键告警';
                        let ts = moment().format('HH:mm:ss');
                        let ts2 = ts.replace(':', '_');
                        let desc = tip + '，请及时处理，请求发起时间：' + ts + '(点击处理)';
                        let notice_ui_id = 'notice_alarm_' + ts2;
                        that.$Notice.warning({
                            title: tip,
                            desc: desc,
                            duration: 0,
                            name: notice_ui_id,
                            render: h => {
                                return h('span', {
                                    domProps: {
                                        innerHTML: desc
                                    },
                                    on: {
                                        click: function (event) {
                                            that.alarmClickToVoiceCall(that, rsp.uid, rsp.extuid, notice_ui_id);
                                            //self.$emit('input', event.target.value)
                                        }
                                    }
                                })
                            }
                        });
                    }, 'req_user_profile_app_domain_alarm');//

                }, '_app');
                listeners.emergencyHandledNotice(function (rsp) {
                    logger.debug('bus.$emit.notice-emergency-handled');
                    //bus.$emit('notice-emergency-handled', rsp);
                }, '_app');

                listeners.playVideoNotice(function (rsp) {
                    let client_id = rsp.target;
                    logger.debug('bus.$emit.play-video:{}', client_id);
                    let open_video_video_evt_id = 'open-video-video-' + client_id;
                    bus.$emit(open_video_video_evt_id, rsp);
                    that.initShowVideo(that, rsp, true);
                    /*let open_video_im_evt_id = 'open-video-im-' + rsp.id;
                    bus.$emit(open_video_im_evt_id, rsp);*/
                    // XXX 遍历已经打开的IM，发通知更新视频图标 2019年7月19日9:55:58
                    // XXX 判断是不是channel为0，显示自己的视频，这时不显示操作栏 2019年7月19日9:55:58
                    that.notice_all_im_modal(that, 'open-video-im-', rsp);
                }, '_app');

                listeners.playVideoRspNotice(function (rsp) {
                    logger.debug('bus.$emit.play-video-rsp');
                    //bus.$emit('open-video-rsp', rsp);
                    that.initShowVideo(that, rsp, false); // XXX 收到 playVideoNotice 时才初始化视频窗口
                    // XXX 遍历已经打开的IM，发通知更新视频图标 2019年7月19日9:55:58
                    // XXX 判断是不是channel为0，显示自己的视频，这时不显示操作栏 2019年7月19日9:55:58
                    that.notice_all_im_modal(that, 'play-video-rsp-im-', rsp);
                }, '_app');

                listeners.stopPlayVideoNotice(function (rsp) {
                    let client_id = rsp.target;
                    logger.debug('bus.$emit.stop-play-video:{}', client_id);
                    let stop_play_video_video_evt_id = 'stop-play-video-video-' + client_id;
                    bus.$emit(stop_play_video_video_evt_id, rsp);
                    /*let stop_play_video_im_evt_id = 'stop-play-video-im-' + rsp.id;
                    bus.$emit(stop_play_video_im_evt_id, rsp);*/
                    // XXX 遍历已经打开的IM，发通知更新视频图标 2019年7月19日9:55:58
                    that.notice_all_im_modal(that, 'stop-play-video-im-', rsp);
                }, '_app');

                listeners.stopPlayVideoRspNotice(function (rsp) {
                    logger.debug('bus.$emit.stop-play-video-rsp');
                    //bus.$emit('stop-play-video-rsp', rsp);
                    //that.hideVideoModalStopVideo(rsp.target);
                    // XXX 遍历已经打开的IM，发通知更新视频图标 2019年7月19日9:55:58
                    that.notice_all_im_modal(that, 'stop-play-video-rsp-im-', rsp);
                }, '_app');

                listeners.updateVideoSetNotice(function (rsp) {
                    let client_id = rsp.target;
                    logger.debug('bus.$emit.update-video-set:{}', client_id);
                    let update_video_set_evt_id = 'update-video-set-' + client_id;
                    bus.$emit(update_video_set_evt_id, rsp);
                }, '_app');

                listeners.startVideoConfNotice(function (rsp) {
                    that.updateVideoConf({tgid: rsp.tgid, type: 'start'});
                    let client_id = rsp.tgid;
                    let start_video_conf_im_evt_id = 'start-video-conf-im-' + client_id;
                    bus.$emit(start_video_conf_im_evt_id, rsp);
                    // XXX 遍历已经打开的IM，发通知更新视频图标 2019年7月19日9:55:58 这个通知应该不需要群发
                }, '_app');

                listeners.startVideoConfStatusNotice(function (rsp) {
                    let client_id = rsp.tgid;
                    let start_video_conf_status_im_evt_id = 'start-video-conf-status-im-' + client_id;
                    bus.$emit(start_video_conf_status_im_evt_id, rsp);
                    // XXX 遍历已经打开的IM，发通知更新视频图标 2019年7月19日9:55:58 这个通知应该不需要群发
                }, '_app');

                listeners.stopVideoConfNotice(function (rsp) {
                    that.updateVideoConf({tgid: rsp.tgid, type: 'stop'});
                    let client_id = rsp.tgid;
                    let stop_video_conf_im_evt_id = 'stop-video-conf-im-' + client_id;
                    bus.$emit(stop_video_conf_im_evt_id, rsp);
                    // XXX 遍历已经打开的IM，发通知更新视频图标 2019年7月19日9:55:58 这个通知应该不需要群发
                }, '_app');

                // XXX 目前调度台不会收到这两个通知，停止分享是发的stop-video 2019年7月17日16:56:28
                /*listeners.shareVideoInVideoConfNotice(function (rsp) {
                    let client_id = rsp.tgid;
                    let share_video_conf_im_evt_id = 'share-video-conf-im-' + client_id;
                    bus.$emit(share_video_conf_im_evt_id, rsp);
                }, '_app');
                listeners.stopShareVideoInVideoConfNotice(function (rsp) {
                    let client_id = rsp.tgid;
                    let stop_share_video_conf_im_evt_id = 'stop-share-video-conf-im-' + client_id;
                    bus.$emit(stop_share_video_conf_im_evt_id, rsp);
                }, '_app');*/

            },
            /* testPttReplay: function () {
                 this.$bus.$emit('ptt-replay', 0);
             },*/
            notice_all_im_modal: function (that, evt_prefix, rsp) {
                logger.debug('notice_all_im_modal');
                // XXX 遍历已经打开的IM，发通知更新视频图标 2019年7月19日9:55:58
                // XXX 判断是不是channel为0，显示自己的视频，这时不显示操作栏 2019年7月19日9:55:58
                _.forEach(that.$store.state.im, function (data, key) {
                    let im_evt_id = evt_prefix + key;
                    logger.debug('im_evt_id:{}', im_evt_id);
                    bus.$emit(im_evt_id, rsp);
                });
            },


            /** -------- XXX GLOBAL API TEST --------**/
            clear_log: function () {
                document.getElementById('sdk_webapp').innerHTML = '';
            },
            doLogin: function () {
                websdk.request.authRequest.logon(this.ipaddr, this.port, this.orgid, this.logonName, this.password, this.consoleName, function (rsp) {
                    //this.request.authRequest.logon(null, 0, 0, 'testcu', '123456', 'c1552965016425r279235228', function (rsp) {
                    //logger.debug('logon result:{}', rsp);
                }, 'test_req_logon');//
            },
            req_logout: function () {
                websdk.request.authRequest.logout(function (rsp) {
                    //logger.debug('logout result:{}', rsp);
                }, 'test_req_logout');//
            },
            req_user_profile: function () {
                websdk.request.userRequest.getUserInfo([this.param_uid1], null, function (rsp) {
                    if (!rsp.user_info) {
                        return;
                    }
                    //logger.debug('req_user_profile result:{}', rsp);
                }, 'test_req_user_profile');//
            },
            req_user_state: function () {
                websdk.request.userRequest.noticeUserState([this.param_uid1], null, function (rsp) {
                    //websdk.request.userRequest.noticeUserState(null, [this.param_ext_uid1], function (rsp) {
                    //logger.debug('req_user_state result:{}', rsp);
                }, 'test_req_user_state');//
            },
            req_grp_profile: function () {
                websdk.request.groupRequest.getGroupInfo([], function (rsp) { //this.param_tgid1
                    if (!rsp.group_info) {
                        return;
                    }
                    //logger.debug('req_grp_profile result:{}', rsp);
                }, 'test_req_grp_profile');//
            },
            /*req_grp_profile: function () {
                websdk.request.groupRequest.getGroupInfo([this.param_tgid1], function (rsp) {
                    logger.debug('req_grp_profile result:{}', rsp);
                }, 'test_req_grp_profile');//
            },*/
            req_params_set: function () {
                websdk.request.userRequest.setUserParams([this.param_uid1], null, {'gps_report': 0}, function (rsp) {
                    //websdk.request.userRequest.setUserParams(null, [this.param_ext_uid1], {'gps_report': 0}, function (rsp) {
                    //logger.debug('req_params_set result:{}', rsp);
                }, 'test_req_params_set');//
            },

            req_query_gps: function () {
                websdk.request.gpsRequest.queryGPS(this.param_uid1, null, function (rsp) {
                    //logger.debug('req_query_gps result:{}', rsp);
                }, 'test_req_query_gps');//
            },

            req_query_history_gps: function () {
                websdk.request.gpsRequest.queryHistoryGPS(this.param_uid1, null, '2019-05-11 16:00:46', '2019-05-11 22:00:46', function (rsp) {
                    //websdk.request.gpsRequest.queryHistoryGPS(null, this.param_ext_uid1, '2019-05-11 16:00:46', '2019-05-11 22:00:46', function (rsp) {
                    //logger.debug('req_query_history_gps result:{}', rsp);
                }, 'test_req_query_history_gps');//
            },

            req_call: function () {
                //call = (demander, target, channel, call_type, priority, callback, cbid) => {
                websdk.request.voiceRequest.call(this.param_uid1, this.param_uid2, null, null, 1, 20, 0, 1, null, function (rsp) {
                    //logger.debug('req_call result:{}', rsp);
                }, 'test_req_call');//
            },

            req_ptt_on: function () {
                websdk.request.voiceRequest.pttOn(this.con_id, function (rsp) {
                    //logger.debug('req_ptt_on result:{}', rsp);
                }, 'test_req_ptt_on');//
            },

            req_ptt_off: function () {
                websdk.request.voiceRequest.pttOff(this.con_id, function (rsp) {
                    //logger.debug('req_ptt_off result:{}', rsp);
                }, 'test_req_ptt_off');//
            },

            req_enter_group: function () {
                websdk.request.groupRequest.enterGroup(this.param_uid1, null, this.param_tgid1, 0, function (rsp) {
                    //logger.debug('req_enter_group result:{}', rsp);
                }, 'test_req_enter_group');//
            },

            req_leave_group: function () {
                websdk.request.groupRequest.leaveGroup(this.param_uid1, null, this.param_tgid1, function (rsp) {
                    //logger.debug('req_leave_group result:{}', rsp);
                }, 'test_req_leave_group');//
            },

            req_force_enter_group: function () {
                websdk.request.groupRequest.forceEnterGroup(this.param_tgid1, function (rsp) {
                    //logger.debug('req_force_enter_group result:{}', rsp);
                }, 'test_req_force_enter_group');//
            },

            req_force_leave_group: function () {
                websdk.request.groupRequest.forceLeaveGroup(this.param_tgid1, function (rsp) {
                    //logger.debug('req_force_leave_group result:{}', rsp);
                }, 'test_req_force_leave_group');//
            },

            req_add_grp_mem: function () {
                websdk.request.groupRequest.addGroupMember(this.param_tgid1, [this.param_uid2], null, function (rsp) {
                    //logger.debug('req_add_grp_mem result:{}', rsp);
                }, 'test_req_add_grp_mem');//
            },

            req_rem_grp_mem: function () {
                websdk.request.groupRequest.removeGroupMember(this.param_tgid1, [this.param_uid2], null, function (rsp) {
                    //logger.debug('req_rem_grp_mem result:{}', rsp);
                }, 'test_req_rem_grp_mem');//
            },

            req_play_video: function () {
                websdk.request.videoRequest.playVideo(this.con_id, this.param_uid1, null, null, 0, 0, 0, function (rsp) {
                    //logger.debug('req_play_video result:{}', rsp);
                }, 'test_req_play_video');//
            },

            req_stop_play_video: function () {
                websdk.request.videoRequest.stopPlayVideo(this.con_id, this.param_uid1, null, null, 0, 0, function (rsp) {
                    //logger.debug('req_stop_play_video result:{}', rsp);
                }, 'test_req_stop_play_video');//
            },

            req_send_im: function () {
                //target, exttarget, im_type, content, time,
                websdk.request.imRequest.sendIMText(this.param_uid1, null, 'text', 'test', new Date(), function (rsp) {
                    //websdk.request.imRequest.sendIMText(null, this.param_ext_uid1, 'text', 'test', new Date(), function (rsp) {
                    //logger.debug('req_send_im result:{}', rsp);
                }, 'test_req_send_im');//
            },

            req_im_list: function () {
                //reqIMList = (target, start, count, im_type, callback, cbid) => {
                websdk.request.imRequest.reqIMList(this.con_id, null, 0, 1000, 0, 1, function (rsp) {
                    //logger.debug('req_im_list result:{}', rsp);
                }, 'test_req_im_list');//
            },

            req_delete_grp: function (tgid) {
                websdk.request.groupRequest.deleteGroup(tgid, function (rsp) {
                    //logger.debug('req_delete_grp result:{}', rsp);
                }, 'test_req_delete_grp');//
            },

            req_stop_video: function () {
                //stopPlayVideo = (demander, target, extdemander, exttarget, session, channel, callback, cbid) => {
                websdk.request.videoRequest.stopPlayVideo(this.con_id, this.param_uid1, null, null, 0, 0, function (rsp) {
                    //logger.debug('req_stop_video result:{}', rsp);
                }, 'test_req_stop_video');//
            },

            /**-------- XXX GLOBAL UI TEST --------**/

            localShowIMModalUser: function (uid) {
                if (!uid) {
                    uid = this.param_uid1;
                }
                let that = this;
                websdk.request.userRequest.getUserInfo([uid], null, function (rsp) {
                    if (!rsp.user_info) {
                        return;
                    }
                    let target = rsp.user_info[0];
                    target.im_target_type = 1;
                    that.$store.dispatch('showIMModal', target).then(() => {
                    });
                }, 'req_user_profile_app_test');//
            },

            localShowIMModalGroup: function (tgid) {
                if (!tgid) {
                    tgid = this.param_tgid1;
                }
                let that = this;
                websdk.request.groupRequest.getGroupInfo([tgid], function (rsp) {
                    if (!rsp.group_info) {
                        return;
                    }
                    let target = rsp.group_info[0];
                    target.im_target_type = 2;
                    that.$store.dispatch('showIMModal', target).then(() => {
                    });
                }, 'req_grp_profile_app_test');//
            },

            hideIMModalUser: function () {
                this.$store.dispatch('hideIMModal', this.param_uid1).then(() => {
                });
            },
            hideIMModalGroup: function () {
                this.$store.dispatch('hideIMModal', this.param_tgid1).then(() => {
                });
            },

            localShowVoiceConfirmModal: function () {
                this.$store.dispatch('showVoiceConfirmModal', {id: this.param_uid1}).then(() => {
                });
            },
            localShowVoiceCallModal: function () {
                this.$store.dispatch('showVoiceCallModal', {id: this.param_uid1}).then(() => {
                });
            },

            localShowVideoConfirmModal: function () {
                this.$store.dispatch('showVideoConfirmModal', {id: this.param_uid1}).then(() => {
                });
            },
            localShowVideoCallModal: function () {
                this.$store.dispatch('showVideoCallModal', {id: this.param_uid1, status: 2}).then(() => {
                });
            },

            localShowVideoModal: function () {
                let that = this;
                websdk.request.userRequest.getUserInfo([this.param_uid1], null, function (rsp) {
                    //websdk.request.userRequest.getUserInfo(null, [this.param_ext_uid1], function (rsp) {
                    let target = rsp.user_info[0];
                    that.$store.dispatch('showVideoModal', target).then(() => {
                    });
                }, 'req_user_profile_app_video_test');//
            },

            videoTest: function () {
                let that = this;
                //playVideo = (demander, target, extdemander, exttarget, session, channel, resolution, callback, cbid) => {
                websdk.request.videoRequest.playVideo(this.con_id, this.param_uid1, null, null, 0, 0, 0, function (rsp) {

                }, 'req_play_video_test');//
            },

            /**-------- XXX INTERNAL DOMAIN METHOD --------**/

            initShowVideo: function (that, rsp, init) {
                if (rsp.cmd_status === 3) {
                    that.$Message.info('正在等待用户响应');
                    return;
                }
                if (rsp.cmd_status !== 0) {
                    let tip = {
                        '1': '配置不允许上拉视频',
                        '2': '用户拒绝请求',
                        '3': '正在等待用户响应',
                        '4': '用户无响应',
                        '5': '摄像头未打开',
                        '6': '视频数超过限制',
                        '100': '超时无响应',
                    }
                    that.$Message.warning(tip[rsp.cmd_status + '']);
                    return;
                }
                if (!init) {
                    logger.debug('initShowVideo init false')
                    return;
                }
                // XXX 判断是不是channel为0，显示自己的视频，这时不显示操作栏 2019年7月19日9:55:58
                let channel = rsp.channel;
                let playid = rsp.playid;
                let resolution = rsp.resolution;
                let url = config.build_video_url(playid);
                that.showVideoModal({id: rsp.target, reload: true, url: url, resolution: resolution, channel: channel, playid: playid});
            },

            hideVideoModalStopVideo: function (id) {
                let that = this;
                that.hideVideoModal(id);
                /* XXX 2019年7月24日16:35:27
                let login_uid = websdk.private_cache.login_uid;
                websdk.request.videoRequest.stopPlayVideo(login_uid, id, null, null, 0, 0, function (rsp) {
                    //logger.debug('req_stop_play_video_domain result:{}', rsp);
                }, 'req_stop_play_video_domain');//*/
            },

            /**-------- XXX GLOBAL DOMAIN METHOD --------**/

            alarmClickToVoiceCall: function (that, target, exttarget, notice_ui_id) {
                logger.debug('emergency trigger call');
                if (target) {
                    exttarget = null;
                }
                that.showVoiceCallModal({id: target, status: 11});
                let login_uid = websdk.private_cache.login_uid;
                websdk.request.voiceRequest.call(login_uid, target, null, exttarget, 1, 17, 0, 1, null, function (rsp) {
                    //logger.debug('req_call_app_force result:{}', rsp);
                }, 'req_call_app_force');//

                let ts = Math.floor(new Date().getTime() / 1000);
                websdk.request.authRequest.emergencyHandled(target, exttarget, login_uid, ts, 0, function (rsp) {
                    //logger.debug('req_emergencyHandled_domain result:{}', rsp);
                }, 'req_emergencyHandled_domain');//

                if (notice_ui_id) {
                    that.$Notice.close(notice_ui_id);
                }

            },

            showUserModal: function (uid, extUid, callback, init_param_obj) {
                let that = this;
                let param_uid = uid ? [uid] : null;
                let param_extUid = extUid ? [extUid] : null;
                websdk.request.userRequest.getUserInfo(param_uid, param_extUid, function (rsp) {
                    if (!rsp.user_info || rsp.user_info.length <= 0) {
                        callback && callback(false);
                        return;
                    }
                    let target = rsp.user_info[0];
                    target.im_target_type = 1;
                    target.init_param_obj = init_param_obj;
                    that.$store.dispatch('showIMModal', target).then(() => {
                        logger.debug('showIMModal callback');
                        callback && callback(true);
                    });
                }, 'req_user_profile_app_domain');//
            },

            showGroupModal: function (tgid, callback) {
                let that = this;
                websdk.request.groupRequest.getGroupInfo([tgid], function (rsp) {
                    if (!rsp.group_info || rsp.group_info.length <= 0) {
                        callback && callback(false);
                        return;
                    }
                    let target = rsp.group_info[0];
                    target.im_target_type = 2;
                    that.$store.dispatch('showIMModal', target).then(() => {
                        callback && callback(true);
                    });
                }, 'req_grp_profile_app_domain');//
            },

            showCreateGroupModal: function (callback) {
                let that = this;

                if (!window.websdk.private_cache.login_uid) {
                    logger.warn('{success: false, code: 10104, desc: "尚未登录"}');
                    callback && callback(Result.no_login);
                    return false;
                }

                that.showGroupCreateModal();
                callback && callback(Result.succ);
            },

            showPstnVoiceCallModal: function (target, telno, callback, init_param_obj) {
                let that = this;
                let targetObj = {id: target, status: 1, pstn_telno: telno};
                that.$store.dispatch('showVoiceCallModal', targetObj).then(() => {
                    logger.debug('showPstnVoiceCallModal callback');
                    callback && callback(true);
                });
                //---------------
            },

            resetStateWhenLogout: function (callback) {
                let that = this;
                that.resetState();
                callback && callback(true);
            },

            ...mapActions([
                'showIMModal', 'hideIMModal', 'showGroupCreateModal', 'hideGroupCreateModal',
                'showVideoModal', 'hideVideoModal', 'updateVideoConf', 'showVoiceConfirmModal', 'hideVoiceConfirmModal',
                'showVoicePttConfirmModal', 'hideVoicePttConfirmModal', 'showVoiceCallModal', 'hideVoiceCallModal',
                'showVideoConfirmModal', 'hideVideoConfirmModal', 'showVideoCallModal', 'hideVideoCallModal', 'resetState'
            ]),
            // 使用对象展开运算符将 getter 混入 computed 对象中
            ...mapGetters([
                // ...
            ])
        },
        computed: {
            /*localComputed() {
            },*/
            // 使用对象展开运算符将此对象混入到外部对象中
            ...mapState([
                // 映射 this.im 为 store.state.im
                'im', 'im_image_modal_show', 'im_image_modal_url', 'group_create_modal_show',
                'video', 'voice_call', 'voice_confirm', 'voice_ptt_confirm', 'video_call', 'video_confirm'
            ]),
        }
    }
</script>

<style lang="less" src="./assets/css/app.less"></style>