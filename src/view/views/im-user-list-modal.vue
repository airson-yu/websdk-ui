<template>
    <Modal v-model="user_list_modal_show" class="sdk-modal sdk-user-modal sdk-user-list-modal" scrollable :title="modal_title"
           :width=400 :z-index="1000" :mask="false" v-on:on-cancel="on_hide_modal" v-on:on-visible-change="on_visible_change">
        <div class="sdk-user-list-container">
            <Tabs size="small" class="sdk-tabs">
                <TabPane label="个人">
                    <Input v-model="user_search" class="sdk-search-ipt" search clearable placeholder=""/>
                    <div class="sdk-search-line"></div>
                    <CheckboxGroup v-model="user_list_checked" class="sdk-checkbox">
                        <div v-bind:key="item.uid" v-for="item in user_list">
                            <Checkbox :label="item.uid" v-show="!item.search_hide">
                                <Icon type="md-person" size="20" class="sdk-avatar"/>
                                <span class="sdk-uname">{{item.display_name}}</span>
                            </Checkbox>
                            <div class="sdk-item-line" v-show="!item.search_hide"></div>
                        </div>
                    </CheckboxGroup>
                </TabPane>
                <!--<TabPane label="调度台">功能正在开发中</TabPane>-->
            </Tabs>
        </div>
        <div slot="footer">
            <div class="sdk-foot">
                <Button @click="addOrRemoveGroupMember">确定</Button>
                <Button @click="on_hide_modal">取消</Button>
            </div>
        </div>
    </Modal>
</template>

<script>
    import _ from "lodash";
    import {mapActions, mapState} from 'vuex'; //注册 action 和 state
    import $ from 'jquery';
    import 'jquery-ui/ui/widgets/draggable';

    export default {
        name: 'IMUserListModal',
        components: {},
        data() {
            //return store.state
            return {
                user_list_old_mem_ids: [],
                user_list_checked: [],
                user_list: [],
                user_search: '',
                //title: this.oper_type == 'add' ? '添加成员' : '删除成员'
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
            oper_type: {
                type: String,
                default: ''
            },
        },
        mounted: function () {
          $('.sdk-user-list-modal .ivu-modal').draggable();
        },
        created: function () {

        },
        destroyed: function () {
            /*let that = this;
            let login_uid = websdk.private_cache.login_uid;*/
        },
        methods: {

            addOrRemoveGroupMember() {
                let that = this;
                if (that.oper_type == 'add') {
                    let to_add_ids = _.difference(that.user_list_checked, that.user_list_old_mem_ids);
                    if (to_add_ids && to_add_ids.length > 0) {
                        // eslint-disable-next-line no-unused-vars
                        window.websdk.request.groupRequest.addGroupMember(that.id, to_add_ids, null, function (rsp) {
                            //
                        }, 'req_add_group_member_im_user_list');//
                    }
                } else if (that.oper_type == 'remove') {
                    if (that.user_list_checked && that.user_list_checked.length > 0) {
                        // eslint-disable-next-line no-unused-vars
                        window.websdk.request.groupRequest.removeGroupMember(that.id, that.user_list_checked, null, function (rsp) {
                            //
                        }, 'req_remove_group_member_im_user_list');//
                    }
                }
                that.on_hide_modal();
            },

            on_hide_modal() {// XXX 当modal窗口发起$emit事件通知窗口关闭时，这里继续通知App.vue窗口已经关闭
                /* logger.debug('on_hide_modal im');
                 this.$emit('on-user-list-cancel');*/
                let that = this;
                //that.$store.dispatch('hideIMUserListModal', that.id).then(() => {});
                that.hideIMUserListModal(that.id);
            },

            on_visible_change(val) {
                if (val) {
                    let that = this;
                    //let login_uid = websdk.private_cache.login_uid;

                    that.user_search = '';
                    that.user_list = [];
                    that.user_list_checked = [];
                    that.user_list_old_mem_ids = [];

                    if (that.oper_type == 'add') {
                        window.websdk.request.userRequest.getUserInfo(null, null, function (rsp1) {
                            if (!rsp1.user_info) {
                                return;
                            }
                            that.user_list = rsp1.user_info;

                            window.websdk.request.groupRequest.getGroupInfo([that.id], function (rsp2) {
                                if (!rsp2.group_info) {
                                    return;
                                }
                                let tg = rsp2.group_info[0];
                                let uids = tg.uids;
                                if (uids && uids.length > 0) {
                                    that.user_list_checked = uids;
                                    that.user_list_old_mem_ids = uids;
                                    /*websdk.request.userRequest.getUserInfo(uids, null, function (rsp3) {
                                        let mem = rsp3.user_info;
                                        if (mem && mem.length > 0) {
                                            that.user_list_checked.push(mem[i].uid);
                                            for (let i in mem) {
                                                for (let j in that.user_list) {
                                                    if (that.user_list[i].uid = mem[i].uid) {
                                                        that.user_list_checked.push(mem[i].uid);
                                                    }
                                                }
                                            }
                                        }
                                    }, 'req_user_profile_im_tg_mem');//*/
                                }
                            }, 'req_grp_profile_im_user_list_tg_add_mem');//

                        }, 'req_user_profile_im_user_list_add');//

                    } else if (that.oper_type == 'remove') {

                        window.websdk.request.groupRequest.getGroupInfo([that.id], function (rsp2) {
                            if (!rsp2.group_info) {
                                return;
                            }
                            let tg = rsp2.group_info[0];
                            let uids = tg.uids;
                            if (uids && uids.length > 0) {
                                window.websdk.request.userRequest.getUserInfo(uids, null, function (rsp3) {
                                    if (!rsp3.user_info) {
                                        return;
                                    }
                                    let mem = rsp3.user_info;
                                    if (mem && mem.length > 0) {
                                        that.user_list = mem;
                                    }
                                }, 'req_user_profile_im_user_list_remove_mem');//
                            }
                        }, 'req_grp_profile_im_user_list_tg_remove_mem');//

                    }
                } else {
                    //hide
                }

            },

            ...mapActions([
                'hideIMUserListModal'
            ]),
            /*// 使用对象展开运算符将 getter 混入 computed 对象中
            ...mapGetters([
                // ...
            ])*/
        },

        watch: {
            user_search: function (newVal) {
                let that = this;
                if (!newVal) {
                    for (let i in that.user_list) {
                        that.user_list[i].search_hide = false;
                    }
                } else {
                    _.forEach(that.user_list, function (data) {
                        if (data.display_name.indexOf(newVal) > -1) {
                            data.search_hide = false;
                        } else {
                            data.search_hide = true;
                        }
                    });
                }

            }
        },

        computed: {
            user_list_modal_show: {
                get() {
                    let that = this;
                    let show = false;
                    /*_.forEach(this.$store.state.im, function (data, key) {
                        if (data.id === that.id) {
                            show = data.user_list_modal_show;
                        }
                    });*/
                    let data = this.$store.state.im[that.id];
                    if (data) {
                        show = data.user_list_modal_show;
                    }
                    return show;
                },
                set(value) {
                    if (value) {
                        this.$store.dispatch('showIMUserListModal', {'id': this.id, 'reload': true}).then(null);
                    } else {
                        this.$store.dispatch('hideIMUserListModal', this.id).then(null);
                    }
                }
            },

            modal_title: {
                get() {
                    return this.oper_type == 'add' ? '添加成员' : '删除成员';
                },
            },

            // 使用对象展开运算符将此对象混入到外部对象中
            ...mapState([
                // 映射 this.user_modal_show 为 store.state.user_modal_show
                //'user_modal_show'
            ]),
        },
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped src="../assets/css/user-group-modal.less"></style>


