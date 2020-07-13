<template>
    <Modal v-model="voice_ptt_confirm_modal_show" class="sdk-modal sdk-voice-modal sdk-voice-ptt-confirm-modal" draggable scrollable :width=340 :z-index="5000"
           v-on:on-cancel="on_hide_modal">
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
        name: 'VoicePttConfirmModal',
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
            bus.$on('call-status-ptt-confirm', (rsp) => {
                if (rsp.call_type !== 20) {
                    return;
                }
                let demander = rsp.demander;
                let target = rsp.target;
                let status = rsp.status;
                let login_uid = window.websdk.private_cache.login_uid;
                if (login_uid != demander && login_uid != target) { // send call or receive call
                    logger.debug('call-ptt-confirm-modal ignore');
                    return;
                }
                // XXX 20:半双工振铃， 这里专门处理半双工振铃
                if (status == 66 && target == login_uid) {
                    logger.debug('showVoicePttConfirmModal');
                    that.showVoicePttConfirmModal({id: demander, status: 1});
                }
            });
        },
        destroyed: function () {
            //let that = this;
            //let root = that.$root;
            bus.$off('call-status-ptt-confirm');
        },

        methods: {
            toggleType() {
                //this.im_type == 1 ? this.im_type = 2 : this.im_type = 1;
            },
            on_hide_modal() {// XXX 当modal窗口发起$emit事件通知窗口关闭时，这里继续通知App.vue窗口已经关闭
                this.$emit('on-call-ptt-confirm-cancel');
            },

            acceptCall() {
                let that = this;
                let login_uid = window.websdk.private_cache.login_uid;
                // eslint-disable-next-line no-unused-vars
                window.websdk.request.voiceRequest.callStatus(login_uid, that.target, null, null, 1, 20, 67, null, function (rsp) {
                    logger.debug('req_call_status_voice_ptt_confirm_accept showIMModal');
                    window.websdk.request.userRequest.getUserInfo([that.target], null, function (rsp) {
                        if (!rsp.user_info) {
                            return;
                        }
                        let target = rsp.user_info[0];
                        target.im_target_type = 1;
                        target.init_param_obj = {'attached': true};
                        target.reload = true;
                        that.$store.dispatch('showIMModal', target).then(() => {
                        });
                        //let root = that.$root;
                        //bus.$emit('ptt-confirm-attached', target.id);
                        that.pttConfirmAttached(target.id);
                        that.on_hide_modal();
                    }, 'req_user_profile_voice_ptt_confirm_accept');//

                }, 'req_call_status_voice_ptt_confirm_accept');//

            },
            rejectCall() {
                let that = this;
                //let root = this.$root;
                let login_uid = window.websdk.private_cache.login_uid;
                // eslint-disable-next-line no-unused-vars
                window.websdk.request.voiceRequest.callStatus(login_uid, that.target, null, null, 1, 20, 69, null, function (rsp) {
                    logger.debug('req_call_status_voice_ptt_confirm_reject on_hide_modal');
                    that.on_hide_modal();
                }, 'req_call_status_voice_ptt_confirm_reject');//
            },

            // eslint-disable-next-line no-unused-vars
            on_visible_change(result) {

            },

            //receive: {"demander":68506,"target":68508,"channel":0,"call_type":15,"status":66,"msg_code":"notice_call_status","cmd_type":2,"session":0,"cmd_status":0,"error_reason":null,"cbid":null}

            ...mapActions([
                'showVoicePttConfirmModal', 'hideVoicePttConfirmModal', 'pttConfirmAttached'
            ]),
            // 使用对象展开运算符将 getter 混入 computed 对象中
            ...mapGetters([
                // ...
            ])
        },
        computed: {
            voice_ptt_confirm_modal_show: {
                get() {
                    return this.$store.state.voice_ptt_confirm.modal_show;
                },
                set(value) {
                    if (value) {
                        this.$store.dispatch('showVoicePttConfirmModal', this.target).then(null);
                    } else {
                        this.$store.dispatch('hideVoicePttConfirmModal').then(null);
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


