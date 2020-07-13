<template>
    <Modal v-model="group_create_modal_show" class="sdk-modal sdk-user-modal sdk-group-create-modal" draggable scrollable :title="modal_title" :width=400 :z-index="1000"
           v-on:on-cancel="on_hide_modal" v-on:on-visible-change="on_visible_change">
        <div class="sdk-user-list-container">
            <div style="padding:3px;">组名：</div>
            <Input v-model="tg_name" class="sdk-search-ipt" clearable placeholder="请输入组名"/>
            <div style="padding:3px;">选择组成员：</div>
            <Input v-model="user_search" class="sdk-search-ipt" search clearable placeholder="搜索组成员"/>
            <CheckboxGroup v-model="user_list_checked" class="sdk-checkbox">
                <div v-bind:key="item.uid" v-for="item in user_list">
                    <Checkbox :label="item.uid" v-show="!item.search_hide">
                        <Icon type="md-person" size="20" class="sdk-avatar"/>
                        <span class="sdk-uname">{{item.display_name}}</span>
                    </Checkbox>
                    <div class="sdk-item-line" v-show="!item.search_hide"></div>
                </div>
            </CheckboxGroup>
        </div>
        <div slot="footer">
            <div class="sdk-foot">
                <Button @click="createGroup">确定</Button>
                <Button @click="on_hide_modal">取消</Button>
            </div>
        </div>
    </Modal>
</template>

<script>
    import _ from "lodash";
    import {mapActions, mapState} from 'vuex'; //注册 action 和 state

    export default {
        name: 'GroupCreateModal',
        components: {},
        data() {
            //return store.state
            return {
                user_list_checked: [],
                user_list: [],
                user_search: '',
                tg_name: '',
                //title: this.oper_type == 'add' ? '添加成员' : '删除成员'
            }
        },
        props: {
            /*value: {
                type: Boolean,
                default: false
            },*/
            //username: String
            /*id: {
                type: Number,
                default: 0
            },
            oper_type: {
                type: String,
                default: ''
            },*/
        },
        created: function () {

        },
        destroyed: function () {
            /*let that = this;
            let login_uid = websdk.private_cache.login_uid;*/
        },
        methods: {

            createGroup() {
                let that = this;
                if (!that.tg_name) {
                    that.$Message.warning('请输入临时组名');
                    return false;
                }
                let mem_uids = null;
                let to_add_ids = that.user_list_checked;
                if (to_add_ids && to_add_ids.length > 0) {
                    mem_uids = to_add_ids;
                }
                window.websdk.request.groupRequest.createGroup(that.tg_name, mem_uids, null, function (rsp) {
                    if (rsp.cmd_status !== 0) {
                        rsp.error = rsp.error || '临时组创建失败';
                        that.$Message.warning(rsp.error);
                        return;
                    }
                    that.on_hide_modal();
                }, 'req_create_group_modal');//

            },

            on_hide_modal() {// XXX 当modal窗口发起$emit事件通知窗口关闭时，这里继续通知App.vue窗口已经关闭
                /* logger.debug('on_hide_modal im');
                 this.$emit('on-tg-create-cancel');*/
                let that = this;
                //that.$store.dispatch('hideIMUserListModal', that.id).then(() => {});
                that.hideGroupCreateModal(that.id);
            },

            on_visible_change(val) {
                if (val) {
                    let that = this;
                    //let login_uid = websdk.private_cache.login_uid;

                    that.tg_name = '';
                    that.user_search = '';
                    that.user_list = [];
                    that.user_list_checked = [];

                    window.websdk.request.userRequest.getUserInfo(null, null, function (rsp1) {
                        if (!rsp1.user_info) {
                            return;
                        }
                        that.user_list = rsp1.user_info;
                    }, 'req_user_profile_create_group');//

                } else {
                    //hide
                }

            },

            ...mapActions([
                'hideGroupCreateModal'
            ]),
            /*// 使用对象展开运算符将 getter 混入 computed 对象中
            ...mapGetters([
                // ...
            ])*/
        },

        watch: {
            // eslint-disable-next-line no-unused-vars
            user_search: function (newVal, oldVal) {
                let that = this;
                if (!newVal) {
                    for (let i in that.user_list) {
                        that.user_list[i].search_hide = false;
                    }
                } else {
                    // eslint-disable-next-line no-unused-vars
                    _.forEach(that.user_list, function (data, key) {
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
            group_create_modal_show: {
                get() {
                    //let that = this;
                    return this.$store.state.group_create_modal_show;
                },
                set(value) {
                    if (value) {
                        this.$store.dispatch('showGroupCreateModal', null).then(null);
                    } else {
                        this.$store.dispatch('hideGroupCreateModal', null).then(null);
                    }
                }
            },

            modal_title: {
                get() {
                    //return this.oper_type == 'add' ? '添加成员' : '删除成员';
                    return '创建临时组';
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


