<template>
  <Modal :id="sdk_video_modal_id" v-model="main_modal_show" class="sdk-modal sdk-video-modal sdk-video-main-modal"
         title="视频数据"
         :width="modal_width" scrollable :z-index="5000" :fullscreen="fullscreen"
         class-name="sdk-fullscreen-toggle-modal"
         :closable="false" :mask="false" v-on:on-cancel="on_hide_modal"> <!-- :width=width -->
    <div slot="header">
      <div class="ivu-modal-header-inner">
        <span>视频数据-{{ uname }}</span>
        <Icon v-show="show_max && !fullscreen" @click="toggleMax" type="md-remove" color="#fff" class="sdk-toggle-max"/>
        <Icon v-show="!show_max && !fullscreen" @click="toggleMax" type="md-add" color="#fff" class="sdk-toggle-max"/>
        <Icon @click="toggleFullscreen" type="md-square-outline" color="#fff" class="sdk-toggle-fullscreen"/>
        <Icon @click="close_confirm" type="md-close" color="#fff" class="sdk-close"/>
      </div>
      <div v-show="show_confirm" class="close-confirm" style="position: absolute;right: 0px;top: 0px;">
        <div class="ivu-modal-content">
          <!--<a class="ivu-modal-close"><i class="ivu-icon ivu-icon-ios-close"></i></a>-->
          <div class="ivu-modal-body">
            <div class="ivu-modal-confirm" style="padding:10px 5px;">
              <!--<div class="ivu-modal-confirm-head">
                  <div class="ivu-modal-confirm-head-icon ivu-modal-confirm-head-icon-confirm">
                      <i class="ivu-icon ivu-icon-ios-help-circle"></i>
                  </div>
                  <div class="ivu-modal-confirm-head-title">提示</div>
              </div>-->
              <div class="ivu-modal-confirm-body" style="padding-left: 8px;">
                <div>
                  <div><span style="color: #fff;">是否需要同时关闭终端的视频？</span></div>
                </div>
              </div>
              <div class="ivu-modal-confirm-footer" style="text-align: center;">
                <button @click="close_confirm_cancel" type="button" class="ivu-btn ivu-btn-success ivu-btn-xs">
                  <span>否</span></button>
                <button @click="close_confirm_ok" type="button" class="ivu-btn ivu-btn-primary ivu-btn-xs">
                  <span>是</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="show_max" class="sdk-panel">
      <div v-show="call_status==1" style="position: absolute;left: 0px;text-align: left;margin: 5px;">
        <Avatar class="ivu-avatar sdk-avatar-medium" :src="res_avatar1"/>
        <div style="display: inline-block;vertical-align: middle;">
          <div class="sdk-uname">{{ uname }}</div>
          <div>正在等待视频数据...</div>
        </div>
      </div>
      <div style="min-width:288px;min-height:240px;">
        <!-- 240 for: 320*240  v-bind:style="{height: height + 'px' }" margin:1px 1px 0px 1px; -->
        <canvas :id="sdk_video_canvas_id" style="max-width:100%;max-height:100%;margin:0px 0px -4px 0px;"></canvas>
      </div>
    </div>
    <div v-show="playid !== 0" slot="footer" class="sdk-tac">
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
      <div class="sdk-oper-item" title="语音通话">
        <Icon @click="reqCall" type="ios-call-outline" class="sdk-icon-btn"/>
      </div>
    </div>
  </Modal>
</template>

<script>
//import moment from 'moment';
import logger from "../../tools/logger";
import config from "../../tools/config";
import bus from '../bus';
import {mapActions, mapGetters} from 'vuex'; //注册 action 和 state
import res_ring from '../assets/audio/ring.wav';
import res_avatar1 from '../assets/img/avatar1.png';
import VideoProcessor from "../../tools/video/videoProcessor";
import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';

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
      modal_width: config.video_modal_default_w,// 一般默认是竖屏，使用高度
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
      mute: false,
      show_confirm: false,
      close_manually: false
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
    that.show_confirm = false;
    //let root = that.$root;

    $('.sdk-video-main-modal .ivu-modal').draggable();
    $('.sdk-video-main-modal .ivu-modal-fullscreen').draggable("disable");

    if (that.url) {
      let dom_id = that.sdk_video_canvas_id;
      let modal_outer_id = that.sdk_video_modal_id;
      that.vp = new VideoProcessor(that.url, dom_id, modal_outer_id, that);
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

    // eslint-disable-next-line no-unused-vars
    bus.$on(that.open_video_video_evt_id, (rsp) => {

    });

    bus.$on(that.stop_play_video_video_evt_id, (rsp) => {
      if (rsp.target == that.id) {
        that.update_close_manually(that, false);
        that.on_hide_modal('ignore');
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

    let notice_data = {
      cmd_status: 0,
      cmd_type: 2,
      msg_code: 'notice_video_modal_open',
      target: that.id
    };
    window.websdk.listeners.monitors.notice_dynamic(notice_data);

  },
  destroyed: function () {
    let that = this;
    //let root = that.$root;
    bus.$off(that.open_video_video_evt_id);
    bus.$off(that.stop_play_video_video_evt_id);

    let notice_data = {
      cmd_status: 0,
      cmd_type: 2,
      msg_code: 'notice_video_modal_close',
      target: that.id,
      manually: that.close_manually
    };
    window.websdk.listeners.monitors.notice_dynamic(notice_data);
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
      window.websdk.request.videoRequest.switchCamera(that.id, null, 0, 0, 0, function (rsp) {
        logger.debug('req_switch_camera_video result:{}', rsp);
      }, 'req_switch_camera_video');//
    },
    switchMute() {
      let that = this;
      that.mute = !that.mute;
      let mute_num = that.mute ? 1 : 0;
      // eslint-disable-next-line no-unused-vars
      window.websdk.request.videoRequest.videoMute(that.id, null, 0, 0, mute_num, function (rsp) {
        //logger.debug('req_video_mute_video result:{}', rsp);
      }, 'req_video_mute_video');//

    },
    updateVideoSetResolution(value) {
      let that = this;
      let new_resolution = value;
      //updateVideoSet = (target, exttarget, session, channel, resolution, quality, callback, cbid) => {
      window.websdk.request.videoRequest.updateVideoSet(that.id, null, 0, 0, new_resolution, 0, function (rsp) {
        logger.debug('req_update_video_set_video_resolution result:{}', rsp);
      }, 'req_update_video_set_video_resolution');//
    },
    updateVideoSetQuality(value) {
      let that = this;
      let new_quality = value;
      //updateVideoSet = (target, exttarget, session, channel, resolution, quality, callback, cbid) => {
      window.websdk.request.videoRequest.updateVideoSet(that.id, null, 0, 0, 0, new_quality, function (rsp) {
        logger.debug('req_update_video_set_video_quality result:{}', rsp);
      }, 'req_update_video_set_video_quality');//
    },
    toggleFullscreen() {
      let that = this;
      if (!that.show_max) {
        that.show_max = true;//在全屏之前，如果没有最大化，先设置为最大化，不然视频区域不会显示视频 2020年12月18日09:33:41
      }
      that.fullscreen = !that.fullscreen;
      that.vp.fresh_canvas_toggle_fullscreen(that.fullscreen);
      setTimeout(function () {
        $('.sdk-video-main-modal .ivu-modal').draggable("enable");
        $('.sdk-video-main-modal .ivu-modal-fullscreen')
            .css('left', '0px') // 解决拖动过窗口后全屏时全屏位置产生偏移的问题 2020年12月24日18:12:24
            .css('top', '0px')
            .draggable("disable");
      }, 100);
    },
    update_close_manually(that, manually) {
      that.close_manually = manually;
    },
    on_hide_modal(notice_type) {// XXX 当modal窗口发起$emit事件通知窗口关闭时，这里继续通知App.vue窗口已经关闭
      //notice_type: 'ignore','only_stop_play', 'stop_play_push'
      let that = this;
      //this.resetCallStatus();
      logger.debug("on_hide_modal notice_type:{}", notice_type);
      if (notice_type != 'ignore') {
        ////0停止视频播放和推流，1仅停止视频播放，不停止推流
        let stop_type = notice_type == 'only_stop_play' ? 1 : 0;
        let login_uid = window.websdk.private_cache.login_uid;
        // eslint-disable-next-line no-unused-vars
        window.websdk.request.videoRequest.stopPlayVideo(login_uid, that.id, null, null, 0, 0, stop_type, function (rsp) {
          //logger.debug('req_stop_play_video_domain result:{}', rsp);
        }, 'req_stop_play_video_video');
      }
      //this.$Modal.remove();
      this.$emit('on-video-cancel');
    },
    close_confirm() {
      let that = this;
      let action = window.websdk.websdkui.configApi.get_video_close_action();
      let pull_action = window.websdk.websdkui.configApi.get_video_pull_close_action();//调度台拉视频
      let push_action = window.websdk.websdkui.configApi.get_video_push_close_action();//主动推视频
      let data = this.$store.state.video[that.id];
      let video_type = -1;//0主动推的视频PUSH，2tg视频会商，3告警触发的视频，4拉取的视频PULL，-1未知
      //logger.debug('action:{},pull:{},push:{}', action, pull_action, push_action);
      if (data) {
        video_type = data.type;
        if (video_type === undefined) {
          logger.warn('video_type undefined,reset to -1');
          video_type = -1;
        }
      }
      if (video_type === 4) {
        if (pull_action) {
          action = pull_action;
        }

      } else if (video_type === 0) {
        if (push_action) {
          action = push_action;
        }

      }
      logger.debug("close_confirm video_type:{}, action:{}", video_type, action);
      if (action == 2) {
        that.main_modal_show = false;
        that.update_close_manually(that, true);
        that.on_hide_modal('only_stop_play');// 只关闭窗口
        logger.debug("close_confirm action 2");

      } else if (action == 3) {
        that.main_modal_show = false;
        that.update_close_manually(that, true);
        that.on_hide_modal('stop_play_push');// 通知终端停止推流
        logger.debug("close_confirm action 3");

      } else if (action == 1) {
        that.show_confirm = true;
        /*that.$Modal.confirm({
            title: "提示",
            content: "<div><span>是否需要关闭终端的视频？</span></div>",
            //"<p>新增流程尚未完成，</p><div><span>是否需要</span><span style='color:#ef4836'>关闭窗口</span><span>？</span></div>",
            okText: "是",
            cancelText: "否",
            closable: true,
            zIndex: 9999,
            onCancel: () => {
                that.main_modal_show = false;
                that.on_hide_modal(true);// 只关闭窗口
                logger.debug("close_confirm onCancel 2");
            },
            onOk: () => {
                that.main_modal_show = false;
                that.on_hide_modal(false);// 通知终端停止推流
                logger.debug("close_confirm onOk 3");
            }
        });*/
      }
    },
    close_confirm_cancel() {
      let that = this;
      that.main_modal_show = false;
      that.update_close_manually(that, true);
      that.on_hide_modal('only_stop_play');// 只关闭窗口
      logger.debug("close_confirm onCancel 2");
    },
    close_confirm_ok() {
      let that = this;
      that.main_modal_show = false;
      that.update_close_manually(that, true);
      that.on_hide_modal('stop_play_push');// 通知终端停止推流
      logger.debug("close_confirm onOk 3");
    },

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
      let login_uid = window.websdk.private_cache.login_uid;
      window.websdk.request.voiceRequest.call(login_uid, that.target, null, null, 1, 15, 0, 1, null, function (rsp) {
        //logger.debug('user-modal req_call_im result:{}', rsp);
      }, 'req_call_video_modal');//
    },

    ...mapActions([
      'showVideoModal', 'hideVideoModal', 'setVideoWS',
      'showVoiceConfirmModal', 'hideVoiceConfirmModal', 'showVoiceCallModal', 'hideVoiceCallModal',
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
      // eslint-disable-next-line no-unused-vars
      set(value) {
        //this.$store.commit('showUserModal', value);
        // TODO TODO update username
      }
    },
    sdk_video_canvas_id: {
      get() {
        return 'sdk_video_canvas_' + this.id;
      },
    },
    sdk_video_modal_id: {
      get() {
        return 'sdk_video_modal_' + this.id;
      },
    },
    target_self: {
      get() {
        // XXX 通过uid和playid都能判断是否为调度台自己的视频
        return window.websdk.private_cache.login_uid === this.id;
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

.ivu-modal-content {
  background-color: #001959;
}

.ivu-modal-wrap {
  z-index: 9999;
}

.sdk-toggle-max {
  font-size: 22px;
  right: 68px;
  position: absolute;
  cursor: pointer;
  //top: 13px;
}

.sdk-toggle-fullscreen {
  font-size: 22px;
  right: 40px;
  position: absolute;
  cursor: pointer;
  //top: 13px;
}

.sdk-close {
  font-size: 22px;
  right: 10px;
  position: absolute;
  cursor: pointer;
  //top: 13px;
}

.sdk-panel {
  //height: 480px;
  text-align: center;
  padding: 0px;
}

.sdk-avatar-medium {
  width: 50px !important;
  height: 50px !important;
  border-radius: 25px !important;
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
  //margin: 20px;
  word-break: break-all;
}

.sdk-oper-item {
  float: left;
  width: 25%;
}

.sdk-pointer {
  cursor: pointer;
}

.sdk-icon-btn {
  cursor: pointer;
  color: #fff;
  font-size: 40px;
}

.sdk-icon-btn:hover {
  color: #2b85e4 !important;
}

.sdk-icon-btn-on {
  color: #f90 !important
}
</style>


