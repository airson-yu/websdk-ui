<template>
    <Modal v-model="voice_confirm_modal_show" class="sdk-voice-modal" draggable scrollable :width=340 :z-index="5000"
           v-on:on-cancel="on_hide_modal(true)">
        <div slot="header" style="">
        </div>
        <div class="sdk-panel" style="font-size:large;padding: 5px 20px 15px 20px;">
            <div>
                <div style="display: inline-block;width:20%;">
                    <Icon type="md-megaphone" color="#fff" style="font-size:45px;"/>
                </div>
                <div style="display: inline-block;width:75%;vertical-align: middle;">
                    <div style="word-break: break-all;line-height: 30px;">{{uname}}</div>
                    <div>发起了语音通话。</div>
                </div>
            </div>

        </div>
        <div slot="footer" style="">
            <Button @click="rejectCall" type="warning">拒绝</Button>
            <Button @click="acceptCall" type="primary">接听</Button>
        </div>
    </Modal>
</template>

<script>
    import logger from "../../tools/logger";
    import bus from '../bus';
    import {mapActions, mapState, mapGetters} from 'vuex'; //注册 action 和 state

    export default {
        name: 'VoiceConfirmModal',
        components: {},
        data() {
            //return store.state
            return {
                //uname: this.username
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

        created() {
            let that = this;
            //let root = this.$root;
            bus.$on('call-status-voice-confirm', (rsp) => {
                if (rsp.call_type !== 15 && rsp.call_type !== 32) {
                    return;
                }
                that.pstn_telno = '';
                if (rsp.call_type == 32) {
                    that.pstn_telno = rsp.telno;
                }
                let demander = rsp.demander;
                let target = rsp.target;
                let status = rsp.status;
                let login_uid = window.websdk.private_cache.login_uid;
                if (login_uid != demander && login_uid != target) { // send call or receive call
                    logger.debug('call-confirm-modal ignore');
                    return;
                }
                // XXX 15:全双工振铃， 这里专门处理全双工振铃
                //logger.debug('call-confirm-modal status:{}', rsp);
                if (status == 66 && target == login_uid) { //
                    logger.debug('showVoiceConfirmModal');
                    that.showVoiceConfirmModal({id: demander, status: 1, pstn_telno: that.pstn_telno});
                } else if (status == 70 && target == login_uid) { //
                    logger.debug('voice timeout on_hide_modal');
                    that.on_hide_modal();
                } else if (status == 71 && target == login_uid) {
                    logger.debug('voice network_bad on_hide_modal');
                    that.on_hide_modal();
                } else if (status == 250 && target == login_uid) { // && target == login_uid
                    logger.debug('voice end on_hide_modal');
                    that.on_hide_modal();
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
            //let that = this;
            //let root = that.$root;
            bus.$off('call-status-voice-confirm');
        },

        methods: {
            toggleType() {
                //this.im_type == 1 ? this.im_type = 2 : this.im_type = 1;
            },
            on_hide_modal(reject) {// XXX 当modal窗口发起$emit事件通知窗口关闭时，这里继续通知App.vue窗口已经关闭
                this.$emit('on-call-confirm-cancel');
                reject && this.rejectCall();
            },

            acceptCall() {
                let that = this;
                //let root = this.$root;
                let login_uid = window.websdk.private_cache.login_uid;
                let call_type = 15;
                if (that.pstn_telno) {
                    call_type = 32;
                }
                // eslint-disable-next-line no-unused-vars
                window.websdk.request.voiceRequest.callStatus(login_uid, that.target, null, null, 1, call_type, 67, that.pstn_telno, function (rsp) {
                    logger.debug('req_call_status_voice_confirm_accept showVoiceCallModal');
                    that.showVoiceCallModal({id: that.target, status: 2, pstn_telno: that.pstn_telno});
                    that.on_hide_modal();
                }, 'req_call_status_voice_confirm_accept');//
            },
            rejectCall() {
                let that = this;
                //let root = this.$root;
                let login_uid = window.websdk.private_cache.login_uid;
                let call_type = 15;
                if (that.pstn_telno) {
                    call_type = 32;
                }
                // eslint-disable-next-line no-unused-vars
                window.websdk.request.voiceRequest.callStatus(login_uid, that.target, null, null, 1, call_type, 69, that.pstn_telno, function (rsp) {
                    logger.debug('req_call_status_voice_confirm_reject on_hide_modal');
                    that.on_hide_modal();
                }, 'req_call_status_voice_confirm_reject');//
            },

            // eslint-disable-next-line no-unused-vars
            on_visible_change(result) {

            },

            //receive: {"demander":68506,"target":68508,"channel":0,"call_type":15,"status":66,"msg_code":"notice_call_status","cmd_type":2,"session":0,"cmd_status":0,"error_reason":null,"cbid":null}

            ...mapActions([
                'showVoiceConfirmModal', 'hideVoiceConfirmModal', 'showVoiceCallModal', 'hideVoiceCallModal'
            ]),
            // 使用对象展开运算符将 getter 混入 computed 对象中
            ...mapGetters([
                // ...
            ])
        },
        computed: {
            voice_confirm_modal_show: {
                get() {
                    return this.$store.state.voice_confirm.modal_show;
                },
                set(value) {
                    if (value) {
                        this.$store.dispatch('showVoiceConfirmModal', this.target).then(null);
                    } else {
                        this.$store.dispatch('hideVoiceConfirmModal').then(null);
                    }
                }
            },

            // 使用对象展开运算符将此对象混入到外部对象中
            ...mapState([
                // 映射 this.user_modal_show 为 store.state.user_modal_show
                //'user_modal_show'
            ]),
        },
        /*watch: {
            value(val) { // XXX 当props被设置后就不可变，这里就是再重新打开窗口时，更新user_modal_show变量为true
                this.show = val;
                //this.$store.commit('showXXXModal', val);
            }
        }*/
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<!--<style lang="less" scoped src="../assets/css/user-group-modal.less"></style>-->
<style lang="less" scoped>

</style>


