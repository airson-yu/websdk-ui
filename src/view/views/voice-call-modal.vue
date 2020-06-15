<template>
    <Modal v-model="voice_call_modal_show" class="sdk-voice-modal sdk-voice-call-modal" title="语音通话" draggable scrollable :width=484 :z-index="5000"
           v-on:on-cancel="on_hide_modal" v-on:on-visible-change="on_visible_change">
        <div slot="header">
            <div class="ivu-modal-header-inner">
                <span>语音通话</span>
                <span v-show="!show_max">-</span>
                <span v-show="!show_max">{{uname}}</span>
                <Icon v-show="show_max" @click="toggleMax" type="md-remove" color="#fff" class="sdk-toggle-max"/>
                <Icon v-show="!show_max" @click="toggleMax" type="md-add" color="#fff" class="sdk-toggle-max"/>
            </div>
        </div>
        <div v-show="show_max" class="sdk-panel">
            <div>
                <Avatar class="ivu-avatar-largest" :src="res_avatar1"/>
            </div>
            <div class="sdk-uname">{{uname}}</div>
            <div v-show="call_status==1">正在等待对方接受邀请...</div>
            <div v-show="call_status==11">正在建立语音连接...</div>
            <div v-show="call_status==2">{{call_time}}</div>
            <audio id="sdk_call_ring" loop="true" preload="auto" :src="res_ring" type="audio/mpeg"></audio>
        </div>
        <div slot="footer" class="sdk-tac">
            <!-- TODO 尚不支持音量调节 2019年6月13日15:59:37
            <div v-show="call_status==2 && show_volume" class="sdk-volume-bar">
                <Slider v-model="volume"></Slider>
            </div>
            <Button v-show="call_status==2" shape="circle" class="sdk-call-btn" @click="toggleVolume">
                <Icon type="md-volume-up" color="#000" class="sdk-btn"/>
            </Button>-->
            <Button @click="cancelCall" shape="circle" class="sdk-call-btn">
                <Icon type="ios-call" color="#E62019" class="sdk-btn sdk-call"/>
            </Button>
            <!--<Button @click="mockCall" shape="circle" class="sdk-call-btn">
                <Icon type="ios-call" color="green" class="sdk-btn sdk-call"/>
            </Button>-->
        </div>
    </Modal>
</template>

<script>
    import moment from 'moment';
    import logger from "../../tools/logger";
    import bus from '../bus';
    import {mapActions, mapState, mapGetters} from 'vuex'; //注册 action 和 state
    import res_ring from '../assets/audio/ring.wav';
    import res_avatar1 from '../assets/img/avatar1.png';

    export default {
        name: 'VoiceCallModal',
        components: {},
        data() {
            //return store.state
            return {
                res_ring: res_ring,
                res_avatar1: res_avatar1,
                show_volume: false,
                show_max: true,
                volume: 25,
                //uname: 'ertestuser',
                //call_status: 0, // 0:not_call, 1:call_ing, 11:force_call_ing, 2:call_success
                call_time: '00:00',
                call_time_num: 0,
                call_ts_id: null,
                call_established: false,
            }
        },
        props: {
            /*value: {
                type: Boolean,
                default: false
            },*/
            //username: String
            uname: {
                type: String,
                default: ''
            },
            target: {
                type: Number,
                default: 0
            },
            status: {
                type: Number,
                default: 0
            }
        },
        mounted: function () {
            let that = this;
            //let root = that.$root;
            bus.$on('call-status-voice-call', (rsp) => {
                if (rsp.call_type !== 15 && rsp.call_type !== 17 && rsp.call_type !== 32) {
                    return;
                }
                let demander = rsp.demander;
                let target = rsp.target;
                let status = rsp.status;
                let login_uid = window.websdk.private_cache.login_uid;
                if (login_uid != demander && login_uid != target) { // send call or receive call
                    logger.debug('voice-call-modal ignore');
                    return;
                }

                //call_type=32:pstn call
                that.pstn_telno = '';
                if (rsp.call_type == 32) {
                    that.pstn_telno = rsp.telno;
                }

                // XXX 15:全双工，17:全双工语音强拉, 这里专门处理全双工呼叫
                if (status == 66) {
                    //  66 – 对方振铃中/振铃

                } else if (status == 67) {
                    // 67 – 对方已接受/接受
                    logger.debug('voice-call-modal accepted');
                    if (target == that.$store.state.voice_call.target || that.pstn_telno == that.$store.state.voice_call.uname) {
                        that.call_established = true;
                        that.$store.dispatch('updateVoiceCallStatus', 2).then(null);
                        that.fresh_ui_call_status(2);
                    }

                } else if (status == 250) {
                    // 250- 对方结束通话
                    logger.debug('voice-call-modal close');
                    that.on_hide_modal(true);
                    return;

                } else if (status == 253) {
                    // XXX 正在通话时再发起通话，只需要提示正在通话，不能fresh_ui_call_status
                    let vcall_ing = that.$store.state.voice_call;
                    if (!that.call_established && (!vcall_ing.modal_show || vcall_ing.target == that.target || vcall_ing.uname == that.pstn_telno)) {
                        that.on_hide_modal(true);
                    }
                    that.$Message.warning('当前正在进行语音通话，不能再次发起通话');
                } else {
                    logger.debug('voice-call-modal other');
                    that.fresh_ui_call_status(0);
                    //that.$store.dispatch('updateVoiceCallStatus', 0).then(null);
                    that.hideVoiceCallModal();
                    if (status == 68) {
                        that.$Message.warning('目标不可达');
                    } else if (status == 69) {
                        that.$Message.warning('目标忙');
                    } else if (status == 70) {
                        that.$Message.warning('目标无应答');
                    } else if (status == 250) {
                        that.$Message.warning('对方结束通话');
                    } else if (status == 251) {
                        that.$Message.warning('无法打开摄像头');
                    } else if (status == 252) {
                        that.$Message.warning('视频数已超限');
                    } else if (status == 253) {
                        that.$Message.warning('当前正在进行音视频通话，不能再次发起通话');
                    } else if (status == 254) {
                        that.$Message.warning('当前正在其他组分享视频');
                    } else if (status == 255) {
                        that.$Message.warning('未检测到麦克风');
                    }
                }
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
            });
        },
        destroyed: function () {
            let that = this;
            //let root = that.$root;
            bus.$off('call-status-voice-call');
        },
        methods: {
            toggleVolume() {
                this.show_volume = !this.show_volume;
            },
            toggleMax() {
                this.show_max = !this.show_max;
            },
            /*resetCallStatus() {
                document.getElementById('sdk_call_ring').load();
                this.call_ing = true;
                this.call_time = '00:01';
                if (this.call_ts_id) {
                    clearInterval(this.call_ts_id);
                    this.call_ts_id = null;
                }
            },*/
            callStop() {
                let that = this;
                let login_uid = websdk.private_cache.login_uid;
                let call_type = 15;
                if (that.pstn_telno) {
                    call_type = 32;
                }
                //if (that.call_status == 1 || that.call_status == 11 || that.call_status == 2) {
                websdk.request.voiceRequest.call(login_uid, that.target, null, null, 1, call_type, 0, 0, that.pstn_telno, function (rsp) {
                    //logger.debug('voice_call_req_call_stop result:{}', rsp);
                }, 'voice_call_req_call_stop');//
                //}
            },
            cancelCall() {
                //this.callStop();
                this.on_hide_modal();
            },
            mockCall() {
                //this.resetCallStatus();
                //this.call_status = 2;
                this.$store.dispatch('updateVoiceCallStatus', 2).then(null);
                this.fresh_ui_call_status(2);
            },
            mockConfirmCall() {
                //TODO
                //his.$store.dispatch('showVoiceCallModal', null).then(null);

            },
            on_hide_modal(no_call_stop) {// XXX 当modal窗口发起$emit事件通知窗口关闭时，这里继续通知App.vue窗口已经关闭
                let that = this;
                if (!no_call_stop) {
                    that.callStop();
                }
                //this.resetCallStatus();
                that.call_established = false;
                this.$emit('on-call-cancel');
                that.fresh_ui_call_status(0);
                that.voice_call_modal_show = false;
            },

            on_visible_change(result) {
                let that = this;
                if (result && that.status == 2) {
                    that.fresh_ui_call_status(2);
                    //on
                }

                let notice_data = {
                    cmd_status: 0,
                    cmd_type: 2,
                    msg_code: result ? 'notice_voice_call_modal_open' : 'notice_voice_call_modal_close',
                    target: that.target
                };
                websdk.listeners.monitors.notice_dynamic(notice_data);

                /*let that = this;
                if (result) {
                    if (that.status == 2) {
                        that.fresh_ui_call_status(2);
                    }
                    //on
                } else {
                    that.callStop();
                    that.fresh_ui_call_status(0);
                    that.$emit('on-call-cancel');
                }*/
            },
            fresh_ui_call_status(val) {
                let that = this;
                that.call_time = '00:00';
                that.call_time_num = 0;
                that.call_time_base = moment().minutes(0).seconds(0);
                if (that.call_ts_id) {
                    clearInterval(that.call_ts_id);
                    that.call_ts_id = null;
                }
                document.getElementById('sdk_call_ring').load();
                if (!this.$store.state.voice_call.modal_show) {
                    return;
                }

                if (val == 1) { // call ing
                    document.getElementById('sdk_call_ring').play();
                } else if (val == 2) { // call success
                    //document.getElementById('sdk_call_ring').load();
                    // TODO 开始计时
                    that.call_ts_id = setInterval(function () {
                        let duration = ++that.call_time_num;

                        let dur_m = Math.floor(duration / 60);
                        let dur_s = Math.ceil(duration % 60);
                        dur_m = dur_m >= 10 ? dur_m : '0' + dur_m;
                        dur_s = dur_s >= 10 ? dur_s : '0' + dur_s;
                        duration = dur_m + ':' + dur_s;

                        that.call_time = duration;
                        //that.call_time = that.call_time_base.add(1, 's').format('HH:mm:ss');
                        logger.debug('vo_call:{}', that.call_time);
                    }, 1000);
                } else {
                    //document.getElementById('sdk_call_ring').load();
                }
            },
            ...mapActions([
                'showVoiceCallModal', 'hideVoiceCallModal'
            ]),
            // 使用对象展开运算符将 getter 混入 computed 对象中
            ...mapGetters([
                // ...
            ])
        }
        ,
        computed: {
            voice_call_modal_show: {
                get() {
                    return this.$store.state.voice_call.modal_show;
                }
                ,
                set(value) {
                    if (value) {
                        this.$store.dispatch('showVoiceCallModal', this.target).then(null);
                    } else {
                        this.$store.dispatch('hideVoiceCallModal').then(null);
                    }
                }
            }
            ,
            call_status: {
                get() {
                    //return 'test';
                    return this.$store.state.voice_call.status;
                }
                ,
            }
            ,

            // 使用对象展开运算符将此对象混入到外部对象中
            ...
                mapState([
                    // 映射 this.voice_call 为 store.state.voice_call
                    'voice_call'
                ]),
        }
        ,
        /*watch: {
            call_status: function (val) {
                if (val == 1 && this.$store.state.voice_call_modal_show) { // call ing
                    document.getElementById('sdk_call_ring').play();
                } else if (val == 2 && this.$store.state.voice_call_modal_show) { // call success
                    document.getElementById('sdk_call_ring').load();
                    // TODO 开始计时
                    let that = this;
                    if (that.call_ts_id) {
                        clearInterval(that.call_ts_id);
                        that.call_ts_id = null;
                    }
                    that.call_ts_id = setInterval(function () {
                        that.call_time = new Date();
                    }, 1000);
                } else {
                    document.getElementById('sdk_call_ring').load();
                }
            },
        }*/
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<!--<style lang="less" scoped src="../assets/css/user-group-modal.less"></style>-->
<style lang="less" scoped>


    .sdk-toggle-max {
        font-size: 22px;
        right: 40px;
        position: absolute;
        cursor: pointer;
        top: 13px;
    }

    .sdk-panel {
        height: 488px; //388 340
        text-align: center;
        font-size: large;
        padding: 115px 20px 20px 20px; //60px 20px 20px 20px
    }

    .sdk-volume-bar {
        position: absolute;
        bottom: 60px;
        width: 90%;
    }

    .sdk-call-btn {
        padding: 5px;
        margin-left: 15px;
        margin-right: 15px;
    }

    .sdk-btn {
        font-size: 35px;
    }

    .sdk-call {
        transform: rotate(135deg);
    }

    .sdk-uname {
        margin: 20px;
        word-break: break-all;
    }
</style>


