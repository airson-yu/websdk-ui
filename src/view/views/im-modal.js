import _ from "lodash";
import moment from 'moment';
import logger from "../../tools/logger";
import bus from '../bus';
import Vue from 'vue'
import {mapActions, mapState, mapGetters} from 'vuex'; //注册 action 和 state
import IMTextRight from "../components/im-text-right.vue";
import IMTextLeft from "../components/im-text-left.vue";
import IMVoiceRight from "../components/im-voice-right.vue";
import IMVoiceLeft from "../components/im-voice-left.vue";
import IMImageRight from "../components/im-image-right.vue";
import IMImageLeft from "../components/im-image-left.vue";
import IMFileRight from "../components/im-file-right.vue";
import IMFileLeft from "../components/im-file-left.vue";
import res_avatar1 from '../assets/img/avatar1.png';
import res_file1 from '../assets/audio/alert.wav';

export default {
    name: 'IMModal',
    components: {
        IMTextRight, IMTextLeft, IMVoiceRight, IMVoiceLeft, IMImageRight, IMImageLeft, IMFileRight, IMFileLeft
    },
    data() {
        //return store.state
        return {
            res_avatar1: res_avatar1,
            res_file1: res_file1,
            im_split: 0.38,
            name_edit: false,
            im_type: 1,//1:voice,2text
            oper_type: 1,//1:折叠，2打开
            oper_panel: 1,
            text_content: '',
            im_list: [],
            tg_mem_list: [],
            ptt_on: false,
            ptt_send_ing: false,
            ptt_receive_ing: false,
            ptt_receive_uname: '',
            ptt_receive_avatar: '',
            ts_s: '',
            ts_r: '',
            ts_s_num: 0,
            cur_tgid: null,
            dcg: null,
            target: null,
            target_info: {},
            dcg_attached: false,
            dcg_attach_loading: false,
            tg_attached: false,
            tg_attached_uids: {},
            refid_obj: {},
            upload_param: '',
            video_conf_on: false,
            video_conf_on_not_join: false,
            video_conf_share_uid: null,
            //uname: this.username
        }
    },
    props: {
        /*value: {
            type: Boolean,
            default: false
        },*/
        //username: String
        id: {
            type: Number,
            default: 0
        },
        im_target_type: {
            type: Number,
            default: 0
        },
        init_param_obj: {
            type: Object,
            default: {}
        },

    },
    created: function () {
        let that = this;
        //let root = that.$root;
        let login_uid = websdk.private_cache.login_uid;

        // TODO TODO load im history req_im_list
        // XXX TODO FIXME 由于这个接口还有问题，暂时屏蔽 2019年6月21日16:29:37
        //reqIMList = (target, exttarget, start, count, im_type, target_type, callback, cbid) => {
        websdk.request.imRequest.reqIMList(that.id, null, 0, 500, 0, that.im_target_type, function (rsp) {
            let list = rsp.iminfo;
            if (!list || list.length <= 0) {
                return;
            }
            let target = that.id;
            let im_target_type = that.im_target_type;
            //{"im_type":1,"ts":"2019-06-18T11:20:12","refid":281474976736672,"content":"","sender":68508,"extsender":"itrunk_68505","reciever":68505,"extreciever":"itrunk_68505"}
            let len = list.length - 1;
            for (let i = len; i >= 0; i--) {
                let msg = list[i];
                /*let type = msg.im_type == 5 ? 'voice_' : 'text_';
                type += msg.sender == login_uid ? 'send' : 'receive';*/
                let ts = msg.ts.replace('T', ' ').substring(5);
                let content = msg.content || '';
                let dur_num = msg.duration;
                let duration = '00:00';
                if (dur_num) {
                    let dur_m = Math.floor(dur_num / 60);
                    let dur_s = Math.ceil(dur_num % 60);
                    dur_m = dur_m >= 10 ? dur_m : '0' + dur_m;
                    dur_s = dur_s >= 10 ? dur_s : '0' + dur_s;
                    duration = dur_m + ':' + dur_s;
                }

                /**
                 1: 文字
                 2：picture
                 3：video
                 4：general file
                 5: audio
                 */
                    // TODO req_im_list接口:建议新增返回字段：头像avatar，名字uname，
                let target_name = msg.sender_name;
                let my_name = that.my_name;
                let target_avatar = msg.sender_img || that.res_avatar1;
                let my_avatar = that.my_avatar;
                if (msg.im_type == 5) { // audio
                    if (msg.sender == login_uid) { // send
                        that.append_voice_msg(that, 'voice_send', my_name, ts, msg.refid, duration, my_avatar, true);
                    } else { // receive
                        that.append_voice_msg(that, 'voice_receive', target_name, ts, msg.refid, duration, target_avatar, true);
                    }

                } else if (msg.im_type == 1) { // text
                    if (msg.sender == login_uid) { // send
                        that.append_im_msg(that, 'text_send', my_name, ts, content, my_avatar, true);
                    } else { // receive
                        that.append_im_msg(that, 'text_receive', target_name, ts, content, target_avatar, true);
                    }

                } else if (msg.im_type == 4) { // general file 后缀判断是图片还是文件
                    // TODO 解释content中的url
                    let content_json = JSON.parse(content);
                    if (!content_json) {
                        continue;
                    }
                    let ourl = content_json.url;
                    let surl = content_json.thumb;
                    let filename = content_json.filename;
                    //let desc = content_json.description;

                    let fname = filename || msg.filename || ourl.substring(ourl.lastIndexOf('_') + 1, ourl.length);
                    let is_pic = false;
                    if (_.endsWith(fname, '.jpg') || _.endsWith(fname, '.jpeg') || _.endsWith(fname, '.bmp') || _.endsWith(fname, '.gif') || _.endsWith(fname, '.png')) {
                        is_pic = true;
                    }

                    if (is_pic) {
                        if (msg.sender == login_uid) { // send
                            that.append_image_msg(that, 'image_send', my_name, ts, surl, ourl, fname, my_avatar, true);
                        } else { // receive
                            that.append_image_msg(that, 'image_receive', target_name, ts, surl, ourl, fname, target_avatar, true);
                        }
                    } else {
                        if (msg.sender == login_uid) { // send
                            that.append_file_msg(that, 'file_send', my_name, ts, ourl, fname, my_avatar, true);
                        } else { // receive
                            that.append_file_msg(that, 'file_receive', target_name, ts, ourl, fname, target_avatar, true);
                        }
                    }

                }
                /*that.im_list.push({
                    type: type,
                    uname: that.my_name,
                    ts: ts,
                    'refid': msg.refid,
                    'avatar': that.my_avatar,
                    'duration': duration,
                    'im_target_type': im_target_type,
                    'content': content,
                    'target': target
                });*/
            }
            that.im_div_scroll_bottom(200);
        }, 'req_im_list_im');

        if (that.im_target_type == 1) { //dcg
            that.dcg = true;
            that.cur_tgid = login_uid;
            that.target = that.id;

            websdk.request.userRequest.getUserInfo([that.target], null, function (rsp) {
                if (!rsp.user_info) {
                    return;
                }
                let target = rsp.user_info[0];
                that.target_info = target;
            }, 'req_user_profile_im_dcg_target');//

        } else {
            that.tg_attached = false;
            that.dcg = false;
            that.cur_tgid = that.id;
            that.target = that.id;
        }

        /*//这两个始终是对方的ID
        that.call_status_im_evt_id = 'call-status-im-' + that.id;
        that.notice_im_im_evt_id = 'notice-im-im-' + that.id;
        // DCG使用的tgid是调度台的ID
        let client_id = that.im_target_type === 1 ? login_uid : that.id;*/

        let client_id = that.id;
        that.call_status_im_evt_id = 'call-status-im-' + client_id;
        that.notice_im_im_evt_id = 'notice-im-im-' + client_id;
        //DCG时client都是调度台ID，这里需要用console_id加对方的id做为唯一Key,destroy时以此key注销
        //DCG使用的tgid是调度台的ID，但是client_id使用的是对方的ID(为了保持唯一)，所以群组相关的通知，因为client_id不匹配，DCG都收不到（直接忽略）
        that.ptt_status_im_evt_id = 'ptt-status-im-' + client_id;
        that.group_mem_status_im_evt_id = 'group-mem-status-im-' + client_id;
        that.enter_group_im_evt_id = 'enter-group-im-' + client_id;
        that.remove_group_member_im_evt_id = 'remove-group-member-im-' + client_id;
        that.add_group_member_im_evt_id = 'add-group-member-im-' + client_id;

        that.start_video_conf_im_evt_id = 'start-video-conf-im-' + client_id;
        that.start_video_conf_status_im_evt_id = 'start-video-conf-status-im-' + client_id;
        that.stop_video_conf_im_evt_id = 'stop-video-conf-im-' + client_id;
        // XXX 目前调度台不会收到这两个通知，停止分享是发的stop-video 2019年7月17日16:56:28
        /*that.share_video_conf_im_evt_id = 'share-video-conf-im-' + client_id;
        that.stop_share_video_conf_im_evt_id = 'stop-share-video-conf-im-' + client_id;*/
        that.start_video_conf_status_im_evt_id = 'start-video-conf-status-im-' + client_id;
        that.open_video_im_evt_id = 'open-video-im-' + client_id;
        that.play_video_rsp_im_evt_id = 'play-video-rsp-im-' + client_id;
        that.stop_play_video_im_evt_id = 'stop-play-video-im-' + client_id;
        that.stop_play_video_rsp_im_evt_id = 'stop-play-video-rsp-im-' + client_id;

        /*bus.$on('fresh-dcg-attached', (uid) => {
            if (uid === that.id) {
                that.dcg_attached = true;
                return;
            }
            that.dcg_attached = false;
        });*/

        // TODO 监听 call_status, 个人情况下
        //websdk.listeners.groupMemStatusNotice(function (rsp) {
        bus.$on(that.group_mem_status_im_evt_id, (rsp) => {
            // receive: {"tgid":74753,"canPtt":0,"changedUsers":[{"uid":68508,"state":1}],
            // "msg_code":"group_mem_status_notice","cmd_type":2,"session":0,"cmd_status":0,"error_reason":null,"cbid":null}

            if (rsp.tgid != that.target) {
                logger.debug('group-mem-status-im not match:{}-{}', rsp.tgid, that.target);
                return;
            }

            let users = rsp.changedUsers;

            _.forEach(users, function (data1, key1) {
                _.forEach(that.tg_mem_list, function (data, key) {
                    if (data.uid === data1.uid) {
                        data.online = data1.state === 1;
                        if (data.online) {
                            that.tg_attached_uids[data.uid] = data.uid;
                        } else {
                            delete that.tg_attached_uids[data.uid];
                        }
                    }
                });
            });

        });

        //websdk.listeners.callStatusNotice(function (rsp) {
        bus.$on(that.call_status_im_evt_id, (rsp) => {
            that.on_evt_call_status(that, rsp);
        });

        //websdk.listeners.pttStatusNotice(function (rsp) {
        bus.$on(that.ptt_status_im_evt_id, (rsp) => {
            that.on_evt_ptt_status(that, rsp);
        });

        bus.$on(that.enter_group_im_evt_id, (rsp) => {
            that.on_evt_enter_group(that, rsp);
        });

        bus.$on(that.remove_group_member_im_evt_id, (rsp) => {
            //receive: {"tgid":74753,"uids":[68507],"msg_code":"notice_rem_grp_mem"
            for (let i in rsp.uids) {
                let uid = rsp.uids[i];
                for (let j in that.tg_mem_list) {
                    if (that.tg_mem_list[j].uid == uid) {
                        that.tg_mem_list.splice(j, 1);
                        delete that.tg_attached_uids[uid];
                    }
                }
            }
        });

        bus.$on(that.add_group_member_im_evt_id, (rsp) => {
            //receive: {"tgid":74753,"uids":[68507],"msg_code":"notice_rem_grp_mem"
            let ids = [];
            outer:for (let i in rsp.uids) {
                let uid = rsp.uids[i];
                for (let j in that.tg_mem_list) {
                    if (that.tg_mem_list[j].uid == uid) {
                        continue outer;
                    }
                }
                ids.push(uid);
            }
            if (ids.length > 0) {
                websdk.request.userRequest.getUserInfo(ids, null, function (rsp) {
                    if (!rsp.user_info) {
                        return;
                    }
                    let mem = rsp.user_info;
                    if (mem && mem.length > 0) {
                        for (let i in mem) {
                            let tmp_user = mem[i];
                            if (tmp_user.uid === that.tg_attached_uids[tmp_user.uid]) {
                                tmp_user.online = true;
                            } else {
                                tmp_user.online = false;
                            }
                            that.tg_mem_list.push(tmp_user);
                        }
                        that.fresh_video_icon_from_vuex(that);
                    }
                }, 'req_user_profile_im_tg_mem_remove_mem');//
            }
        });

        bus.$on(that.notice_im_im_evt_id, (rsp) => {
            that.on_evt_notice_im(that, rsp);
        });

        bus.$on(that.start_video_conf_im_evt_id, (rsp) => {
            that.on_evt_start_video_conf_im(that, rsp);
        });

        bus.$on(that.start_video_conf_status_im_evt_id, (rsp) => {
            that.on_evt_start_video_conf_status_im(that, rsp);
        });

        bus.$on(that.stop_video_conf_im_evt_id, (rsp) => {
            that.on_evt_stop_video_conf_im(that, rsp);
        });

        bus.$on(that.open_video_im_evt_id, (rsp) => {
            that.on_evt_open_video_im(that, rsp);
        });
        bus.$on(that.play_video_rsp_im_evt_id, (rsp) => {
            that.on_evt_play_video_rsp_im(that, rsp);
        });
        bus.$on(that.stop_play_video_im_evt_id, (rsp) => {
            that.on_evt_stop_play_video_im(that, rsp);
        });
        bus.$on(that.stop_play_video_rsp_im_evt_id, (rsp) => {
            that.on_evt_stop_play_video_rsp_im(that, rsp);
        });


        // XXX 目前调度台不会收到这两个通知，停止分享是发的stop-video 2019年7月17日16:56:28
        /*bus.$on(that.share_video_conf_im_evt_id, (rsp) => {
            that.on_evt_share_video_conf_im(that, rsp);
        });
        bus.$on(that.stop_share_video_conf_im_evt_id, (rsp) => {
            that.on_evt_stop_share_video_conf_im(that, rsp);
        });*/

        if (that.im_target_type == 2) {
            // 群组里面 that.id 就直接是 cur_tgid
            websdk.request.groupRequest.enterGroup(login_uid, null, that.cur_tgid, 0, function (rsp) {
                //logger.debug('user-modal enterGroup result:{}', rsp);
            }, 'req_enter_group_im');//

            that.tg_mem_list = [];
            let console_self = _.cloneDeep(websdk.private_cache.login_user);
            console_self.display_name = '本调度台';
            console_self.online = true;
            that.tg_mem_list.push(console_self);
            let login_uid = websdk.private_cache.login_uid;

            setTimeout(function () { // 异步执行，先让窗口显示出来，再加载成员
                websdk.request.groupRequest.getGroupInfo([that.cur_tgid], function (rsp) {
                    if (!rsp.group_info) {
                        return;
                    }
                    let tg = rsp.group_info[0];
                    let uids = tg.uids;
                    if (uids && uids.length > 0) {
                        websdk.request.userRequest.getUserInfo(uids, null, function (rsp) {
                            if (!rsp.user_info) {
                                return;
                            }
                            let mem = rsp.user_info;
                            if (mem && mem.length > 0) {
                                for (let i in mem) {
                                    let tmp_user = mem[i];
                                    if (tmp_user.uid === that.tg_attached_uids[tmp_user.uid]) {
                                        tmp_user.online = true;
                                    } else {
                                        tmp_user.online = false;
                                    }
                                    if (login_uid !== tmp_user.uid) {
                                        that.tg_mem_list.push(tmp_user);
                                    }
                                }
                                that.fresh_video_icon_from_vuex(that);
                            }
                        }, 'req_user_profile_im_tg_mem');//
                    }
                }, 'req_grp_profile_im_tg_mem');//
            }, 1);

        } else {
            //that.reqCallPTT(false);
        }

        that.im_div_scroll_bottom();
    },
    mounted: function () {
        let that = this;
        let param = that.init_param_obj;
        if (param.attached) {
            that.last_dcg_attached = true;
            that.dcg_attached = true;
            that.updateDcgAttached(that.id);
        }
        /* XXX 直接在app.vue中调用了显示语音通话窗口，这里不再做处理
        if (param.force_call) {
            that.showVoiceCallModal({id: that.target, status: 11});
            let login_uid = websdk.private_cache.login_uid;
            websdk.request.voiceRequest.call(login_uid, that.target, null, null, 1, 17, 0, 1, function (rsp) {
                logger.debug('user-modal req_call_im_force result:{}', rsp);
            }, 'req_call_im_force');//
        }*/

        //let root = that.$root;
        /*bus.$on('ptt-confirm-attached', (target_id) => {
            if (target_id == that.target) {
                that.dcg_attached = true;
                that.updateDcgAttached(that.id);
            }
        });*/

        // XXX check show video_conf tip
        let tg_video_conf = that.$store.state.video_conf[that.target];
        if (tg_video_conf && !that.video_conf_on) {
            that.video_conf_on_not_join = true;
            setTimeout(function () { // XXX FOR 第一次打开窗口时UI未刷新
                that.video_conf_on_not_join = true;
            }, 1);
        }

        // FIXME FOR TEST
        //let that = this;
        /*that.append_image_msg(that, 'image_send', that.my_name, null, that.my_avatar, that.my_avatar, 'test.png', that.my_avatar);
         that.append_image_msg(that, 'image_receive', that.my_name, null, that.my_avatar, that.my_avatar, 'test.png', that.my_avatar);
         that.append_file_msg(that, 'file_send', that.my_name, null, that.res_file1, 'test.txt', that.my_avatar);
         that.append_file_msg(that, 'file_receive', that.my_name, null, that.res_file1, 'test.txt', that.my_avatar);*/
    },

    destroyed: function () {
        let that = this;
        //let root = that.$root;
        bus.$off(that.enter_group_im_evt_id);
        bus.$off(that.notice_im_im_evt_id);
        bus.$off(that.add_group_member_im_evt_id);
        bus.$off(that.remove_group_member_im_evt_id);
        bus.$off(that.ptt_status_im_evt_id);
        bus.$off(that.call_status_im_evt_id);
        bus.$off(that.group_mem_status_im_evt_id);
        //bus.$off('ptt-confirm-attached');
        //bus.$off('fresh-dcg-attached');
        bus.$off(that.start_video_conf_im_evt_id);
        bus.$off(that.start_video_conf_status_im_evt_id);
        bus.$off(that.stop_video_conf_im_evt_id);
        // XXX 目前调度台不会收到这两个通知，停止分享是发的stop-video 2019年7月17日16:56:28
        /*bus.$off(that.share_video_conf_im_evt_id);
        bus.$off(that.stop_share_video_conf_im_evt_id);*/
        bus.$off(that.open_video_im_evt_id);
        bus.$off(that.play_video_rsp_im_evt_id);
        bus.$off(that.stop_play_video_im_evt_id);
        bus.$off(that.stop_play_video_rsp_im_evt_id);

        let login_uid = websdk.private_cache.login_uid;
        if (that.cur_tgid && that.im_target_type == 2) {
            that.tg_attached = false;
            websdk.request.groupRequest.leaveGroup(login_uid, null, that.cur_tgid, function (rsp) {
                //logger.debug('user-modal leave_group_im result:{}', rsp);
            }, 'leave_group_im');//
        } else {
            that.dcg_attached = false;
            that.resetDcgAttached(that.id);
            /*websdk.request.voiceRequest.call(login_uid, that.id, null, null, 1, 20, 0, 0, function (rsp) {
                //logger.debug('user-modal req_call_ptt_im_stop_hide result:{}', rsp);
            }, 'req_call_ptt_im_stop_hide');//*/
        }

        /*websdk.listeners.cancelNotice(websdk.listeners.types.notice_ptt_status);
        websdk.listeners.cancelNotice(websdk.listeners.types.group_mem_status_notice);
        websdk.listeners.cancelNotice(websdk.listeners.types.notice_call_status);*/
    },

    methods: {
        on_evt_call_status(that, rsp) {
            if (rsp.call_type !== 20 && rsp.call_type !== 15) {
                return;
            }
            let demander = rsp.demander;
            let target = rsp.target;
            let status = rsp.status;
            let call_type = rsp.call_type;
            let login_uid = window.websdk.private_cache.login_uid;
            if (login_uid != demander && login_uid != target) { // send call or receive call
                logger.debug('im-modal ignore');
                return;
            }
            if (that.id != demander && that.id != target) { // 不是当前用户的通知消息
                logger.debug('im-modal ignore2');
                return;
            }

            // XXX 20:半双工, 这里专门处理半双工呼叫和接收
            that.dcg_attach_loading = false;
            if (call_type == 20) { // 半双工PTT
                if (status == 67) {
                    // XXX 这种情况是高阶调度台
                    that.last_dcg_attached = true;
                    that.dcg_attached = true;
                    that.updateDcgAttached(that.id);
                } else {
                    that.dcg_attached = false;
                    that.resetDcgAttached(that.id);
                    if (status == 65) {
                        // XXX 提示用户，有终端发起半双工请求（请求通话）: app.vue中已处理

                    }
                    if (status == 66) {
                        // XXX UI提示，接受或拒绝: voice-ptt-confirm-modal中已处理

                    } else if (status == 68) {
                        that.$Message.warning('目标不可达');
                    } else if (status == 69) {
                        that.$Message.warning('目标忙');
                    } else if (status == 70) {
                        that.$Message.warning('目标无应答');
                    } else if (status == 71) {
                        that.$Message.warning('由于网络不好，系统自动结束通话');
                    } else if (status == 250) {
                        that.$Message.warning('对方结束通话');
                    }
                }
            } else if (call_type == 15) { // 双全工
                that.last_dcg_attached = false;
                that.dcg_attached = false;
                that.resetDcgAttached(that.id);
                /**
                 64 – ready(仅视频call 有效)
                 65 – PTT ON请求被降级为通话请求
                 66 – 对方振铃中/振铃
                 67 – 对方已接受/接受
                 68 – 目标不可达
                 69 – 目标忙
                 70 – 目标无应答
                 71 – 由于网络不好，系统自动结束通话
                 250- 对方结束通话
                 **/
                /*if (login_uid == demander) { // send call
                    if (status == 67) {
                        if (target == this.$store.state.voice_call.target) {
                            this.$store.dispatch('sendVoiceCallSuccess', null).then(null);
                        }

                    } else if (status == 68) {
                    } else if (status == 69) {
                    } else if (status == 70) {
                    }

                } else { // receive call
                    if (status == 66) {
                    } else if (status == 67) {
                    }
                }*/

            }
        },
        on_evt_ptt_status(that, rsp) {
            if (that.im_target_type === 1 && that.id !== that.global_dcg_attached_uid) {
                // XXX dcg时，只有唯一的attach了的可以收发PTT消息
                return;
            }
            let login_uid = websdk.private_cache.login_uid;
            let sending = false;
            let callerid = rsp.callerid;
            if (callerid == login_uid) {
                sending = true;
            }
            let ts = rsp.ts;
            if (ts) {
                ts *= 1000;
            }

            //FIXME HARDCODE TEST
            //ts = new Date().getTime();

            let refid = rsp.refid;
            if (rsp.status == 1) {
                that.last_start_rsp = rsp;
                that.refid_obj[refid] = ts;
                //start ptt
                if (sending) {
                    that.ts_s = moment(ts).format('HH:mm:ss');
                    that.ptt_send_ing = true;
                    that.ptt_receive_ing = false;
                    that.im_div_scroll_bottom();
                } else {
                    that.ts_r = moment(ts).format('HH:mm:ss');
                    websdk.request.userRequest.getUserInfo([callerid], null, function (rsp) {
                        if (!rsp.user_info) {
                            return;
                        }
                        let target = rsp.user_info[0];
                        that.ptt_send_ing = false;
                        that.ptt_receive_ing = true;
                        that.ptt_receive_uname = target.display_name;
                        that.ptt_receive_avatar = target.img_url || that.res_avatar1;
                        that.im_div_scroll_bottom();
                    }, 'req_user_profile_im_tg_ptt_r');
                    /*that.ptt_send_ing = false;
                    that.ptt_receive_ing = true;*/
                }
            } else {
                that.ptt_send_ing = false;
                that.ptt_receive_ing = false;
                if (rsp.status == 2) {
                    that.ptt_on = false;
                    that.last_start_rsp = null;
                    //2-U-PTT-ON请求被拒绝，拒绝原因参见reason值
                    /**
                     *
                     1    尚未attach
                     2    当前有PTT
                     3    当前群组没有其他attach的成员
                     4    服务器离线或未准备好
                     5    强制释放
                     6    当前的PTT被用户callerid打断
                     65    PTT ON请求被降级为请求通话
                     66    目标振铃
                     67    目标被强制attach到本群组。
                     68    目标不可达
                     69    目标忙
                     **/
                    let code_obj = {
                        '1': '尚未attach',
                        '2': '当前有PTT',
                        '3': '当前群组没有其他attach的成员',
                        '4': '服务器离线或未准备好',
                        '5': '强制释放',
                        '6': '当前的PTT被用户callerid打断',
                        '65': 'PTT ON请求被降级为请求通话',
                        '66': '目标振铃',
                        '67': '目标被强制attach到本群组',
                        '68': '目标不可达',
                        '69': '目标忙',
                    }
                    let code = rsp.reason + '';
                    let tip = 'PTT失败，原因：' + code_obj[code];
                    that.$Message.error(tip);

                } else if (rsp.status == 3) {
                    that.last_start_rsp = null;
                    //end ptt
                    let duration = '00:00';
                    let ts_start = that.refid_obj[refid];
                    let ts_end = moment(ts).format('HH:mm:ss');
                    if (!ts_start) {
                        ts_start = that.ts_s_num;
                        //ts_start = new Date().getTime() - 10000;
                    }

                    if (ts_start) {
                        duration = (ts - ts_start) / 1000;
                        let dur_m = Math.floor(duration / 60);
                        let dur_s = Math.ceil(duration % 60);
                        dur_m = dur_m >= 10 ? dur_m : '0' + dur_m;
                        dur_s = dur_s >= 10 ? dur_s : '0' + dur_s;
                        duration = dur_m + ':' + dur_s;
                    }
                    let type = 'voice_send';
                    let uname = that.my_name;
                    let avatar = that.my_avatar;
                    logger.debug('duration:{}', duration);
                    if (sending) {
                    } else {
                        if (that.im_target_type == 2) {//群组里面的发送人需要查询其名字
                            websdk.request.userRequest.getUserInfo([callerid], null, function (rsp) {
                                if (!rsp.user_info) {
                                    return;
                                }
                                let target = rsp.user_info[0];
                                type = 'voice_receive';
                                uname = target.display_name;
                                avatar = target.img_url || that.res_avatar1;

                                that.append_voice_msg(that, type, uname, moment(ts_start).format('HH:mm:ss'), refid, duration, avatar, false);
                                /*that.im_list.push({
                                    type: type,
                                    uname: uname,
                                    ts: moment(ts_start).format('HH:mm:ss'),
                                    'refid': refid,
                                    'avatar': avatar,
                                    'duration': duration,
                                    'im_target_type': that.im_target_type,
                                    'target': that.id
                                });
                                that.im_div_scroll_bottom();*/

                            }, 'req_user_profile_im_tg_ptt');//
                            return;
                        }
                        type = 'voice_receive';
                        uname = that.target_name;
                        avatar = that.target_avatar;
                    }
                    that.append_voice_msg(that, type, uname, moment(ts_start).format('HH:mm:ss'), refid, duration, avatar, false);
                    /*that.im_list.push({
                        type: type,
                        uname: uname,
                        ts: moment(ts_start).format('HH:mm:ss'),
                        'refid': refid,
                        'avatar': avatar,
                        'duration': duration,
                        'im_target_type': that.im_target_type,
                        'target': that.id
                    });*/
                    // XXX 正在主动发起PTT时，发起语音视频通话，会收到状态为3的ptt_status，这时需要重置PTT按钮 2019年7月24日15:11:22
                    if (sending) {
                        that.ptt_on = false;
                    }

                } else if (rsp.status == 4) {
                    //当前PTT 权限被callerId抢占了

                    /*if (sending) {// 我抢占了别人
                        // 触发上一条PTT的结束(对方)
                        // 触发当前PTT start(我)
                    } else {// 别人抢占了我
                        // 触发上一条PTT的结束(我)
                        // 触发当前PTT start(对方)
                    }*/
                    // XXX 被抢占了需要重置PTT按钮
                    if (!sending) {
                        that.ptt_on = false;
                    }

                    //receive: {"status":4,"tgid":68508,"callerid":68508,"extcallerid":null,"reason":0,
                    // "refid":179365274,"ts":1560326322,"msg_code":"notice_ptt_status","cmd_type":2,"session":0,"cmd_status":0,"error_reason":null,"cbid":null}

                    //receive: {"status":1,"tgid":68508,"callerid":68505,"extcallerid":"itrunk_68505",
                    // "reason":0,"refid":179365262,"ts":1560326316,"msg_code":"notice_ptt_status","cmd_type":2,"session":0,"cmd_status":0,"error_reason":null,"cbid":null}

                    //receive: {"status":3,"tgid":68508,"callerid":68508,"extcallerid":null,"reason":0,
                    // "refid":179365274,"ts":1560326328,"msg_code":"notice_ptt_status","cmd_type":2,"session":0,"cmd_status":0,"error_reason":null,"cbid":null}

                    if (!that.last_start_rsp) {
                        return;
                    }
                    let last_end_rsp = {
                        status: 3,
                        tgid: rsp.tgid,
                        ts: rsp.ts,
                        msg_code: rsp.msg_code,
                        callerid: that.last_start_rsp.callerid,
                        extcallerid: that.last_start_rsp.extcallerid,
                        refid: that.last_start_rsp.refid,
                    };
                    let new_start_rsp = {
                        status: 1,
                        tgid: rsp.tgid,
                        ts: rsp.ts,
                        msg_code: rsp.msg_code,
                        callerid: rsp.callerid,
                        extcallerid: rsp.extcallerid,
                        refid: rsp.refid,
                    };
                    that.on_evt_ptt_status(that, last_end_rsp);
                    that.on_evt_ptt_status(that, new_start_rsp);

                }
                that.im_div_scroll_bottom();
            }
        },
        on_evt_enter_group(that, rsp) {
            //{"tgid":74752,"attached_users":[68508],"demander":0,"extdemander":null,"msg_code":"notice_enter_group","cmd_type":2,"session":0,"cmd_status":0,"error_reason":null,"cbid":null}
            if (rsp.attached_users) {
                let users = rsp.attached_users;
                let login_uid = websdk.private_cache.login_uid;
                _.forEach(users, function (data, key) {
                    that.tg_attached_uids[data] = data;
                    if (data === login_uid) {
                        that.tg_attached = true;
                        /*_.forEach(that.tg_mem_list, function (tmp_user, key) {
                            if (tmp_user.uid === login_uid) {
                                tmp_user.online = true;
                            }
                        });*/
                        return;
                    }
                });
            } else {
                that.tg_attached_uids = {};
            }
        },
        on_evt_notice_im(that, rsp) {
            let login_uid = websdk.private_cache.login_uid;
            let callerid = rsp.uid;
            //receive: {"uid":68506,"msg_code":"rsp_send_im","cmd_type":1,"session":0,"cmd_status":0,"error_reason":null,"cbid":null}

            let sending = false;
            if (rsp.sending === true || callerid == login_uid) {
                sending = true;
            }

            /**
             1: 文字
             2：picture
             3：video
             4：general file
             5: audio
             */
            let im_type = rsp.im_type;


            let type = 'text_send';
            if (im_type == 4) {
                let isImage = that.checkImageOfFile(rsp.filename);
                if (isImage) {
                    type = 'image_send';
                } else {
                    type = 'file_send';
                }
            }
            let uname = that.my_name;
            let avatar = that.my_avatar;
            let content = rsp.content;
            let surl = rsp.surl;
            let ourl = rsp.ourl;
            let filename = rsp.filename;

            if (sending) {
                if (!content) {
                    content = that.last_text;
                }
            } else {
                type = 'text_receive';
                if (im_type == 4) {
                    let isImage = that.checkImageOfFile(rsp.filename);
                    if (isImage) {
                        type = 'image_receive';
                    } else {
                        type = 'file_receive';
                    }
                }
                if (that.im_target_type == 2) { //群组里面的发送人需要查询其名字
                    websdk.request.userRequest.getUserInfo([callerid], null, function (rsp) {
                        if (!rsp.user_info) {
                            return;
                        }
                        let target = rsp.user_info[0];
                        //type = 'text_receive';
                        uname = target.display_name;
                        avatar = target.img_url || that.res_avatar1;

                        if (type == 'text_receive') {
                            that.append_im_msg(that, type, uname, null, content, avatar, false);
                        } else if (type == 'image_receive') {
                            that.append_image_msg(that, type, uname, null, surl, ourl, filename, avatar, false);
                        } else if (type == 'file_receive') {
                            that.append_file_msg(that, type, uname, null, ourl, filename, avatar, false);
                        }
                        /*that.im_list.push({
                            type: type,
                            uname: uname,
                            ts: moment().format('HH:mm:ss'),
                            //'refid': null,
                            'content': content,
                            'avatar': avatar,
                            //'duration': null,
                            'im_target_type': that.im_target_type,
                            'target': that.id
                        });
                        that.im_div_scroll_bottom();*/

                    }, 'req_user_profile_im_dcg_ptt');//
                    return;
                }
                //type = 'text_receive';
                uname = that.target_name;
                avatar = that.target_avatar;
            }

            if (!content) {
                content = '消息内容为空';
            }
            if (type == 'text_receive' || type == 'text_send') {
                that.append_im_msg(that, type, uname, null, content, avatar, false);
            } else if (type == 'image_receive') {
                that.append_image_msg(that, type, uname, null, surl, ourl, filename, avatar, false);
            } else if (type == 'file_receive') {
                that.append_file_msg(that, type, uname, null, ourl, filename, avatar, false);
            }
            /*that.im_list.push({
                type: type,
                uname: uname,
                ts: moment().format('HH:mm:ss'),
                //'refid': null,
                'content': content,
                'avatar': avatar,
                //'duration': null,
                'im_target_type': that.im_target_type,
                'target': that.id
            });
            that.im_div_scroll_bottom();*/

        },
        on_evt_start_video_conf_im(that, rsp) {
            //群组窗口的UI上显示一个：群组中正在进行视频会商
            //status: 0 – 接受；1 – 拒绝；2 – 超时；3 – 振铃
            // 终端发起视频会商，调度台默认不参与，status为1,这时需要显示提示
            if (rsp.status === 1) {
                if (!that.video_conf_on) {
                    that.video_conf_on_not_join = true;
                }
                return;
            }
            if (rsp.status !== 0) {
                // not success
                return;
            }
            if (!that.video_conf_on) {
                that.video_conf_on_not_join = true;
            }
        },
        on_evt_start_video_conf_status_im(that, rsp) {
            // XXX TODO 本调度台收到其他调度台发起的视频会商，本调度台需要振铃提示，并回video_conf_status

        },
        on_evt_stop_video_conf_im(that, rsp) {
            let uid = rsp.demander;
            that.hideVideoModal(uid);
            that.updateVideoState(uid, 'stopPlayVideo');
            that.video_conf_on = false;
            that.video_conf_on_not_join = false;
        },

        on_evt_open_video_im(that, rsp) {
            that.updateVideoState(rsp.target, 'playVideo');
        },
        on_evt_play_video_rsp_im(that, rsp) {
            if (rsp.cmd_status !== 0 && rsp.cmd_status !== 3) { // 0:accept, 3:waiting
                that.updateVideoState(rsp.target, 'stopPlayVideo');
                return;
            }
            if (rsp.cmd_status === 0) {
                that.updateVideoState(rsp.target, 'playVideo');
            }
        },

        on_evt_stop_play_video_im(that, rsp) {
            that.updateVideoState(rsp.target, 'stopPlayVideo');
        },
        on_evt_stop_play_video_rsp_im(that, rsp) {
            that.updateVideoState(rsp.target, 'stopPlayVideo');
        },

        // XXX 目前调度台不会收到这两个通知，停止分享是发的stop-video 2019年7月17日16:56:28
        /*on_evt_share_video_conf_im(that, rsp) {},
        on_evt_stop_share_video_conf_im(that, rsp) {},*/

        toggleType() {
            this.im_type == 1 ? this.im_type = 2 : this.im_type = 1;
        }
        ,
        on_hide_modal() {// XXX 当modal窗口发起$emit事件通知窗口关闭时，这里继续通知App.vue窗口已经关闭
            let that = this;
            logger.debug('on_hide_modal im');
            if (that.dcg_attached) {
                that.reqCallPTT(false);
            }
            this.$emit('on-im-cancel');
        }
        ,
        im_div_scroll_bottom: function (delay_time) {
            if (!delay_time) delay_time = 100;
            setTimeout(function () {
                let node = document.getElementById('im-div');
                if (!node) {
                    return;
                }
                node.scrollTop = node.scrollHeight;
            }, delay_time);
        }
        ,
        on_visible_change(result) {
            //logger.debug('on_visible_change:{}', result);
        }
        ,
        toggleEditName() {
            return;// FIXME NEXT PHASE
            logger.debug('toggleEditName');
            if (this.name_edit) {
                logger.debug('do save');
            }
            this.name_edit = !this.name_edit;
        }
        ,
        toggleOperType() {
            this.oper_type == 1 ? this.oper_type = 2 : this.oper_type = 1;
        }
        ,
        switchOperPanel(oper_panel) {
            this.oper_panel = oper_panel;
        }
        ,

        reqCallPTT(flag) {
            let that = this;
            let target = that.id;
            let login_uid = websdk.private_cache.login_uid;
            if (flag) {
                // 先重置状态，等到收到对应通知时再更新UI
                setTimeout(() => {
                    that.dcg_attached = false;
                    that.dcg_attach_loading = true;
                    that.resetDcgAttached(that.id);
                }, 1);
                // start
                //let uid = this.$store.state.user.uid;
                websdk.request.voiceRequest.call(login_uid, target, null, null, 1, 20, 0, 1, function (rsp) {
                    //logger.debug('user-modal req_call_ptt_im_start result:{}', rsp);
                }, 'req_call_ptt_im_start');//
            } else {
                setTimeout(() => {
                    that.dcg_attached = false;
                    that.dcg_attach_loading = false;
                    that.resetDcgAttached(that.id);
                }, 1);
                // end 直接视为成功
                websdk.request.voiceRequest.call(login_uid, target, null, null, 1, 20, 0, 0, function (rsp) {
                    //logger.debug('user-modal req_call_ptt_im_stop result:{}', rsp);
                }, 'req_call_ptt_im_stop');//
            }
            //that.im_div_scroll_bottom();
        }
        ,

        /*buildVoiceMsg(type, user){
        },*/

        reqPttOn() {
            let that = this;
            if (that.im_target_type == 1) {// dcg
                if (!that.dcg_attached) {
                    that.$Message.warning('请先执行强呼操作');
                    return;
                }
            } else if (that.im_target_type == 2) {
                if (!that.tg_attached) {
                    that.$Message.warning('请先执行强呼操作');
                    return;
                }
            } else {
                return;
            }
            that.ptt_on = true;
            //let login_uid = websdk.private_cache.login_uid;
            //that.id
            websdk.request.voiceRequest.pttOn(that.cur_tgid, function (rsp) {
                //logger.debug('req_ptt_on_im result:{}', rsp);
                that.ptt_send_ing = true; // 测试发现有时发送ptt不会收到status=1的notice，这里先更新状态
                let now = new Date();
                that.ts_s = moment(now).format('HH:mm:ss');
                that.ts_s_num = now.getTime();
            }, 'req_ptt_on_im');//
        }
        ,

        reqPttOff() {
            let that = this;
            that.ptt_on = false;
            //let login_uid = websdk.private_cache.login_uid;
            //that.id
            websdk.request.voiceRequest.pttOff(that.cur_tgid, function (rsp) {
                //logger.debug('req_ptt_off_im result:{}', rsp);
                that.ptt_send_ing = false; // 测试发现有时发送ptt不会收到status=1的notice，这里先更新状态
            }, 'req_ptt_off_im');//
        }
        ,

        checkImageOfFile(file_url) {
            if (file_url.endsWith('.jpg') || file_url.endsWith('.jpeg') || file_url.endsWith('.bmp') || file_url.endsWith('.gif') || file_url.endsWith('.png')) {
                return true;
            }
            return false;
        }
        ,

        sendIMMsg() {
            let that = this;
            let content = that.text_content;
            if (!content) {
                that.$Message.info('请输入消息内容');
                return;
            }

            let now = new Date();
            let time = now.getTime();
            that.last_text = content;
            //(target, im_type, content, time, callback, cbid)
            websdk.request.imRequest.sendIMText(that.target, null, 1, content, time, function (rsp) {
                //logger.debug('req_send_im result:{}', rsp);
                // 新增消息，状态为发送中
                that.append_im_msg(that, 'text_send', that.my_name, null, content, that.my_avatar, false);
                /*that.im_list.push({
                    type: 'text_send',
                    //uname: that.target_name,
                    uname: that.my_name,
                    ts: moment(now).format('HH:mm:ss'),
                    'refid': time,
                    //'avatar': that.target_avatar,
                    'avatar': that.my_avatar,
                    'duration': 0,
                    'im_target_type': that.im_target_type,
                    'content': content,
                    'target': that.id
                });
                that.im_div_scroll_bottom();*/

            }, 'req_send_im');//

            that.text_content = '';//清空输入框
        }
        ,

        append_im_msg(that, type, uname, ts, content, avatar, not_scroll) {
            that.im_list.push({
                type: type,
                uname: uname,
                ts: ts || moment().format('HH:mm:ss'),
                //'refid': null,
                //'duration': null,
                'avatar': avatar,
                'content': content,
                'im_target_type': that.im_target_type,
                'target': that.id
            });
            if (!not_scroll) {
                that.im_div_scroll_bottom();
            }
        }
        ,

        append_voice_msg(that, type, uname, ts, refid, duration, avatar, not_scroll) {
            that.im_list.push({
                type: type,
                uname: uname,
                ts: ts || moment().format('HH:mm:ss'),
                'refid': refid,
                'duration': duration,
                'avatar': avatar,
                //'content': content,
                'im_target_type': that.im_target_type,
                'target': that.id
            });
            if (!not_scroll) {
                that.im_div_scroll_bottom();
            }
        }
        ,

        check_call_status(type) {
            let that = this;
            if (that.$store.state.voice_call.modal_show) {
                that.$Message.warning('当前正在语音通话，无法发起' + type + '通话');
                return false;
            } else if (that.$store.state.video_call.modal_show) {
                that.$Message.warning('当前正在视频通话，无法发起' + type + '通话');
                return false;
            }
            return true;
        },

        reqCall() {
            let that = this;
            // check status
            if (!that.check_call_status('语音')) {
                return false;
            }
            that.showVoiceCallModal({id: that.target, status: 1});
            let login_uid = websdk.private_cache.login_uid;
            websdk.request.voiceRequest.call(login_uid, that.target, null, null, 1, 15, 0, 1, function (rsp) {
                //logger.debug('user-modal req_call_im result:{}', rsp);
            }, 'req_call_im_15');//
        }
        ,

        reqVideoCall() {
            let that = this;
            // check status
            if (!that.check_call_status('视频')) {
                return false;
            }
            this.showVideoCallModal({id: that.target, status: 1});
            let login_uid = websdk.private_cache.login_uid;
            websdk.request.voiceRequest.call(login_uid, that.target, null, null, 1, 1, 0, 1, function (rsp) {
                //logger.debug('user-modal req_call_im result:{}', rsp);
            }, 'req_call_im_1');//
        }
        ,

        showIMModalUser(uid) {
            let login_uid = websdk.private_cache.login_uid;
            if (uid === login_uid) { // 不能打开调度台本身的IM窗口
                return false;
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
            }, 'req_user_profile_im_tg');//
        }
        ,

        toggleVideo(uid) {

        }
        ,

        // group operation
        forceEnterGroup() {
            let that = this;
            websdk.request.groupRequest.forceEnterGroup(that.id, function (rsp) {
            }, 'force_enter_group_im_tg');//
        }
        ,

        forceLeaveGroup() {
            let that = this;
            websdk.request.groupRequest.forceLeaveGroup(that.id, function (rsp) {
            }, 'force_leave_group_im_tg');//
        }
        ,

        showGrpMemAdd() {
            let that = this;
            that.$store.dispatch('showIMUserListModal', {id: that.id, oper_type: 'add'}).then(() => {
            });
        }
        ,

        showGrpMemRem() {
            let that = this;
            that.$store.dispatch('showIMUserListModal', {id: that.id, oper_type: 'remove'}).then(() => {
            });
        }
        ,

        append_image_msg(that, type, uname, ts, url_small, url_large, filename, avatar, not_scroll) {
            let file_name = filename || '';
            that.im_list.push({
                type: type,
                uname: uname,
                ts: ts || moment().format('HH:mm:ss'),
                //'refid': null,
                //'duration': null,
                'avatar': avatar,
                'url_small': url_small,
                'url_large': url_large,
                'file_name': file_name,
                'im_target_type': that.im_target_type,
                'target': that.id
            });
            if (!not_scroll) {
                that.im_div_scroll_bottom(200);
            }
        }
        ,

        append_file_msg(that, type, uname, ts, file_url, filename, avatar, not_scroll) {
            if (!file_url) {
                logger.warn('append_file_msg url null:{}', file_name);
                return;
            }
            let file_name = filename || file_url.substring(file_url.lastIndexOf('/') + 1, file_url.length);
            //logger.debug('file_name: {}', file_name);
            that.im_list.push({
                type: type,
                uname: uname,
                ts: ts || moment().format('HH:mm:ss'),
                //'refid': null,
                //'duration': null,
                'avatar': avatar,
                'content': file_url,
                'file_name': file_name,
                'im_target_type': that.im_target_type,
                'target': that.id
            });
            if (!not_scroll) {
                that.im_div_scroll_bottom(200);
            }
        }
        ,

        onUploadFormatErrorCore(type, file, fileList) {
            let that = this;
            let message = type == 1 ? '图片格式不正确' : '文件格式不正确';
            that.$Message.warning(message);
            if (null != file && undefined != file) {
                logger.warn('onUploadFormatErrorFile:{}', file.name);
            } else {
                logger.warn('onUploadFormatErrorFile');
            }

        }
        ,
        onUploadExceededSizeCore(type, file, fileList) {
            let that = this;
            let message = type == 1 ? '图片大小不能超过100M' : '文件大小不能超过100M';
            that.$Message.warning(message);
            if (null != file && undefined != file) {
                logger.warn('onUploadFormatErrorFile:{}', file.size);
            } else {
                logger.warn('onUploadFormatErrorFile');
            }
        }
        ,
        onUploadErrorCore(type, error, file, fileList) {
            let that = this;
            let message = type == 1 ? '图片发送失败' : '文件发送失败';
            that.$Message.warning(message);
            if (null != file && undefined != file) {
                logger.warn('onUploadFormatErrorFile:{}', file.name);
            } else {
                logger.warn('onUploadFormatErrorFile');
            }
        }
        ,

        onUploadProgressImg(event, file, fileList) {
            logger.debug('onUploadProgressImg');
        }
        ,
        onUploadSuccessImg(rsp, file, fileList) {
            let that = this;
            logger.debug('onUploadSuccessImg:{}', rsp);
            that.append_image_msg(that, 'image_send', that.my_name, null, rsp.surl, rsp.hurl, rsp.filename, that.my_avatar);

            //sendIMFileDone = (target, exttarget, im_type, time, filename, size, ourl, surl, callback, cbid) => {
            let ts = moment().format('YYYY-MM-DD HH:mm:ss');
            let size = rsp.size || file.size || 0;
            websdk.request.imRequest.sendIMFileDone(that.id, null, 4, ts, rsp.fid, rsp.filename, size, rsp.hurl, rsp.surl, function (rsp) {
            }, 'req_send_im_file_done_im_img');//

        }
        ,
        onUploadFormatErrorImg(file, fileList) {
            this.onUploadFormatErrorCore(1, file, fileList);
        }
        ,
        onUploadExceededSizeImg(file, fileList) {
            this.onUploadExceededSizeCore(1, file, fileList);
        }
        ,
        onUploadErrorImg(error, file, fileList) {
            this.onUploadErrorCore(1, error, file, fileList);
        }
        ,

        onUploadProgressFile(event, file, fileList) {
            logger.debug('onUploadProgressFile');
        }
        ,
        onUploadSuccessFile(rsp, file, fileList) {
            let that = this;
            logger.debug('onUploadSuccessFile:{}', rsp);
            that.append_file_msg(that, 'file_send', that.my_name, null, rsp.file_url, rsp.filename, that.my_avatar);

            let ts = moment().format('YYYY-MM-DD HH:mm:ss');
            let size = rsp.size || file.size || 0;
            websdk.request.imRequest.sendIMFileDone(that.id, null, 4, ts, rsp.fid, rsp.filename, size, rsp.file_url, rsp.file_url, function (rsp) {
            }, 'req_send_im_file_done_im_file');//
        }
        ,
        onUploadFormatErrorFile(file, fileList) {
            this.onUploadFormatErrorCore(2, file, fileList);
        }
        ,
        onUploadExceededSizeFile(file, fileList) {
            this.onUploadExceededSizeCore(2, file, fileList);
        }
        ,
        onUploadErrorFile(error, file, fileList) {
            this.onUploadErrorCore(2, file, fileList);
        }
        ,

        reqPlayVideo(uid) {
            let that = this;
            let login_uid = websdk.private_cache.login_uid;
            that.video_ing_uid = uid;
            websdk.request.videoRequest.playVideo(login_uid, uid, null, null, 0, 0, 0, function (rsp) {
                logger.debug('req_play_video_im result:{}', rsp);
            }, 'req_play_video_im');//
            that.updateVideoState(uid, 'playVideo');
        }
        ,

        reqStopVideo: function (uid) {
            let that = this;
            let login_uid = websdk.private_cache.login_uid;
            that.hideVideoModal(uid);
            that.updateVideoState(uid, 'stopPlayVideo');
            that.video_ing_uid = null;
            websdk.request.videoRequest.stopPlayVideo(login_uid, uid, null, null, 0, 0, function (rsp) {
                logger.debug('req_stop_video_im result:{}', rsp);
            }, 'req_stop_video_im');//
        }
        ,
        toggleVideoConf() {
            let that = this;
            let login_uid = websdk.private_cache.login_uid;
            that.video_conf_on = !that.video_conf_on;
            that.video_conf_on_not_join = false;

            if (that.video_conf_on) {
                websdk.request.videoRequest.startVideoConf(login_uid, null, that.id, function (rsp) {
                }, 'req_start_video_conf_im');//
            } else {
                websdk.request.videoRequest.stopVideoConf(login_uid, null, that.id, function (rsp) {
                }, 'req_stop_video_conf_im');//
                that.updateVideoConf({tgid: that.id, type: 'stop'});
                // TODO FIXME 这里要指定用户的uid
                if (that.video_ing_uid) {
                    that.hideVideoModal(that.video_ing_uid);
                    that.updateVideoState(that.video_ing_uid, 'stopPlayVideo');
                }
            }
        }
        ,
        shareVideoConf(uid) {
            if (!uid) return;
            let that = this;
            let login_uid = websdk.private_cache.login_uid;
            that.video_conf_share_uid = uid;
            that.video_ing_uid = uid;
            websdk.request.videoRequest.shareVideoInVideoConf(login_uid, null, that.id, uid, function (rsp) {
            }, 'req_share_video_in_video_conf_im');//
            that.updateVideoState(uid, 'shareVideo');
        }
        ,
        stopShareVideoConf(uid) {
            if (!uid) return;
            let that = this;
            let login_uid = websdk.private_cache.login_uid;
            websdk.request.videoRequest.stopShareVideoInVideoConf(login_uid, null, that.id, uid, function (rsp) {
            }, 'req_stop_share_video_in_video_conf_im');//
            that.video_conf_share_uid = null;
            that.updateVideoState(uid, 'stopShareVideo');
        }
        ,

        operateVideo(item_name) {
            logger.debug('operateVideo:{}', item_name);
            let that = this;
            let item = item_name.split('_');
            let oper = item[0];
            let uid = item[1];
            if (oper === 'playVideo') {
                that.reqPlayVideo(uid);

            } else if (oper === 'stopPlayVideo') {
                that.reqStopVideo(uid);

            } else if (oper === 'shareVideo') {
                that.shareVideoConf(uid);

            } else if (oper === 'stopShareVideo') {
                that.stopShareVideoConf(uid);

            }
        }
        ,
        updateVideoState(uid, oper) {
            logger.debug('updateVideoState:{}-{}', uid, oper);
            let that = this;
            if (oper === 'playVideo') { // XXX 可以同时摘取多个视频，但只能同时分享一个视频 2019年7月19日15:54:39
                let login_uid = websdk.private_cache.login_uid;
                for (let j in that.tg_mem_list) {
                    let item = that.tg_mem_list[j];
                    if (item.uid == uid) {
                        item.video_ing = true;
                        Vue.set(that.tg_mem_list, j, item);
                        //break;
                    } /*else if (item.video_ing) {
                        item.video_ing = false;
                        Vue.set(that.tg_mem_list, j, item);
                    }*/
                    else if (item.uid === login_uid) { // XXX 关闭调度台自己分享的视频窗口
                        item.video_ing = false;
                        item.video_share_ing = false;
                        Vue.set(that.tg_mem_list, j, item);
                    }
                }

            } else if (oper === 'stopPlayVideo') {
                for (let j in that.tg_mem_list) {
                    let item = that.tg_mem_list[j];
                    if (item.uid == uid) {
                        item.video_ing = false;
                        item.video_share_ing = false;
                        Vue.set(that.tg_mem_list, j, item);
                        break;
                    }
                }

            } else if (oper === 'shareVideo') { // XXX 可以同时摘取多个视频，但只能同时分享一个视频 2019年7月19日15:54:39
                let login_uid = websdk.private_cache.login_uid;
                for (let j in that.tg_mem_list) {
                    let item = that.tg_mem_list[j];
                    if (item.uid == uid) {
                        item.video_ing = true;
                        item.video_share_ing = true;
                        Vue.set(that.tg_mem_list, j, item);
                        //break;
                    } else if (item.video_ing) {
                        if (item.uid === login_uid) { // XXX 关闭调度台自己分享的视频窗口
                            item.video_ing = false;
                        }
                        item.video_share_ing = false;
                        Vue.set(that.tg_mem_list, j, item);
                    }
                }

            } else if (oper === 'stopShareVideo') {
                for (let j in that.tg_mem_list) {
                    let item = that.tg_mem_list[j];
                    if (item.uid == uid) {
                        item.video_share_ing = false;
                        Vue.set(that.tg_mem_list, j, item);
                        break;
                    }
                }

            }
        },

        fresh_video_icon_from_vuex(that) {
            _.forEach(that.$store.state.video, function (data, key) {
                if (data.main_modal_show) {
                    that.updateVideoState(data.id, 'playVideo');
                }
            });
        },

        justNoticeLocation() {
            let that = this;
            logger.debug('justNoticeLocation:{}', that.id);
            websdk.listeners.noticeWebUserLocation(that.id);
        },

        ...mapActions([
            'showIMModal', 'hideIMModal', 'showIMUserListModal', 'hideIMUserListModal', 'hideVideoModal', 'updateVideoConf',
            'showVoiceConfirmModal', 'hideVoiceConfirmModal', 'showVoiceCallModal', 'hideVoiceCallModal',
            'showVideoCallModal', 'hideVideoCallModal', 'updateDcgAttached', 'resetDcgAttached'
        ]),
        // 使用对象展开运算符将 getter 混入 computed 对象中
        ...mapGetters([
            // ...
        ])
    },
    computed: {
        main_modal_show: {
            get() {
                let that = this;
                let show = false;
                /*_.forEach(this.$store.state.im, function (data, key) {
                    if (data.id === that.id) {
                        show = data.main_modal_show;
                    }
                });*/
                let data = this.$store.state.im[that.id];
                if (data) {
                    show = data.main_modal_show;
                }
                return show;
            },
            set(value) {
                if (value) {
                    this.$store.dispatch('showIMModal', {'id': this.id, 'reload': true}).then(null);
                } else {
                    this.$store.dispatch('hideIMModal', this.id).then(null);
                }
            }
        },
        upload_url: {
            get() {
                let that = this;
                //upload_url: 'https://39.105.135.70/rtv/api/v1/file/chunk_upload?type=gfile&token=7874b03ac36de4b35c3cfaf400eaee70&uid=68508&target=68505',
                let url = window.websdk.private_cache.upload_url_gfile;
                if (url) {
                    url += '&target=' + that.id;
                }
                return url;
            }
        },
        global_dcg_attached_uid: {
            get() {
                return this.$store.state.cur_dcg_attached_uid;
            }
        },
        uname: {
            get() {
                //return 'test';
                let that = this;
                let name = '_';
                /*_.forEach(this.$store.state.im, function (data, key) {
                    if (data && data.id === that.id) {
                        name = data.name;
                    }
                });*/
                let data = that.$store.state.im[that.id];
                if (data) {
                    name = data.name;
                }
                return name;
            }
            ,
            set(value) {
                //this.$store.commit('showUserModal', value);
                // TODO TODO update username
            }
        },
        my_name: {
            get() {
                //return this.$store.state.login_user.display_name;
                return window.websdk.private_cache.login_user.display_name;
            }
        },
        my_avatar: {
            get() {
                //let avatar = this.$store.state.login_user.img_url;
                let avatar = window.websdk.private_cache.login_user.img_url;
                if (!avatar) {
                    avatar = res_avatar1;
                }
                return avatar;
            }
        },
        target_name: {
            get() {
                return this.target_info.display_name;
            }
        },
        target_avatar: {
            get() {
                let avatar = this.target_info.img_url;
                if (!avatar) {
                    avatar = res_avatar1;
                }
                return avatar;
            }
        },
        cur_dcg_attached_uid: {
            get() {
                return this.$store.state.cur_dcg_attached_uid;
            }
        },
        ptt_confirm_attached: {
            get() {
                return this.$store.state.ptt_confirm_attached;
            }
        },

        // 使用对象展开运算符将此对象混入到外部对象中
        ...
            mapState([
                // 映射 this.user_modal_show 为 store.state.user_modal_show
                //'user_modal_show'
            ]),
    },
    watch: {
        cur_dcg_attached_uid: function (newVal, oldVal) {
            logger.debug('watch_cur_dcg_attached_uid:{}-{}', newVal, oldVal);
            let that = this;
            if (newVal === that.id) {
                that.dcg_attached = true;
                return;
            }
            that.dcg_attached = false;
        },
        ptt_confirm_attached: function (newVal, oldVal) {
            logger.debug('watch_ptt_confirm_attached:{}-{}', newVal, oldVal);
            let that = this;
            if (newVal == that.target) {
                that.dcg_attached = true;
                that.updateDcgAttached(that.id);
            }
        }

    }
}