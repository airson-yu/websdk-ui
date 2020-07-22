require('../../websdk-core/dist/websdk.core.bundle');
import vue_boot from "./view/main";
import logger from "./tools/logger";
import configApi from "./tools/configApi";

class websdkui {

    constructor() {
        this.vm = null;
        this.private_cache = {
            login_uid: null,
            login_user: {},
        };
        this.configApi = new configApi();//配置对象
        logger.debug('websdk_ui_version: 2020.07.20.01');
    }

    demo = () => {
        //let that = this;
        //window.websdk.request.authRequest.logon('39.105.135.70', 80, 10, 'websdkcu1', '123456', null, function (rsp) {
        window.websdk.request.authRequest.logon('39.106.213.127', 80, 28, 'websdkcu1', '123456', null, function (rsp) {
            logger.debug('init logon result:{}', rsp);
        }, 'app_demo_logon');//test_req_logon
        window.websdk.listeners.userStateNotice(function (rsp) {
            logger.debug('userStateNotice result:{}', rsp);
        });
    }

    init = (callback) => {
        // XXX client调用init方法要有回调，返回Init成功还是失败，失败原因 2019年3月5日12:38:12
        let that = this;
        // XXX 这里加个保护，禁止重复init，这样会造成UI组件重复显示 2020年7月2日15:12:9
        if (window.websdk.init_done === true) {
            logger.warn('repeated init ignore');
            return that;
        }
        window.websdk.init_done = true;

        if (window.is_ie) {
            logger.debug('websdkui init delay for ie');
            setTimeout(function () {
                let processor = window.websdk.core.processor;
                processor.replace_local_ip_for_ie();//replace_local_ip_for_ie
                that.vm = vue_boot.init(processor, callback);// init
                //window.websdk.init_done = true;
                return that;
            }, 0);// 0 is necessary
        } else {
            let processor = window.websdk.core.processor;
            that.vm = vue_boot.init(processor, callback);
            //window.websdk.init_done = true;
            return that;
        }

    }

}

// XXX init ui, mount to window.websdk
window.websdk.websdkui = new websdkui();

// FIXME set false when release
window.debug = false;

if (window.debug) {
    window.websdk.init(function (result) {
        logger.debug('init:{}', JSON.stringify(result));
        window.websdk.websdkui.demo();
        window.websdk.websdkui.configApi.set_video_close_action(2);
    });
}

export default websdkui;
