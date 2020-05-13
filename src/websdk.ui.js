require('../../websdk-core/dist/websdk.core.bundle');
import vue_boot from "./view/main";
import logger from "./tools/logger";

class websdkui {
    constructor() {
        this.vm = null;
        this.private_cache = {
            login_uid: null,
            login_user: {},
        };
        logger.debug('websdk_ui_version: 2020.05.11.01');
    }

    demo = () => {
        let that = this;
        window.websdk.request.authRequest.logon('39.105.135.70', 80, 10, 'websdkcu1', '123456', null, function (rsp) {
            logger.debug('init logon result:{}', rsp);
        }, 'app_demo_logon');//test_req_logon
        window.websdk.listeners.userStateNotice(function (rsp) {
            logger.debug('userStateNotice result:{}', rsp);
        });
    }

    init = (callback) => {
        // XXX client调用init方法要有回调，返回Init成功还是失败，失败原因 2019年3月5日12:38:12
        let processor = window.websdk.core.processor;
        this.vm = vue_boot.init(processor, callback);
        return this;
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
    });
}

export default websdkui;
