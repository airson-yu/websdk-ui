<template>
    <Modal v-model="main_modal_show" class="voice-modal video-modal" title="视频数据" width="auto" draggable scrollable :z-index="5000"
           :fullscreen="fullscreen" class-name="fullscreen_toggle_modal" v-on:on-cancel="on_hide_modal"> <!-- :width=width -->
        <div slot="header">
            <div class="ivu-modal-header-inner">
                <span>视频数据-{{uname}}</span>
                <Icon v-show="show_max && !fullscreen" @click="toggleMax" type="md-remove" color="#fff" class="toggle_max"/>
                <Icon v-show="!show_max && !fullscreen" @click="toggleMax" type="md-add" color="#fff" class="toggle_max"/>
                <Icon @click="toggleFullscreen" type="md-square-outline" color="#fff" class="toggle_fullscreen"/>
            </div>
        </div>
        <div v-show="show_max" class="panel">
            <div v-show="call_status==1" style="position: absolute;left: 0px;text-align: left;margin: 5px;">
                <Avatar class="ivu-avatar avatar_medium" :src="res_avatar1"/>
                <div style="display: inline-block;vertical-align: middle;">
                    <div class="uname">{{uname}}</div>
                    <div>正在等待视频数据...</div>
                </div>
            </div>
            <div style="min-width:288px;min-height:288px;"><!--  v-bind:style="{height: height + 'px' }" -->
                <canvas :id="video_canvas_id" style="max-width:100%;max-height:100%;margin:1px 1px 0px 1px;"></canvas>
            </div>
        </div>
        <div v-show="playid !== 0" slot="footer" class="tac">
            <!--<Button @click="switchCamera" size="small">
                <Icon type="ios-reverse-camera-outline" color="#111"/>
            </Button>-->
            <Icon v-show="mute" @click="switchMute" type="md-volume-off" size="24" style="cursor: pointer;" title="点击打开声音"/>
            <Icon v-show="!mute" @click="switchMute" type="md-volume-up" size="24" style="cursor: pointer;" title="点击关闭声音"/>
            <Icon @click="switchCamera" type="ios-reverse-camera-outline" size="30" style="cursor: pointer;" title="切换摄像头"/>
            <span>分辨率:</span>
            <Select v-model="cur_resolution" size="small" style="width:80px;" v-on:on-change="updateVideoSetResolution">
                <Option v-for="item in resolution_list" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            <span>画面质量:</span>
            <Select v-model="quality" size="small" style="width:41px;" v-on:on-change="updateVideoSetQuality">
                <Option v-for="item in quality_list" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
        </div>
    </Modal>
</template>

<script>
    //import moment from 'moment';
    import logger from "../../tools/logger";
    import bus from '../bus';
    import {mapActions, mapState, mapGetters} from 'vuex'; //注册 action 和 state
    import res_ring from '../assets/audio/ring.wav';
    import res_avatar1 from '../assets/img/avatar1.png';
    import VideoProcessor from "../../tools/video/videoProcessor";

    export default {
        name: 'VideoModal',
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
                call_status: 0, // 0:not_call, 1:call_ing, 2:call_success
                call_time: '00:00',
                call_time_num: 0,
                call_ts_id: null,
                cur_resolution: this.resolution,
                resolution_list: [{
                    value: 1,
                    label: '320*240'
                }, {
                    value: 3,
                    label: '640*480'
                }, {
                    value: 7,
                    label: '1280*720'
                }],
                quality: 1,
                quality_list: [{
                    value: 1,
                    label: '流畅（码率较低）'
                }, {
                    value: 2,
                    label: '清晰（高码率）'
                }],
                fullscreen: false,
                mute: false
            }
        },
        props: {
            id: {
                type: Number,
                default: 0
            },
            url: {
                type: String,
                default: ''
            },
            resolution: {
                type: Number,
                default: 0
            },
            channel: {
                type: Number,
                default: -1
            },
            playid: {
                type: Number,
                default: -1
            },
            width: {
                type: Number,
                default: 744
            },
            height: {
                type: Number,
                default: 640
            },
        },
        /*created: function () {
            this.call_status = this.status;
        },*/

        mounted: function () {
            let that = this;
            //let root = that.$root;

            if (that.url) {
                let dom_id = that.video_canvas_id;
                that.vp = new VideoProcessor(that.url, dom_id);
                that.setVideoWS({id: that.id, ws: that.vp.videoWebsocket});
                that.call_status = 2;

                // TODO FIXME 如果channel为0则为自己的视频，这里不应该显示底部设置栏，视屏窗口也应该减小

                //FIXME FOR TEST
                /*new VideoProcessor(that.url, 'c1');
                new VideoProcessor(that.url, 'c2');
                new VideoProcessor(that.url, 'c3');
                new VideoProcessor(that.url, 'c4');
                new VideoProcessor(that.url, 'c5');
                new VideoProcessor(that.url, 'c6');
                new VideoProcessor(that.url, 'c7');
                new VideoProcessor(that.url, 'c8');*/

            }

            let client_id = that.id;
            that.open_video_video_evt_id = 'open-video-video-' + client_id;
            that.stop_play_video_video_evt_id = 'stop-play-video-video-' + client_id;
            that.update_video_set_evt_id = 'update-video-set-' + client_id;

            bus.$on(that.open_video_video_evt_id, (rsp) => {

            });

            bus.$on(that.stop_play_video_video_evt_id, (rsp) => {
                if (rsp.target == that.id) {
                    that.on_hide_modal(true);
                }
            });

            bus.$on(that.update_video_set_evt_id, (rsp) => {
                if (rsp.target == that.id) {
                    if (rsp.resolution) {
                        that.cur_resolution = rsp.resolution;
                    }
                    if (rsp.quality) {
                        that.quality = rsp.quality;
                    }
                }
            });

        },
        destroyed: function () {
            let that = this;
            //let root = that.$root;
            bus.$off(that.open_video_video_evt_id);
            bus.$off(that.stop_play_video_video_evt_id);
        },

        methods: {
            toggleVolume() {
                this.show_volume = !this.show_volume;
            },
            toggleMax() {
                this.show_max = !this.show_max;
            },
            switchCamera() {
                let that = this;
                //switchCamera = (target, exttarget, session, channel, type, callback, cbid) => {
                websdk.request.videoRequest.switchCamera(that.id, null, 0, 0, 0, function (rsp) {
                    logger.debug('req_switch_camera_video result:{}', rsp);
                }, 'req_switch_camera_video');//
            },
            switchMute() {
                let that = this;
                that.mute = !that.mute;
                let mute_num = that.mute ? 1 : 0;
                websdk.request.videoRequest.videoMute(that.id, null, 0, 0, mute_num, function (rsp) {
                    //logger.debug('req_video_mute_video result:{}', rsp);
                }, 'req_video_mute_video');//

            },
            updateVideoSetResolution(value) {
                let that = this;
                let new_resolution = value;
                //updateVideoSet = (target, exttarget, session, channel, resolution, quality, callback, cbid) => {
                websdk.request.videoRequest.updateVideoSet(that.id, null, 0, 0, new_resolution, 0, function (rsp) {
                    logger.debug('req_update_video_set_video_resolution result:{}', rsp);
                }, 'req_update_video_set_video_resolution');//
            },
            updateVideoSetQuality(value) {
                let that = this;
                let new_quality = value;
                //updateVideoSet = (target, exttarget, session, channel, resolution, quality, callback, cbid) => {
                websdk.request.videoRequest.updateVideoSet(that.id, null, 0, 0, 0, new_quality, function (rsp) {
                    logger.debug('req_update_video_set_video_quality result:{}', rsp);
                }, 'req_update_video_set_video_quality');//
            },
            toggleFullscreen() {
                let that = this;
                that.fullscreen = !that.fullscreen;
                that.vp.fresh_canvas_toggle_fullscreen(that.fullscreen);
            },
            on_hide_modal(ignore_stop) {// XXX 当modal窗口发起$emit事件通知窗口关闭时，这里继续通知App.vue窗口已经关闭
                let that = this;
                //this.resetCallStatus();
                if (!ignore_stop) {
                    let login_uid = websdk.private_cache.login_uid;
                    websdk.request.videoRequest.stopPlayVideo(login_uid, that.id, null, null, 0, 0, function (rsp) {
                        //logger.debug('req_stop_play_video_domain result:{}', rsp);
                    }, 'req_stop_play_video_video');
                }
                this.$emit('on-video-cancel');
            },

            ...mapActions([
                'showVideoModal', 'hideVideoModal', 'setVideoWS'
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
                    /*_.forEach(this.$store.state.video, function (data, key) {
                        if (data.id === that.id) {
                            show = data.main_modal_show;
                        }
                    });*/
                    let data = this.$store.state.video[that.id];
                    if (data) {
                        show = data.main_modal_show;
                    }
                    return show;
                },
                set(value) {
                    if (value) {
                        this.$store.dispatch('showVideoModal', {'id': this.id, 'reload': true}).then(null);
                    } else {
                        this.$store.dispatch('hideVideoModal', this.id).then(null);
                    }
                }
            },
            uname: {
                get() {
                    //return 'test';
                    let that = this;
                    let name = '_';
                    /*_.forEach(this.$store.state.video, function (data, key) {
                        if (data && data.id === that.id) {
                            name = data.name;
                        }
                    });*/
                    let data = this.$store.state.video[that.id];
                    if (data) {
                        name = data.name;
                    }
                    return name;
                },
                set(value) {
                    //this.$store.commit('showUserModal', value);
                    // TODO TODO update username
                }
            },
            video_canvas_id: {
                get() {
                    //return 'test';
                    return 'video_canvas_' + this.id;
                },
            },
            target_self: {
                get() {
                    // XXX 通过uid和playid都能判断是否为调度台自己的视频
                    return websdk.private_cache.login_uid === this.id;
                },
            },

            // 使用对象展开运算符将此对象混入到外部对象中
            /*...mapState([
                // 映射 this.video_call 为 store.state.video_call
                'video'
            ]),*/
        },
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<!--<style lang="less" scoped src="../assets/css/user-group-modal.less"></style>-->
<style lang="less" scoped>

    .toggle_max {
        font-size: 22px;
        right: 68px;
        position: absolute;
        cursor: pointer;
        //top: 13px;
    }

    .toggle_fullscreen {
        font-size: 22px;
        right: 40px;
        position: absolute;
        cursor: pointer;
        //top: 13px;
    }

    .panel {
        //height: 480px;
        text-align: center;
        padding: 0px;
    }

    .avatar_medium {
        width: 50px !important;
        height: 50px !important;
        border-radius: 25px !important;
    }

    .volume_bar {
        position: absolute;
        bottom: 60px;
        width: 90%;
    }

    .call_btn {
        padding: 5px;
        margin-left: 15px;
        margin-right: 15px;
    }

    .btn {
        font-size: 35px;
    }

    .call {
        transform: rotate(135deg);
    }

    .uname {
        //margin: 20px;
        word-break: break-all;
    }
</style>


