import Vue from 'vue'
import App from './App.vue'
import store from './store'
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import './my-theme/index.less';
import './my-theme/default/default_blue.less';
import Result from "../tools/result";
import 'iview/dist/styles/fonts/ionicons.ttf';
import 'iview/dist/styles/fonts/ionicons.woff';
import 'iview/dist/styles/fonts/ionicons.svg';
import logger from "../tools/logger";
/*import AdminOnline from 'assets/img/AdminOnline.png';
import AdminOffline from 'assets/img/AdminOffline.png';*/
/*import {Button, Table, Modal} from 'iview';

Vue.component('Button', Button);
Vue.component('Table', Table);
Vue.component('Modal', Modal);*/

Vue.use(iView);

/*import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import iView from 'iview'
import i18n from './locale'
import config from './config'
import importDirective from './directive'
import 'iview/dist/styles/iview.css'
import './index.less'
import './assets/icons/iconfont.css'

Vue.use(iView, {
    i18n: (key, value) => i18n.t(key, value)
});
Vue.config.productionTip = false;
/!**
 * @description 全局注册应用配置
 *!/
Vue.prototype.$config = config;
/!**
 * 注册指令
 *!/
importDirective(Vue);

new Vue({
    router,
    i18n,
    store,
    render: h => h(App)
}).$mount('#app');*/

Vue.config.productionTip = false;

export default {
    name: 'vue_init',
    //vue_root: null,
    init: (processor, callback) => {
        try {
            const container_dom_id = 'webapp'; // XXX processor.js hard code
            let container_dom = document.getElementById(container_dom_id);
            if (container_dom) {
                container_dom.innerHTML = '';
            } else {
                let node = document.createElement('div');
                node.setAttribute('id', container_dom_id);
                //document.body.append(node);
                document.body.appendChild(node);
            }
            let vue_root =
                new Vue({
                    store,
                    render: h => h(App),
                });
            vue_root.$mount('#' + container_dom_id);

            //return new View().init(store);
            //return vue_root;

            window.websdk.vm = vue_root;
            window.websdk.core.processor.init(vue_root, callback);

        } catch (e) {
            logger.error(e);
            callback && callback(processor.build_rsp_fail(Result.vue_init_error));
            //return null;
        }
    }
}


